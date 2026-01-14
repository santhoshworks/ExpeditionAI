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

// System prompt for trivia generation (only used when feature is enabled)
const TRIVIA_SYSTEM_PROMPT = `You are a helpful AI assistant focused on education and learning. Provide clear, detailed explanations with examples when appropriate. Use markdown formatting for better readability.

IMPORTANT: Trivia is OPTIONAL and should ONLY be included when it genuinely adds exciting, surprising, or valuable context that enhances learning. Most responses should NOT include trivia.

When you have truly interesting trivia that would fascinate the user, you can optionally include it at the END of your response using this format:

---TRIVIA---
WHY_IT_MATTERS: Brief explanation of why this concept is important (1-2 sentences)
REAL_WORLD_USE: Practical real-world applications or examples (1-2 sentences)
WHEN_YOU_NEED: Scenarios or situations where this knowledge is useful (1-2 sentences)
DID_YOU_KNOW: An interesting fact, historical context, or surprising insight (1-2 sentences)
---END_TRIVIA---

Rules for including trivia:
- ONLY include trivia if you have genuinely exciting, surprising, or fascinating information to share
- Skip trivia for: simple questions, code debugging, conversational messages, routine explanations
- Include trivia for: complex concepts with interesting history, surprising real-world applications, or mind-blowing facts
- When in doubt, DON'T include trivia - quality over quantity
- Each trivia item must be genuinely interesting, not just restating the obvious
- Always put your main answer FIRST, then trivia section at the END if warranted`

// Regular system prompt (when trivia is disabled)
const REGULAR_SYSTEM_PROMPT = `You are a helpful AI assistant focused on education and learning. Provide clear, detailed explanations with examples when appropriate. Use markdown formatting for better readability.`

// Schema for AI SDK useChat hook format
const chatSchema = z.object({
  trailId: z.string(),
  model: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system", "illustration"]),
      content: z.string(),
      metadata: z.string().optional(),
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

    // Handle illustration messages (save directly, don't process with AI)
    // Only process if illustrations are enabled
    if (messages.length === 1 && messages[0].role === "illustration" && process.env.NEXT_PUBLIC_ENABLE_ILLUSTRATIONS === 'true') {
      const illustrationMessage = messages[0]

      try {
        const { error: illustrationError } = await supabase
          .from("messages")
          .insert({
            trail_id: trailId,
            role: "illustration",
            content: illustrationMessage.content,
            model: "illustration",
            metadata: illustrationMessage.metadata,
          } as any)

        if (illustrationError) {
          console.error("Failed to save illustration message:", illustrationError)
          return new Response("Failed to save illustration", { status: 500 })
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (error) {
        console.error("Illustration save error:", error)
        return new Response("Failed to save illustration", { status: 500 })
      }
    }

    // If illustrations are disabled, reject illustration messages
    if (messages.length === 1 && messages[0].role === "illustration") {
      return new Response(
        JSON.stringify({ error: "Illustration feature is disabled" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
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

    // Check if trivia feature is enabled
    const triviaEnabled = process.env.NEXT_PUBLIC_ENABLE_TRIVIA === 'true'

    // Stream AI response using the full conversation history (filter out illustration messages for AI)
    // Add system prompt based on feature flag
    const systemPrompt = triviaEnabled ? TRIVIA_SYSTEM_PROMPT : REGULAR_SYSTEM_PROMPT
    const aiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages
        .filter(m => m.role !== "illustration")
        .map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content
        }))
    ]

    const result = await streamText({
      model: openrouter(selectedModel),
      messages: aiMessages,
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

          // Record learning activity for analytics (non-blocking)
          // Note: Type assertion needed until Supabase types are regenerated after migration
          try {
            await (supabaseClient.rpc as any)('record_daily_activity', {
              p_user_id: user.id,
              p_messages: 2, // user + assistant message
              p_trails: 0,
              p_expeditions: 0,
              p_tokens: usage?.totalTokens || 0,
              p_topic: null
            })
          } catch (activityError) {
            console.error("Failed to record activity:", activityError)
            // Non-blocking - don't fail the request
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
