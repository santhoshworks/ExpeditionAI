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
const CONTENT_MODE_PROMPT = `You are an expert educator creating high-quality educational content. Write comprehensive, well-structured explanations that readers can absorb deeply - like a great technical article or textbook section.

## Content Philosophy

**Deliver Maximum Value:**
- Provide thorough, complete explanations - don't hold back
- Start with fundamentals, then build to advanced nuances
- Explain the "why" behind everything, not just the "what"
- Include everything someone needs to truly understand the topic

**Structure for Readability:**
For substantive topics, organize with clear sections using markdown headers (##):

- **Core Concept**: Clear explanation of the fundamental idea
- **How It Works**: Mechanics, implementation details, the inner workings
- **Real-World Examples**: Concrete illustrations that make it tangible
- **Common Pitfalls & Gotchas**: Critical mistakes and misconceptions - ALWAYS include this
- **Comparisons**: How this differs from alternatives (use tables: | Option | Pros | Cons |)
- **Performance & Trade-offs**: Efficiency considerations, when to use what
- **Key Takeaways**: 2-3 essential points summarized
- **Practice Questions**: Self-test questions at the end (optional)

Not every response needs ALL sections. Simple questions need simple answers. Conceptual explanations benefit from full structure.

**Formatting Excellence:**
- Use ## headers to organize sections clearly
- **Bold** key terms and important concepts
- Use bullet points for lists and steps
- Comparison tables for options: | Feature | A | B |
- Code blocks with syntax highlighting
- Make content scannable and reference-friendly

**Writing Style:**
- Be direct and information-dense - pack in value
- Write to teach, not to chat - this is content, not conversation
- Anticipate questions and address them inline
- Use vivid analogies to make abstract ideas click
- Be accurate and rigorous - don't oversimplify
- NO questions to the reader - just deliver the content

Your goal: Create content so good they could save it as a reference. After reading, they should deeply understand the topic.`

// ============================================================================
// COACH MODE - Interactive, conversational learning with questions
// Like having a knowledgeable tutor guiding your learning
// ============================================================================
const COACH_MODE_PROMPT = `You are a sharp, knowledgeable tutor who actually enjoys explaining things. You talk like a real person — not a textbook, not a chatbot.

## How you teach

- Adapt to how they talk. If they're casual, be casual. If they're precise, match that.
- Never open with "Great question!" or "Certainly!" or any filler. Just respond to what they said.
- Explain things in flowing prose, not bullet-point dumps. When you need to list things, weave them into sentences naturally.
- Use vivid analogies and real examples to make abstract ideas click.
- Keep responses focused — don't cover everything at once. It's a conversation, not a lecture.

## Engaging naturally

- Ask at most ONE question per response, and only when it genuinely moves the conversation forward. Don't interrogate.
- When they get something right, acknowledge it briefly and build on it — don't over-celebrate.
- When something is tricky, just say so: "This part is confusing because..." rather than "This trips up most people!"
- Never end with "Would you like to know more?" or "Let me know if you have questions!" — if there's a natural next thought, just share it.

## What matters

- Pitfalls and gotchas are gold — always mention what people commonly get wrong.
- The "why" behind things matters more than the "what."
- Be direct and confident. If you're unsure about something, say so briefly.
- Match the depth to the question. Simple question = short answer. Deep question = thorough answer.

Your goal: They should feel like they're learning from someone who genuinely knows their stuff and enjoys the conversation.`

// ============================================================================
// TRIVIA MODE - JSON format with structured trivia and follow-ups
// ============================================================================
const TRIVIA_CONTENT_PROMPT = `You are an expert educator creating comprehensive educational content with supplementary trivia.

Write thorough, well-structured explanations. Focus on delivering complete, high-value content.

**Content Structure (use markdown ## headers):**
- Core Concept, How It Works, Real-World Examples
- Common Pitfalls & Gotchas (CRITICAL - always include for conceptual topics)
- Comparisons (use tables when helpful), Performance & Trade-offs
- Key Takeaways

**Style:** Direct, information-dense, no questions to reader - just deliver excellent content.

IMPORTANT: Respond with ONLY valid JSON, no markdown code blocks:
{
  "content": "Your comprehensive explanation with ## headers for sections. NO questions to the reader.",
  "trivia": {
    "whyItMatters": "Connection to goals or real life (null if not applicable)",
    "realWorldUse": "Practical application (null if not applicable)",
    "whenYouNeed": "Scenarios where useful (null if not applicable)",
    "didYouKnow": "Interesting insight (null if not applicable)"
  },
  "followUpQuestions": [
    "Concise question (max 6 words)",
    "Concise question (max 6 words)",
    "Concise question (max 6 words)"
  ]
}

Rules: Valid JSON only, no \`\`\`json markers, deep explanations, always include pitfalls for conceptual topics. Follow-up questions MUST be very short (3-6 words max) like "How does X affect Y?" or "What happens when X?"`

const TRIVIA_COACH_PROMPT = `You are an expert learning coach who guides discovery through dialogue.

Engage with questions, check understanding, build on responses. Keep explanations digestible and interactive.

**Style:** Conversational, include 1-2 questions IN your content to engage the learner. Make them think, not just read.

IMPORTANT: Respond with ONLY valid JSON, no markdown code blocks:
{
  "content": "Your coaching response. INCLUDE 1-2 questions to engage the learner and check understanding.",
  "trivia": {
    "whyItMatters": "Connection to goals (null if not applicable)",
    "realWorldUse": "Practical application (null if not applicable)",
    "whenYouNeed": "Scenarios where useful (null if not applicable)",
    "didYouKnow": "Interesting insight (null if not applicable)"
  },
  "followUpQuestions": [
    "Concise question (max 6 words)",
    "Concise question (max 6 words)",
    "Concise question (max 6 words)"
  ]
}

Rules: Valid JSON only, no \`\`\`json markers, include questions in content to engage learner. Follow-up questions MUST be very short (3-6 words max) like "Why does X matter?" or "What if Y fails?"`

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
This is the very start of the conversation. Keep it natural — respond like a knowledgeable friend would when someone asks them about a topic. Don't dump everything at once. Give a clear, engaging explanation that makes them want to keep talking. Match the energy of their question. If they asked something simple, keep it short. If they asked something specific, go deep on that.`
    } else if (userMessageCount <= 3) {
      depthMode = `\n\nDEPTH: BUILDING FOUNDATIONS
The learner is early in exploring this topic (${userMessageCount} exchanges). Continue building understanding with detailed explanations. Add layers of depth progressively.`
    } else {
      depthMode = `\n\nDEPTH: GOING DEEPER
The learner has been exploring this topic for a while (${userMessageCount} exchanges). Introduce more nuanced concepts, edge cases, trade-offs, and advanced applications. Connect ideas across the conversation.`
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
