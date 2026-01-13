import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"
import { getFeatureModel } from "@/lib/constants"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

const generateTopicsSchema = z.object({
    expeditionTitle: z.string(),
    existingTopics: z.array(z.string()),
    count: z.number().min(1).max(20).default(5),
})

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new Response("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { expeditionTitle, existingTopics, count } = generateTopicsSchema.parse(body)

        const existingContext = existingTopics.length > 0
            ? `Already learning: ${existingTopics.slice(0, 10).join(', ')}.`
            : ''

        const result = await generateText({
            model: openrouter(getFeatureModel('TOPIC_GENERATION')),
            prompt: `Generate ${count} learning topics for "${expeditionTitle}". ${existingContext}

Return JSON array only: [{"topic":"Name","description":"One sentence"}]`,
        })

        // Parse and validate the response
        let topics
        try {
            const text = result.text.trim()
            // Handle potential markdown code blocks
            const jsonText = text.replace(/```json\n?|\n?```/g, '').trim()
            topics = JSON.parse(jsonText)
        } catch {
            // Fallback: generate simple topics if parsing fails
            topics = Array.from({ length: count }, (_, i) => ({
                topic: `${expeditionTitle} - Topic ${i + 1}`,
                description: `Explore this aspect of ${expeditionTitle}`,
            }))
        }

        return Response.json(topics)
    } catch (error) {
        console.error("Generate Topics API error:", error)
        return new Response(
            error instanceof Error ? error.message : "Internal server error",
            { status: 500 }
        )
    }
}
