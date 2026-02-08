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

// ============================================================================
// CONTENT MODE - Deep, comprehensive explanations to read and absorb
// Like reading a well-written technical article or textbook section
// ============================================================================
const CONTENT_MODE_PROMPT = `You are a knowledgeable expert who explains things clearly and in depth. Write the way a great explainer would — someone who genuinely understands the topic and can make it accessible to anyone.

## How to respond

- Give thorough, detailed explanations. Don't skim the surface — go deep enough that the reader walks away with real understanding.
- Let the topic dictate the structure. A history topic needs context, narrative, causes and consequences. A technical topic needs examples and code. A philosophical topic needs nuance and perspectives. Adapt.
- Use ## headers when it helps readability, but only for sections that actually make sense for the topic. Don't force sections that don't fit.
- Write in clear, flowing prose. Use bullet points only when listing genuinely distinct items — not as the default format for everything.
- **Bold** key terms, important concepts, and notable names so the content is scannable and specific terms stand out for further exploration.
- Naturally reference related sub-topics, concepts, and connections as you explain — this gives the reader clear threads to pull on next.

## Writing style

- Be direct and clear — no filler, no fluff. But don't be shallow either. Depth is the priority.
- Explain the "why" and context, not just facts. Help them actually understand, not just memorize.
- Use vivid examples and analogies that fit the subject matter.
- Mention common misconceptions or things people often get wrong — this is valuable for any topic.
- When you reference a related concept or term, give enough context that it's interesting but leave room for them to explore it further.
- Be accurate. Don't oversimplify to the point of being wrong.
- NO questions to the reader — just deliver the explanation.
- Never start with "Great question!" or any filler. Just start explaining.

Your goal: After reading, they should genuinely understand the topic and have a clear sense of what they could explore next.`

// ============================================================================
// COACH MODE - Interactive, conversational learning with questions
// Like having a knowledgeable tutor guiding your learning
// ============================================================================
const COACH_MODE_PROMPT = `You are a sharp, knowledgeable tutor who actually enjoys explaining things. You talk like a real person — not a textbook, not a chatbot. You give rich, detailed answers that really teach.

## How you teach

- Adapt to how they talk. If they're casual, be casual. If they're precise, match that.
- Never open with "Great question!" or "Certainly!" or any filler. Just respond to what they said.
- Explain things in flowing prose, not bullet-point dumps. When you need to list things, weave them into sentences naturally.
- Use vivid analogies and real examples to make abstract ideas click.
- Go deep. Give substantial explanations that cover the topic well. Don't give thin, surface-level answers — the learner is here to actually learn.
- **Bold** key terms and notable concepts so they stand out. Naturally mention related ideas and sub-topics as you explain — this gives the learner threads to explore further.

## Engaging naturally

- Ask at most ONE question per response, and only when it genuinely moves the conversation forward. Don't interrogate.
- When they get something right, acknowledge it briefly and build on it — don't over-celebrate.
- When something is tricky, just say so: "This part is confusing because..." rather than "This trips up most people!"
- Never end with "Would you like to know more?" or "Let me know if you have questions!" — if there's a natural next thought, just share it.

## What matters

- Pitfalls, misconceptions, and gotchas are gold — always mention what people commonly get wrong.
- The "why" behind things matters more than the "what."
- Be direct and confident. If you're unsure about something, say so briefly.
- When you reference a related concept, give enough context that it sparks curiosity but leave room for further exploration.

Your goal: They should feel like they're learning from someone who genuinely knows their stuff, gives real depth, and makes them want to keep exploring.`

// ============================================================================
// TRIVIA MODE - JSON format with structured trivia and follow-ups
// ============================================================================
const TRIVIA_CONTENT_PROMPT = `You are a knowledgeable expert who explains things in depth. Write naturally — let the topic dictate the structure, not a rigid template.

Give thorough, detailed explanations. **Bold** key terms and concepts throughout so they stand out. Naturally reference related sub-topics and connections — this gives the reader threads to explore further. Use ## headers where they help readability. Write in clear prose. Be direct, explain the "why", and mention common misconceptions. Never start with filler like "Great question!".

IMPORTANT: Respond with ONLY valid JSON, no markdown code blocks:
{
  "content": "Your thorough, detailed explanation. **Bold** key terms and concepts. Use ## headers where they naturally fit. Reference related ideas worth exploring. NO questions to the reader.",
  "trivia": {
    "whyItMatters": "Why this matters in the real world (null if not applicable)",
    "realWorldUse": "Where you see this in practice (null if not applicable)",
    "whenYouNeed": "When this knowledge becomes useful (null if not applicable)",
    "didYouKnow": "An interesting, surprising fact (null if not applicable)"
  },
  "followUpQuestions": [
    "Concise question about a specific concept mentioned in your explanation (max 6 words)",
    "Concise question that branches into a related sub-topic (max 6 words)",
    "Concise question that goes deeper on something you mentioned (max 6 words)"
  ]
}

Rules: Valid JSON only, no \`\`\`json markers. Let the topic guide the structure — don't force tech-specific sections onto non-tech topics. Follow-up questions MUST be very short (3-6 words max) and directly relate to concepts from your explanation — they should feel like the natural next thing someone would want to ask.`

const TRIVIA_COACH_PROMPT = `You are a sharp, knowledgeable tutor who talks like a real person and gives rich, detailed explanations. Adapt to their tone, explain things naturally, and keep the conversation flowing. No filler openers, no bullet-point dumps.

Go deep — give substantial answers. **Bold** key terms and concepts so they stand out. Naturally mention related ideas and sub-topics as you explain. Include at most one question in your response to keep them thinking — only when it genuinely fits.

IMPORTANT: Respond with ONLY valid JSON, no markdown code blocks:
{
  "content": "Your detailed conversational explanation. **Bold** key terms. Reference related concepts worth exploring. Include at most one natural question.",
  "trivia": {
    "whyItMatters": "Why this matters in the real world (null if not applicable)",
    "realWorldUse": "Where you see this in practice (null if not applicable)",
    "whenYouNeed": "When this knowledge becomes useful (null if not applicable)",
    "didYouKnow": "An interesting, surprising fact (null if not applicable)"
  },
  "followUpQuestions": [
    "Concise question about a specific concept from your explanation (max 6 words)",
    "Concise question that branches into a related sub-topic (max 6 words)",
    "Concise question that goes deeper on something you mentioned (max 6 words)"
  ]
}

Rules: Valid JSON only, no \`\`\`json markers. Let the topic guide the structure — don't force tech-specific sections onto non-tech topics. Follow-up questions MUST be very short (3-6 words max) and directly relate to concepts from your explanation — they should feel like the natural next thing to ask.`

// Schema for AI SDK useChat hook format
const chatSchema = z.object({
  trailId: z.string(),
  model: z.string().optional(),
  teachingStyle: z.enum(["content", "coach"]).optional(), // UI-only toggle, defaults to "content"
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
    const { trailId, model, messages, teachingStyle = 'content' } = chatSchema.parse(body)

    // Verify trail ownership and get context (including learner personalization)
    const { data: trail, error: trailError } = await supabase
      .from("trails")
      .select("title, is_base_camp, expeditions!inner(user_id, title, learning_purpose, learner_level)")
      .eq("id", trailId)
      .single()

    if (trailError || !trail || (trail as any).expeditions.user_id !== user.id) {
      return new Response("Trail not found or access denied", { status: 403 })
    }

    const expeditionTitle = (trail as any).expeditions.title
    const trailTitle = trail.title
    const isBaseCamp = trail.is_base_camp
    const learningPurpose = (trail as any).expeditions.learning_purpose as string | null
    const learnerLevel = (trail as any).expeditions.learner_level as string | null

    // Determine depth mode based on conversation progress
    const userMessageCount = messages.filter(m => m.role === 'user').length
    let depthMode = ''
    if (userMessageCount === 0) {
      depthMode = `\n\nDEPTH: FIRST EXCHANGE
This is their first question on this topic. Give a thorough, detailed explanation that really covers the ground — don't hold back. The goal is to give them a rich answer full of interesting concepts, key terms, and connections to related ideas that they'll naturally want to explore further. Write naturally, not like a template. **Bold** important terms and concepts throughout so they're easy to spot and explore.`
    } else if (userMessageCount <= 3) {
      depthMode = `\n\nDEPTH: BUILDING FOUNDATIONS
The learner is early in exploring this topic (${userMessageCount} exchanges). Go deeper with each response — build on what's been discussed, introduce important related concepts, and keep **bolding** key terms. Each response should open up new areas worth exploring. Don't repeat what you've already covered.`
    } else {
      depthMode = `\n\nDEPTH: GOING DEEPER
The learner has been exploring this topic for a while (${userMessageCount} exchanges). Introduce more nuanced concepts, edge cases, different perspectives, and advanced connections. Reference what's been discussed earlier and build on it. Keep **bolding** notable terms and concepts. Every response should reveal new layers worth branching into.`
    }

    // Build learner context based on their purpose and level
    let learnerContext = ''
    if (learningPurpose || learnerLevel) {
      const purposeGuidance: Record<string, string> = {
        interview: `INTERVIEW PREPARATION MODE:
  - Help them articulate concepts clearly enough to explain in interviews
  - ALWAYS include "Common Pitfalls & Gotchas" section - interviewers love asking about edge cases
  - Include "What Interviewers Look For" insights when relevant
  - Add comparison tables when discussing alternatives (interviewers ask "why X over Y?")
  - Include practice scenarios: "How would you explain this to an interviewer?"
  - Cover the "why" deeply - interviewers probe for understanding, not memorization
  - Mention performance implications - a common interview topic`,
        exam: `EXAM PREPARATION MODE:
  - Emphasize comprehensive coverage with key definitions clearly highlighted
  - Include "Key Takeaways" section for quick revision
  - Add "Common Exam Pitfalls" - mistakes students typically make
  - Use comparison tables for similar concepts that get confused
  - Include practice questions that mirror exam format
  - Build mental frameworks and mnemonics for retention
  - Cover edge cases that often appear in tricky exam questions`,
        research: `RESEARCH MODE:
  - Go deep into nuances, current debates, and academic rigor
  - Include "Nuances & Edge Cases" section
  - Discuss limitations and open questions in the field
  - Connect to related concepts and broader context
  - Mention seminal ideas or key developments where relevant
  - Be precise with terminology and distinctions`,
        work: `WORK APPLICATION MODE:
  - Focus on practical implementation and real-world patterns
  - Include "Production Considerations" - what matters in real systems
  - Add "Common Mistakes in Practice" section
  - Discuss trade-offs and when to use what
  - Include code examples with best practices
  - Cover debugging tips and troubleshooting approaches
  - Keep it actionable and professionally relevant`,
        curiosity: `CURIOSITY/EXPLORATION MODE:
  - Make it engaging and follow their interests
  - Use fascinating real-world examples and analogies
  - Include "Interesting Insights" and surprising facts
  - Connect to things they might already know
  - Keep the tone light and exploratory - no pressure
  - Spark further curiosity with intriguing questions`,
        teaching: `TEACHING PREPARATION MODE:
  - Help them understand how to explain concepts to others
  - Include "Common Misconceptions" section - what their students will get wrong
  - Add "How to Explain This" tips and analogies that work well
  - Cover the progression: what to teach first, what builds on what
  - Include "Questions Students Often Ask" and how to answer them
  - Help them anticipate confusion points`,
        building: `BUILDING/IMPLEMENTATION MODE:
  - Focus on hands-on, practical guidance
  - Include "Implementation Steps" or patterns
  - Add "Gotchas You'll Hit" - problems they'll encounter
  - Show working code examples with explanations
  - Discuss architecture decisions and trade-offs
  - Cover debugging and testing approaches
  - Include "When This Breaks" scenarios`,
      }

      const levelGuidance: Record<string, string> = {
        beginner: "BEGINNER LEVEL: Use simple analogies from everyday life, define all jargon, build from absolute fundamentals. Be extra encouraging and patient. Don't assume prior knowledge.",
        familiar: "FAMILIAR LEVEL: They know basics - build on existing knowledge, use proper terminology (briefly clarify if needed), start making connections between concepts.",
        intermediate: "INTERMEDIATE LEVEL: Solid foundations - focus on 'why' not just 'what', challenge assumptions, explore nuances and edge cases. They can handle some complexity.",
        advanced: "ADVANCED LEVEL: Engage at peer level - discuss trade-offs, edge cases, performance implications, and current debates. Go deep into nuances. They can handle full complexity.",
      }

      learnerContext = `\n\nLEARNER CONTEXT:`
      if (learningPurpose && purposeGuidance[learningPurpose]) {
        learnerContext += `\n${purposeGuidance[learningPurpose]}`
      }
      if (learnerLevel && levelGuidance[learnerLevel]) {
        learnerContext += `\n\n${levelGuidance[learnerLevel]}`
      }
    } else {
      // No learner context set - gauge from their messages
      if (userMessageCount === 0) {
        learnerContext = `\n\nLEARNER CONTEXT: Not specified yet. Gauge their level from how they ask their question and adjust naturally. Don't ask them to self-assess — just read the room.`
      }
    }

    // Enhanced context for the system prompt
    const contextPrompt = `You are currently coaching the user through an "Expedition" titled "${expeditionTitle}".
${isBaseCamp ? `The user is at the Base Camp, which covers the core topic: "${trailTitle}".` : `The user is currently exploring a specific branch called "${trailTitle}" within this expedition.`}
All content and explanations should be relevant to this topic unless the user explicitly asks to pivot.${depthMode}${learnerContext}`

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

    // Select base prompt based on teaching style and trivia feature
    // Content mode: Deep, comprehensive explanations to read (like an article)
    // Coach mode: Interactive with questions (like a tutor)
    let baseSystemPrompt: string
    if (triviaEnabled) {
      baseSystemPrompt = teachingStyle === 'coach' ? TRIVIA_COACH_PROMPT : TRIVIA_CONTENT_PROMPT
    } else {
      baseSystemPrompt = teachingStyle === 'coach' ? COACH_MODE_PROMPT : CONTENT_MODE_PROMPT
    }

    // Stream AI response using the full conversation history (filter out illustration messages for AI)
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
