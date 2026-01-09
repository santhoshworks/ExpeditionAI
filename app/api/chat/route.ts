import { createClient } from "@/lib/supabase/server"
import { openrouter } from "@openrouter/ai-sdk-provider/openrouter"
import { streamText } from "ai"
import { z } from "zod"

const chatSchema = z.object({
  trailId: z.string(),
  message: z.string(),
  model: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ).optional(),
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
    const { trailId, message, model, messages = [] } = chatSchema.parse(body)

    // Verify trail ownership
    const { data: trail, error: trailError } = await supabase
      .from("trails")
      .select("expedition_id, expeditions!inner(user_id)")
      .eq("id", trailId)
      .single()

    if (trailError || !trail || (trail as any).expeditions.user_id !== user.id) {
      return new Response("Trail not found or access denied", { status: 403 })
    }

    // Save user message first
    const { error: userMsgError } = await supabase
      .from("messages")
      .insert({
        trail_id: trailId,
        role: "user",
        content: message,
      })

    if (userMsgError) {
      console.error("Failed to save user message:", userMsgError)
    }

    // Build conversation history (messages array already includes all previous messages)
    // We add the current user message to the history
    const conversationHistory = [
      ...messages,
      {
        role: "user" as const,
        content: message,
      },
    ]

    const selectedModel = model || "anthropic/claude-3.5-sonnet"

    // Stream AI response
    const result = await streamText({
      model: openrouter(selectedModel, {
        apiKey: process.env.OPENROUTER_API_KEY!,
      }),
      messages: conversationHistory,
      onFinish: async ({ text }) => {
        // Save assistant message after streaming completes
        try {
          const supabaseClient = await createClient()
          await supabaseClient
            .from("messages")
            .insert({
              trail_id: trailId,
              role: "assistant",
              content: text,
              model: selectedModel,
            })
        } catch (error) {
          console.error("Failed to save assistant message:", error)
        }
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    )
  }
}
