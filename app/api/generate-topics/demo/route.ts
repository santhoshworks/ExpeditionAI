import { NextRequest, NextResponse } from "next/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateObject } from "ai"
import { z } from "zod"
import { DemoSessionManager, DemoLimitsEnforcer } from "@/lib/demo-session"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

const generateTopicsRequestSchema = z.object({
    expeditionId: z.string(),
    expeditionTitle: z.string(),
    currentTrailTitle: z.string().optional(),
    currentTrailText: z.string().optional(),
    existingTopics: z.array(z.string()).optional(),
    count: z.number().min(1).max(5).default(3),
})

const topicSchema = z.object({
    topics: z.array(z.object({
        topic: z.string().min(1).max(100),
        description: z.string().min(10).max(300),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        estimatedTime: z.string(),
    })).max(5)
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
            expeditionId,
            expeditionTitle,
            currentTrailTitle,
            currentTrailText,
            existingTopics = [],
            count
        } = generateTopicsRequestSchema.parse(body)

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

        // Check trail limits
        const trailCheck = limitsEnforcer.checkTrailLimit(expeditionId)
        if (!trailCheck.allowed) {
            return NextResponse.json(
                {
                    error: trailCheck.reason,
                    isLimitReached: true,
                    upgradePrompt: "Sign up for unlimited trails and save your progress!"
                },
                { status: 429 }
            )
        }

        // Limit count to remaining trails
        const maxCount = Math.min(count, trailCheck.remainingTrails || 0)
        if (maxCount === 0) {
            return NextResponse.json(
                {
                    error: "No remaining trails available in demo mode.",
                    isLimitReached: true,
                    upgradePrompt: "Sign up for unlimited trails!"
                },
                { status: 429 }
            )
        }

        // Build context for AI
        const context = `You are generating learning topics for an educational expedition called "${expeditionTitle}".

${currentTrailTitle ? `Current trail: "${currentTrailTitle}"` : ''}
${currentTrailText ? `Current context: ${currentTrailText.substring(0, 500)}...` : ''}

${existingTopics.length > 0 ? `Existing topics to avoid duplicating: ${existingTopics.join(', ')}` : ''}

Generate ${maxCount} related learning topics that would be interesting to explore. Each topic should:
1. Be related to the main expedition theme
2. Offer a unique perspective or deeper dive
3. Be engaging and educational
4. Be appropriate for learners
5. Not duplicate existing topics

IMPORTANT: This is a demo with limited trails (${trailCheck.remainingTrails} remaining). Make each suggestion count!`

        // Generate topics using AI
        const result = await generateObject({
            model: openrouter("openai/gpt-4o-mini"),
            schema: topicSchema,
            prompt: context,
            temperature: 0.8,
        })

        // Limit to requested count and available slots
        const limitedTopics = result.object.topics.slice(0, maxCount)

        return NextResponse.json({
            topics: limitedTopics,
            remainingTrails: trailCheck.remainingTrails,
            isDemo: true,
            upgradePrompt: "Sign up to create unlimited trails and save your progress!"
        })

    } catch (error) {
        console.error('Demo generate topics error:', error)

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
            { error: "Failed to generate topics. Please try again." },
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