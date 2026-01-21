import { NextResponse } from "next/server"
import { z } from "zod"
import { DemoSessionManager } from "@/lib/demo-session"

const createDemoSchema = z.object({
    topic: z.string().min(3).max(200),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { topic } = createDemoSchema.parse(body)

        // Create demo expedition using session manager (no database)
        const sessionManager = new DemoSessionManager()
        const expedition = sessionManager.createExpedition(topic)

        console.log(`Created demo expedition: ${expedition.id} for topic: ${topic}`)

        return NextResponse.json({
            expeditionId: expedition.id,
            trailId: expedition.trails[0]?.id, // Base camp trail
            title: expedition.title,
            description: expedition.description,
            isDemo: true,
            limits: {
                maxMessages: 10,
                maxTrails: 5,
                messagesUsed: 0,
                trailsUsed: 1, // Base camp trail
            }
        })
    } catch (error) {
        console.error("Demo creation error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid topic. Please provide a topic between 3 and 200 characters." },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal server error" },
            { status: 500 }
        )
    }
}
