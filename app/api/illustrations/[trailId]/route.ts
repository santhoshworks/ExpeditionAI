import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { trailId: string } }
) {
    try {
        const { trailId } = params

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

        // Get illustration data with ownership verification
        const { data: illustration, error: illustrationError } = await supabase
            .from('trail_illustrations')
            .select(`
        id,
        illustration_query,
        generated_at,
        trails!inner(
          id,
          title,
          expeditions!inner(user_id)
        )
      `)
            .eq('trail_id', trailId)
            .single()

        if (illustrationError || !illustration) {
            return NextResponse.json(
                { error: 'No illustration found for this trail' },
                { status: 404 }
            )
        }

        // Verify ownership
        const trailData = illustration.trails as any
        const expeditionData = trailData.expeditions as any
        if (expeditionData.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json({
            id: illustration.id,
            query: illustration.illustration_query,
            generatedAt: illustration.generated_at,
            trailTitle: trailData.title,
        })

    } catch (error) {
        console.error('Get illustration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}