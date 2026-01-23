import { NextRequest, NextResponse } from "next/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { z } from "zod"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

const chatRequestSchema = z.object({
    message: z.string().min(1).max(2000),
    topic: z.string(),
    messageHistory: z.array(z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string()
    })).optional()
})

const MAX_DEMO_MESSAGES = 10

export async function POST(request: NextRequest) {
    try {
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: "AI service not configured" },
                { status: 503 }
            )
        }

        const body = await request.json()
        const { message, topic, messageHistory = [] } = chatRequestSchema.parse(body)

        // Check message limit (count user messages only)
        const userMessageCount = messageHistory.filter(m => m.role === "user").length
        if (userMessageCount >= MAX_DEMO_MESSAGES) {
            return NextResponse.json(
                {
                    error: "Demo limit reached",
                    isLimitReached: true,
                    upgradePrompt: "Sign up for unlimited messages and save your progress!"
                },
                { status: 429 }
            )
        }

        // Build system context
        const systemContext = `You are an AI learning assistant helping a user explore "${topic}" in demo mode.

Your role:
1. Provide clear, educational responses
2. Break down complex topics into understandable parts
3. Encourage curiosity and deeper learning
4. Be engaging and supportive

This is a demo with a 10-message limit. Keep responses focused and valuable.`

        // Convert message history to AI format
        const aiMessages = messageHistory.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
        }))

        // Add current user message
        aiMessages.push({
            role: "user",
            content: message
        })

        // Stream the AI response
        const result = await streamText({
            model: openrouter("openai/gpt-4o-mini"),
            system: systemContext,
            messages: aiMessages,
            temperature: 0.7,
            maxTokens: 800,
        })

        // Convert stream to Response
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()

                try {
                    for await (const chunk of result.textStream) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
                    }
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
                } catch (error) {
                    console.error("Streaming error:", error)
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`))
                } finally {
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        })

    } catch (error) {
        console.error("Demo chat error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request format" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        )
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    })
}
