import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateObject } from "ai"
import { z } from "zod"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

export async function POST(request: NextRequest) {
    try {
        // Check if OpenRouter API key is available
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "AI service not configured" },
                { status: 503 }
            )
        }

        const { expeditionId, content } = await request.json()

        if (!expeditionId) {
            return NextResponse.json(
                { error: "Expedition ID is required" },
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

        // Get expedition content if not provided
        let quizContent = content
        if (!quizContent) {
            const { data: expedition, error: expeditionError } = await supabase
                .from('expeditions')
                .select(`
                    *,
                    trails(
                        *,
                        messages(content, role)
                    )
                `)
                .eq('id', expeditionId)
                .or(`user_id.eq.${user.id},is_public.eq.true`)
                .single()

            if (expeditionError || !expedition) {
                return NextResponse.json(
                    { error: "Expedition not found" },
                    { status: 404 }
                )
            }

            // Compile content from trails and messages
            const trailContents = expedition.trails?.map((trail: any) => {
                const messages = trail.messages
                    ?.filter((m: any) => m.role === 'assistant')
                    ?.map((m: any) => m.content)
                    ?.join('\n') || ''
                return `Trail: ${trail.title}\n${trail.source_text || ''}\n${messages}`
            }).join('\n\n')

            quizContent = `Expedition: ${expedition.title}\n\n${trailContents}`
        }

        // Generate quiz questions using AI
        const systemPrompt = `You are an expert educator creating quiz questions to test understanding of educational content.

Generate 5 multiple-choice questions based on the provided content. Each question should:
1. Test understanding of key concepts
2. Have 4 answer options
3. Have exactly one correct answer
4. Include a brief explanation for the correct answer

Return questions that progress from basic recall to deeper understanding.`

        const quizSchema = z.object({
            questions: z.array(z.object({
                question: z.string(),
                options: z.array(z.string()).length(4),
                correctIndex: z.number().min(0).max(3),
                explanation: z.string()
            })).length(5)
        })

        const { object: quizData } = await generateObject({
            model: openrouter("openai/gpt-4o-mini"),
            schema: quizSchema,
            system: systemPrompt,
            prompt: `Generate quiz questions based on this content:\n\n${quizContent.substring(0, 8000)}`,
        })

        return NextResponse.json({
            success: true,
            questions: quizData.questions
        })

    } catch (error) {
        console.error('Error generating quiz:', error)
        return NextResponse.json(
            { error: "Failed to generate quiz" },
            { status: 500 }
        )
    }
}
