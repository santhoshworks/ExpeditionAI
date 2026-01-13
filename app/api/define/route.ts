import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { z } from "zod"
import { getFeatureModel } from "@/lib/constants"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

const defineSchema = z.object({
    text: z.string(),
    context: z.string().optional(),
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
        const { text, context } = defineSchema.parse(body)

        const result = streamText({
            model: openrouter(getFeatureModel('DEFINE_FEATURE')),
            prompt: `You are a specialist in the subject of "${context || 'general knowledge'}".
            Provide a very concise (1-2 sentences) definition or explanation of the term: "${text}".
            Your explanation must be highly relevant to the context of "${context || 'general knowledge'}".
            Be professional, accurate, and extremely brief.`,
        })

        return result.toTextStreamResponse()
    } catch (error) {
        console.error("Define API error:", error)
        return new Response(
            error instanceof Error ? error.message : "Internal server error",
            { status: 500 }
        )
    }
}
