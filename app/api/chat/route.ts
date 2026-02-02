import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import { z } from "zod"
import { getUserTier } from "@/lib/credits"
import { canUseModel, getModelById, DEFAULT_MODELS } from "@/lib/constants"
import { getTierOverrideFromHeaders } from "@/lib/tier-override"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// System prompt for trivia generation (only used when feature is enabled)
const TRIVIA_SYSTEM_PROMPT = `You are a learning coach helping someone truly understand concepts, not just receive information. Your goal is to guide discovery through dialogue, not deliver lectures.

## Your Coaching Approach

**For New Topics or First Questions:**
- Briefly acknowledge their question with encouragement
- Ask what they already know or think about it (prior knowledge check)
- Then provide a foundational explanation that builds on what they might know
- Keep initial explanations concise - one core concept at a time

**During Ongoing Conversation:**
- Use Socratic questioning: guide them to insights through questions when appropriate
- When they ask "What is X?", sometimes respond with "What's your intuition about this?" BEFORE explaining
- Check understanding naturally: "Does that make sense?" or "How would you explain this to someone else?"
- When they struggle, normalize it: "This trips up a lot of people. Let's approach it differently..."
- Celebrate effort and thinking: "Good question!" / "You're thinking about this the right way"

**Response Style:**
- Include at least one question TO the learner within your response (not just follow-ups)
- Use analogies connecting to everyday experience
- Build complexity gradually based on their responses
- Be warm and encouraging, but intellectually honest

IMPORTANT: You MUST respond with ONLY valid JSON, with NO markdown code blocks or extra text. Respond with pure JSON only:
{
  "content": "Your coaching response with markdown formatting. MUST include at least one question TO the learner.",
  "trivia": {
    "whyItMatters": "Connection to their goals or real life (optional, null if not applicable)",
    "realWorldUse": "A practical application or something they can try (optional, null if not applicable)",
    "whenYouNeed": "Scenarios where this knowledge becomes useful (optional, null if not applicable)",
    "didYouKnow": "An interesting insight or common misconception to watch for (optional, null if not applicable)"
  },
  "followUpQuestions": [
    "COMPREHENSION: A question testing understanding (explain back, predict, reason why)",
    "EXPLORATION: A question going deeper or connecting concepts",
    "APPLICATION: A question about using this knowledge practically"
  ]
}

Rules:
- ALWAYS return ONLY valid JSON with no markdown code blocks
- Do NOT wrap JSON in \`\`\`json or \`\`\` markers
- ALWAYS include at least one question TO the learner in your "content" (this is critical for coaching)
- Include trivia ONLY when genuinely relevant to their learning
- Use null for trivia fields that don't apply
- If NO trivia is relevant, use: {"content": "...", "trivia": null, "followUpQuestions": [...]}
- Put your main answer in the "content" field with markdown formatting
- Keep trivia items to 1-2 sentences each
- ALWAYS include exactly 3 follow-up questions with this MIX:
  1. First question: COMPREHENSION check (can they explain it back, predict an outcome, or give a reason)
  2. Second question: EXPLORATION (deeper dive or connection to other concepts)
  3. Third question: APPLICATION (how/where to use this knowledge)
- Follow-up questions should be concise (under 60 characters), conversational, not quiz-like`

// Regular system prompt (when trivia is disabled)
const REGULAR_SYSTEM_PROMPT = `You are a learning coach helping someone truly understand concepts, not just receive information.

Your coaching approach:
1. **Ask before telling**: When they ask about something new, first ask what they already know or think about it
2. **Guide discovery**: Use questions to lead them to insights rather than just lecturing
3. **Check understanding**: Ask "Does that make sense?" or "Can you put that in your own words?"
4. **Normalize struggle**: "This is tricky for most people. Let's break it down..."
5. **Build gradually**: One concept at a time, simple to complex
6. **Connect to their world**: Use analogies from everyday experience

Always include at least one question TO the learner in your response - make them think, not just read.

When they ask "What is X?" or "Explain Y", don't just lecture. Engage them: "Before I dive in, what's your intuition about this?" or "What have you encountered about this so far?" Then build on their response.

Be warm and encouraging, but intellectually rigorous. Use markdown formatting for readability.`

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

    // Verify trail ownership and get context
    const { data: trail, error: trailError } = await supabase
      .from("trails")
      .select("title, is_base_camp, expeditions!inner(user_id, title)")
      .eq("id", trailId)
      .single()

    if (trailError || !trail || (trail as any).expeditions.user_id !== user.id) {
      return new Response("Trail not found or access denied", { status: 403 })
    }

    const expeditionTitle = (trail as any).expeditions.title
    const trailTitle = trail.title
    const isBaseCamp = trail.is_base_camp

    // Determine coaching mode based on conversation progress
    const userMessageCount = messages.filter(m => m.role === 'user').length
    let coachingMode = ''
    if (userMessageCount === 0) {
      coachingMode = `\n\nCOACHING MODE: DISCOVERY
This is the learner's first message on this topic. Start by briefly asking what they already know, then provide a foundational explanation. Keep it concise and build from there.`
    } else if (userMessageCount <= 3) {
      coachingMode = `\n\nCOACHING MODE: FOUNDATION
The learner is early in exploring this topic (${userMessageCount} messages so far). Continue building foundational understanding. Check comprehension before adding complexity.`
    } else {
      coachingMode = `\n\nCOACHING MODE: DEPTH
The learner has been exploring this topic for a while (${userMessageCount} messages). You can introduce more nuanced concepts, connect ideas across the conversation, and challenge them with deeper questions.`
    }

    // Enhanced context for the system prompt
    const contextPrompt = `You are currently coaching the user through an "Expedition" titled "${expeditionTitle}".
${isBaseCamp ? `The user is at the Base Camp, which covers the core topic: "${trailTitle}".` : `The user is currently exploring a specific branch called "${trailTitle}" within this expedition.`}
All coaching, questions, and explanations should be relevant to this topic unless the user explicitly asks to pivot.${coachingMode}`

    // Get user tier
    const userSubscription = await getUserTier(user.id)
    let userTier = userSubscription.tier

    // Check for tier override (for testing)
    const tierOverride = getTierOverrideFromHeaders(req.headers)
    if (tierOverride) {
      userTier = tierOverride.tier
    }

    console.log('User tier detected:', { userTier, selectedModel: model })

    // Validate model access based on tier
    let selectedModel = model || DEFAULT_MODELS[userTier]
    let modelConfig = getModelById(selectedModel)

    // If model is invalid or user can't access it, fall back to default for their tier
    if (!modelConfig || !canUseModel(userTier, selectedModel)) {
      console.log(`Model ${selectedModel} is invalid or inaccessible for tier ${userTier}, falling back to default`)
      selectedModel = DEFAULT_MODELS[userTier]
      modelConfig = getModelById(selectedModel)
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

    // Check if trivia feature is enabled
    const triviaEnabled = process.env.NEXT_PUBLIC_ENABLE_TRIVIA === 'true'

    // Stream AI response using the full conversation history (filter out illustration messages for AI)
    // Add system prompt based on feature flag and prepend the topic context
    const baseSystemPrompt = triviaEnabled ? TRIVIA_SYSTEM_PROMPT : REGULAR_SYSTEM_PROMPT
    const systemPrompt = `${contextPrompt}\n\n${baseSystemPrompt}`
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

          // Record learning activity for analytics (non-blocking)
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
