import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateObject } from "ai"
import { z } from "zod"
import { PDFProcessorChain } from "@/lib/pdf-processing"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

export async function POST(request: NextRequest) {
    console.log("PDF to Expedition API called");
    try {
        // Check if OpenRouter API key is available
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "AI service not configured. Please contact support." },
                { status: 503 }
            )
        }

        const formData = await request.formData()
        const pdfFile = formData.get("pdf") as File

        if (!pdfFile) {
            return NextResponse.json(
                { error: "PDF file is required" },
                { status: 400 }
            )
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required. Please sign in to create expeditions." },
                { status: 401 }
            )
        }

        // Parse PDF content using processor chain
        const pdfProcessor = new PDFProcessorChain()
        const processingResult = await pdfProcessor.process(pdfFile)

        if (!processingResult.success) {
            const error = processingResult.error!
            console.error('PDF processing failed:', error.technicalDetails)

            return NextResponse.json(
                {
                    error: error.message,
                    details: error.technicalDetails,
                    suggestedAction: error.suggestedAction,
                    processorsFailed: processingResult.fallbacksAttempted
                },
                { status: error.type === 'user_error' ? 400 : 500 }
            )
        }

        const textContent = processingResult.content!
        console.log(`PDF processed successfully with ${processingResult.processorUsed}, content length: ${textContent.length}`)

        // Content is already truncated and sanitized by the processor chain

        // Generate expedition structure using AI
        const systemPrompt = `You are an expert at analyzing documents and creating structured learning paths. 

Given a text from a PDF document, create a comprehensive learning expedition with multiple trails (topics) that branch from the main content.

Analyze the text and identify:
1. Main thesis and key arguments
2. Sub-sections or chapters that should be separate trails
3. Important concepts that require detailed explanation
4. Key questions that the document answers

Return a JSON structure with:
- expedition_title: A clear, engaging title based on the document
- expedition_description: A brief description of what the document covers
- trails: An array of trail objects, each with:
  - title: Trail name
  - description: What this trail explores
  - source_text: Theoretical excerpt or summary from the text relevant to this trail
  - is_base_camp: true for the main overview/summary, false for branches
  - position: number (order)
  - suggested_questions: Array of questions to explore in this trail

Create 1 base camp trail (Overview) and 4-6 branch trails for deeper exploration of specific sections.`

        const userPrompt = `Here is the content of the document (${textContent.length} characters):
        
${textContent}

Please analyze this content and create a structured learning expedition.`

        // Define the expected structure for the AI response
        const expeditionSchema = z.object({
            expedition_title: z.string(),
            expedition_description: z.string(),
            trails: z.array(z.object({
                title: z.string(),
                description: z.string(),
                source_text: z.string(),
                is_base_camp: z.boolean(),
                position: z.number().optional(),
                suggested_questions: z.array(z.string())
            }))
        })

        // Call AI to generate expedition structure
        const { object: expeditionData } = await generateObject({
            model: openrouter("openai/gpt-4o-mini"),
            schema: expeditionSchema,
            system: systemPrompt,
            prompt: userPrompt,
        })

        // Validate that we have trails
        if (!expeditionData.trails || expeditionData.trails.length === 0) {
            return NextResponse.json(
                { error: "Could not generate learning trails from this document." },
                { status: 400 }
            )
        }

        // Create expedition in database
        const { data: expedition, error: expeditionError } = await supabase
            .from('expeditions')
            .insert({
                user_id: user.id,
                title: expeditionData.expedition_title,
                description: expeditionData.expedition_description
            })
            .select()
            .single()

        if (expeditionError) {
            console.error('Database error creating expedition:', expeditionError)
            return NextResponse.json(
                { error: "Failed to create expedition. Please try again." },
                { status: 500 }
            )
        }

        // Create trails
        const trails = []
        for (let i = 0; i < expeditionData.trails.length; i++) {
            const trailData = expeditionData.trails[i]

            const { data: trail, error: trailError } = await supabase
                .from('trails')
                .insert({
                    expedition_id: expedition.id,
                    title: trailData.title,
                    source_text: trailData.source_text,
                    is_base_camp: trailData.is_base_camp,
                    position: trailData.position || i
                })
                .select()
                .single()

            if (trailError) {
                console.error('Error creating trail:', trailError)
                continue
            }

            // Add initial system message with suggested questions
            if (trailData.suggested_questions && trailData.suggested_questions.length > 0) {
                await supabase
                    .from('messages')
                    .insert({
                        trail_id: trail.id,
                        role: 'system',
                        content: `Welcome to this trail! Here are some key questions from the document:\n\n${trailData.suggested_questions.map((q: string, idx: number) => `${idx + 1}. ${q}`).join('\n')}\n\nAsk me anything about this section!`
                    })
            }

            trails.push(trail)
        }

        return NextResponse.json({
            success: true,
            expedition: {
                id: expedition.id,
                title: expedition.title,
                description: expedition.description
            },
            trails: trails.length
        })

    } catch (error) {
        console.error('Error creating PDF expedition:', error)

        // Provide more specific error messages based on error type
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return NextResponse.json(
                    { error: "AI service configuration error. Please contact support." },
                    { status: 503 }
                )
            }
            if (error.message.includes('rate limit')) {
                return NextResponse.json(
                    { error: "Service temporarily unavailable. Please try again in a moment." },
                    { status: 429 }
                )
            }
            if (error.message.includes('token')) {
                return NextResponse.json(
                    { error: "Document is too complex to process. Please try a shorter document." },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json(
            {
                error: "Failed to process PDF. Please ensure it is a valid text-based PDF and try again.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}
