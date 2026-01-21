import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
    try {
        const { expeditionId, score, totalQuestions, challengerName } = await request.json()

        if (!expeditionId || score === undefined || !totalQuestions) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            )
        }

        // Verify expedition exists and user has access
        const { data: expedition, error: expeditionError } = await supabase
            .from('expeditions')
            .select('id, title, is_public')
            .eq('id', expeditionId)
            .or(`user_id.eq.${user.id},is_public.eq.true`)
            .single()

        if (expeditionError || !expedition) {
            return NextResponse.json(
                { error: "Expedition not found or access denied" },
                { status: 404 }
            )
        }

        // Create challenge record


        // Create challenge record
        const challengeId = nanoid(10)
        const percentage = Math.round((score / totalQuestions) * 100)

        // Store challenge in the database
        const { error: insertError } = await supabase
            .from('quiz_challenges')
            .insert({
                id: challengeId,
                expedition_id: expeditionId,
                challenger_id: user.id,
                challenger_name: challengerName || 'Anonymous',
                score,
                total_questions: totalQuestions,
                percentage
            })

        if (insertError) {
            console.error('Error inserting challenge:', insertError)
            throw insertError
        }

        const challengeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/challenge/${challengeId}`

        return NextResponse.json({
            success: true,
            challengeId,
            challengeUrl,
            expedition: {
                id: expedition.id,
                title: expedition.title
            },
            score: {
                correct: score,
                total: totalQuestions,
                percentage
            }
        })

    } catch (error) {
        console.error('Error creating quiz challenge:', error)
        return NextResponse.json(
            { error: "Failed to create challenge" },
            { status: 500 }
        )
    }
}