import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

const defineSchema = z.object({
    text: z.string(),
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
        const { text } = defineSchema.parse(body)

        const { text: definition } = await generateText({
            model: openrouter("openai/gpt-4o-mini"),
            prompt: `Provide a very concise, 1-2 sentence definition or explanation of the following term or phrase in the context of an educational expedition: "${text}". If it's a general word, give its primary meaning. Be brief.`,
        })

        return Response.json({ definition: definition.trim() })
    } catch (error) {
        console.error("Define API error:", error)
        return new Response(
            error instanceof Error ? error.message : "Internal server error",
            { status: 500 }
        )
    }
}
