import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserCredits, deductCredits } from '@/lib/credits'
import { generateIllustrationWithOpenRouter, getUserOpenRouterKey } from '@/lib/openrouter-image'

// Cost for illustration generation (in credits)
const ILLUSTRATION_COST = 2

export async function POST(request: NextRequest) {
    try {
        const { trailId, topic } = await request.json()

        if (!trailId || !topic) {
            return NextResponse.json(
                { error: 'Trail ID and topic are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user has enough credits
        const userCredits = await getUserCredits(user.id)
        if (!userCredits || userCredits.credits < ILLUSTRATION_COST) {
            return NextResponse.json(
                { error: 'Insufficient credits for illustration generation' },
                { status: 402 }
            )
        }

        // Verify trail exists and belongs to user
        const { data: trail, error: trailError } = await supabase
            .from('trails')
            .select('id, expedition_id, expeditions!inner(user_id)')
            .eq('id', trailId)
            .single()

        if (trailError || !trail) {
            return NextResponse.json({ error: 'Trail not found' }, { status: 404 })
        }

        // Type assertion for the nested expedition data from joined query
        const trailData = trail as {
            id: string
            expedition_id: string
            expeditions: { user_id: string }
        }
        if (trailData.expeditions.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Get user's OpenRouter API key (if they have one)
        const userApiKey = await getUserOpenRouterKey(user.id)

        // Generate illustration using OpenRouter
        const result = await generateIllustrationWithOpenRouter(topic, userApiKey || undefined)

        // Store the query and description in database
        // Type assertion needed as trail_illustrations table types aren't generated
        const { data: illustration, error: insertError } = await (supabase
            .from('trail_illustrations') as any)
            .upsert({
                trail_id: trailId,
                illustration_query: result.prompt,
                generated_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (insertError) {
            console.error('Failed to store illustration query:', insertError)
            return NextResponse.json(
                { error: 'Failed to store illustration data' },
                { status: 500 }
            )
        }

        // Deduct credits
        const deductionResult = await deductCredits(user.id, 'illustration', 0, 0)
        if (!deductionResult.success) {
            return NextResponse.json(
                { error: 'Failed to deduct credits' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            imageUrl: result.imageUrl,
            query: result.prompt,
            description: result.description,
            creditsUsed: ILLUSTRATION_COST,
            remainingCredits: deductionResult.remainingCredits,
        })

    } catch (error) {
        console.error('Illustration generation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}