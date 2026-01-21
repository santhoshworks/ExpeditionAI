import { NextRequest, NextResponse } from "next/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { z } from "zod"
import { DemoSessionManager, DemoLimitsEnforcer } from "@/lib/demo-session"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

const chatRequestSchema = z.object({
    message: z.string().min(1).max(2000),
    expeditionId: z.string(),
    trailId: z.string(),
    expeditionTitle: z.string().optional(),
    trailTitle: z.string().optional(),
    trailSourceText: z.string().optional(),
    isBaseCamp: z.boolean().optional(),
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

        const body = await request.json()
        const {
            message,
            expeditionId,
            trailId,
            expeditionTitle,
            trailTitle,
            trailSourceText,
            isBaseCamp
        } = chatRequestSchema.parse(body)

        // Initialize demo session manager and limits enforcer
        const sessionManager = new DemoSessionManager()
        const limitsEnforcer = new DemoLimitsEnforcer(sessionManager)

        // Check if expedition exists
        const expedition = sessionManager.getExpedition(expeditionId)
        if (!expedition) {
            return NextResponse.json(
                { error: "Demo expedition not found. Please create a new demo." },
                { status: 404 }
            )
        }

        // Check message limits
        const messageCheck = limitsEnforcer.checkMessageLimit(expeditionId, trailId)
        if (!messageCheck.allowed) {
            return NextResponse.json(
                {
                    error: messageCheck.reason,
                    isLimitReached: true,
                    upgradePrompt: "Sign up for unlimited messages and save your progress!"
                },
                { status: 429 }
            )
        }

        // Add user message to session
        const userMessageAdded = sessionManager.addMessage(expeditionId, trailId, {
            role: 'user',
            content: message
        })

        if (!userMessageAdded) {
            return NextResponse.json(
                {
                    error: "Failed to add message. Demo limit may have been reached.",
                    isLimitReached: true
                },
                { status: 429 }
            )
        }

        // Get conversation history
        const messages = sessionManager.getTrailMessages(expeditionId, trailId)

        // Build context for AI
        const systemContext = `You are an AI learning assistant helping users explore topics in an interactive learning expedition called "${expeditionTitle || 'Demo Expedition'}".

Current Trail: "${trailTitle || 'Learning Trail'}"
${trailSourceText ? `Trail Context: ${trailSourceText}` : ''}
${isBaseCamp ? 'This is the base camp trail - the starting point for exploration.' : 'This is a specialized trail for deeper exploration.'}

IMPORTANT: This is a demo session with limitations:
- 10 messages per trail maximum
- 5 trails maximum per expedition
- Progress is not saved (resets on refresh)

Your role:
1. Provide helpful, educational responses about the topic
2. Encourage deeper learning and curiosity
3. Suggest related concepts they might want to explore
4. Be engaging and supportive
5. Occasionally remind them of demo limitations and benefits of signing up

Keep responses focused, informative, and encouraging. If they ask about creating new trails or topics, remind them of the 5-trail demo limit.`

        // Convert demo messages to AI format
        const aiMessages = messages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
        }))

        // Stream the AI response
        const result = await streamText({
            model: openrouter("openai/gpt-4o-mini"),
            system: systemContext,
            messages: aiMessages,
            temperature: 0.7,
            maxTokens: 1000,
        })

        // Convert the stream to a Response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()
                let fullResponse = ''

                try {
                    for await (const chunk of result.textStream) {
                        fullResponse += chunk
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
                    }

                    // Add assistant message to session after streaming completes
                    sessionManager.addMessage(expeditionId, trailId, {
                        role: 'assistant',
                        content: fullResponse
                    })

                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
                } catch (error) {
                    console.error('Streaming error:', error)
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`))
                } finally {
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })

    } catch (error) {
        console.error('Demo chat error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request format" },
                { status: 400 }
            )
        }

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
        }

        return NextResponse.json(
            { error: "Failed to process message. Please try again." },
            { status: 500 }
        )
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}