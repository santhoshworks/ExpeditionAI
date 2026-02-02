import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateIllustrationWithOpenRouter, getUserOpenRouterKey } from '@/lib/openrouter-image'

export async function POST(request: NextRequest) {
    try {
        const { trailId } = await request.json()

        if (!trailId) {
            return NextResponse.json(
                { error: 'Trail ID is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get existing illustration query
        // Type assertion needed as trail_illustrations table types aren't generated
        const { data: illustration, error: illustrationError } = await (supabase
            .from('trail_illustrations') as any)
            .select('illustration_query, trails!inner(expedition_id, expeditions!inner(user_id))')
            .eq('trail_id', trailId)
            .single()

        if (illustrationError || !illustration) {
            return NextResponse.json(
                { error: 'No illustration found for this trail' },
                { status: 404 }
            )
        }

        // Type assertion for the nested data from joined query
        const illustrationData = illustration as {
            illustration_query: string
            trails: {
                expedition_id: string
                expeditions: { user_id: string }
            }
        }

        // Verify ownership
        if (illustrationData.trails.expeditions.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Extract the original topic from the stored query for regeneration
        const originalQuery = illustrationData.illustration_query

        // Try to extract topic from the query, or use the query itself
        const topicMatch = originalQuery.match(/representing: (.+?)\./) ||
            originalQuery.match(/about: (.+?)\./) ||
            originalQuery.match(/illustrating (.+?)\./)

        const topic = topicMatch ? topicMatch[1] : originalQuery

        // Get user's OpenRouter API key (if they have one)
        const userApiKey = await getUserOpenRouterKey(user.id)

        // Regenerate illustration using OpenRouter with the original topic
        const result = await generateIllustrationWithOpenRouter(topic, userApiKey || undefined)

        // Update the generated_at timestamp and potentially new query
        const { error: updateError } = await (supabase
            .from('trail_illustrations') as any)
            .update({
                generated_at: new Date().toISOString(),
                illustration_query: result.prompt // Update with new AI-generated prompt
            })
            .eq('trail_id', trailId)

        if (updateError) {
            console.error('Failed to update illustration timestamp:', updateError)
        }

        return NextResponse.json({
            success: true,
            imageUrl: result.imageUrl,
            query: result.prompt,
            description: result.description,
        })

    } catch (error) {
        console.error('Illustration regeneration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
