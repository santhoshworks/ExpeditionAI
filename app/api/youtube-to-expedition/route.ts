import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateObject } from "ai"
import { z } from "zod"
import { YouTubeProcessorChain } from "@/lib/youtube-processing"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

export async function POST(request: NextRequest) {
    try {
        // Check if OpenRouter API key is available
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "AI service not configured. Please contact support." },
                { status: 503 }
            )
        }

        const { youtubeUrl } = await request.json()

        if (!youtubeUrl) {
            return NextResponse.json(
                { error: "YouTube URL is required" },
                { status: 400 }
            )
        }

        // Validate YouTube URL and extract video ID
        const videoId = YouTubeProcessorChain.extractVideoId(youtubeUrl)
        if (!videoId) {
            return NextResponse.json(
                { error: "Invalid YouTube URL. Please provide a valid YouTube video link." },
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

        // Process YouTube video using processor chain
        const youtubeProcessor = new YouTubeProcessorChain()
        const processingResult = await youtubeProcessor.processVideo(youtubeUrl)

        if (!processingResult.success) {
            const error = processingResult.error!
            console.error('YouTube processing failed:', error.technicalDetails)

            return NextResponse.json(
                {
                    error: error.message,
                    details: error.technicalDetails,
                    suggestedAction: error.suggestedAction,
                    processorsFailed: processingResult.fallbacksAttempted,
                    retryAfter: error.retryAfter
                },
                { status: error.type === 'user_error' ? 400 : error.type === 'rate_limit' ? 429 : 500 }
            )
        }

        const transcript = processingResult.transcript!
        const metadata = processingResult.metadata!

        console.log(`YouTube processed successfully with ${processingResult.processorUsed}, transcript length: ${transcript.length}`)

        // Generate expedition structure using AI
        const systemPrompt = `You are an expert at analyzing educational content and creating structured learning paths. 

Given a YouTube video transcript, create a comprehensive learning expedition with multiple trails (topics) that branch from the main content.

Analyze the transcript and identify:
1. Main topics and concepts
2. Subtopics that could be explored deeper
3. Related concepts that learners might want to investigate
4. Key questions that arise from the content

Return a JSON structure with:
- expedition_title: A clear, engaging title for the learning expedition
- expedition_description: A brief description of what learners will explore
- trails: An array of trail objects, each with:
  - title: Trail name
  - description: What this trail explores
  - source_text: The specific part of the transcript that inspired this trail
  - is_base_camp: true for the main trail, false for branches
  - suggested_questions: Array of questions to explore in this trail

Create 1 base camp trail (main topic) and 3-5 branch trails for deeper exploration.`

        const userPrompt = `Video Title: ${metadata.title}
Video Description: ${metadata.description}
Channel: ${metadata.channelTitle}

Transcript:
${transcript}

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
                { error: "Could not generate learning trails from this video content." },
                { status: 400 }
            )
        }

        // Create expedition in database
        const { data: expedition, error: expeditionError } = await supabase
            .from('expeditions')
            .insert({
                user_id: user.id,
                title: expeditionData.expedition_title || `Learning from: ${metadata.title}`,
                description: expeditionData.expedition_description || `Exploring concepts from the YouTube video: ${metadata.title}`
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
                    is_base_camp: trailData.is_base_camp || i === 0,
                    position: i
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
                        content: `Welcome to this trail! Here are some questions to explore:\n\n${trailData.suggested_questions.map((q: string, idx: number) => `${idx + 1}. ${q}`).join('\n')}\n\nFeel free to ask about any of these topics or explore your own questions!`
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
            trails: trails.length,
            videoMetadata: metadata
        })

    } catch (error) {
        console.error('Error creating YouTube expedition:', error)

        // Provide more specific error messages
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
                    { error: "Video content is too long to process. Please try a shorter video." },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json(
            {
                error: "Failed to create expedition from YouTube video. Please try again.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}