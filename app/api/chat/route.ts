import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { z } from "zod"
import {
  getUserCredits,
  hasEnoughCredits,
  deductCredits,
  canCreateTrail,
  incrementTrailCount,
} from "@/lib/credits"
import { canUseModel, getModelById, DEFAULT_MODELS } from "@/lib/constants"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// Schema for AI SDK useChat hook format
const chatSchema = z.object({
  trailId: z.string(),
  model: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
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
    const { trailId, model, messages } = chatSchema.parse(body)

    // Verify trail ownership
    const { data: trail, error: trailError } = await supabase
      .from("trails")
      .select("expedition_id, expeditions!inner(user_id)")
      .eq("id", trailId)
      .single()

    if (trailError || !trail || (trail as any).expeditions.user_id !== user.id) {
      return new Response("Trail not found or access denied", { status: 403 })
    }

    // Get user credits and tier
    const userCredits = await getUserCredits(user.id)
    const userTier = userCredits?.tier || 'free'

    // Check daily trail limit for free tier
    const trailCheck = await canCreateTrail(user.id)
    if (!trailCheck.allowed) {
      return new Response(
        JSON.stringify({ error: trailCheck.reason }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate model access based on tier
    const selectedModel = model || DEFAULT_MODELS[userTier]
    const modelConfig = getModelById(selectedModel)

    if (!canUseModel(userTier, selectedModel)) {
      return new Response(
        JSON.stringify({
          error: `Model ${modelConfig?.name || selectedModel} requires a higher tier. Please upgrade your plan.`
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check credit balance for paid models
    if (modelConfig && modelConfig.costPerTrail > 0) {
      const creditCheck = await hasEnoughCredits(user.id, selectedModel)
      if (!creditCheck.hasCredits) {
        return new Response(
          JSON.stringify({
            error: `Insufficient credits. You need ~${creditCheck.required} credits but have ${creditCheck.available}. Add more credits or use a free model.`
          }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get the latest user message from the messages array
    const latestUserMessage = messages.filter(m => m.role === "user").pop()

    if (!latestUserMessage) {
      return new Response("No user message found", { status: 400 })
    }

    // Save user message to database
    const { error: userMsgError } = await supabase
      .from("messages")
      .insert({
        trail_id: trailId,
        role: "user",
        content: latestUserMessage.content,
      } as any)

    if (userMsgError) {
      console.error("Failed to save user message:", userMsgError)
    }

    // Increment trail count for free tier daily limit tracking
    if (userTier === 'free') {
      await incrementTrailCount(user.id)
    }

    // Stream AI response using the full conversation history
    const result = await streamText({
      model: openrouter(selectedModel),
      messages: messages,
      onFinish: async ({ text, usage }) => {
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
              tokens_used: (usage?.totalTokens || 0),
            } as any)

          // Deduct credits based on actual token usage (for paid models)
          if (modelConfig && modelConfig.costPerTrail > 0 && usage) {
            // Log usage object to understand its structure
            console.log('Usage object:', usage)

            const deductResult = await deductCredits(
              user.id,
              selectedModel,
              Math.floor((usage.totalTokens || 0) * 0.7), // Estimate input tokens as ~70%
              Math.floor((usage.totalTokens || 0) * 0.3)  // Estimate output tokens as ~30%
            )

            if (!deductResult.success) {
              console.error("Failed to deduct credits:", deductResult.error)
            }
          }
        } catch (error) {
          console.error("Failed to save assistant message:", error)
        }
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    )
  }
}
