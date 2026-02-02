import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

const quizRequestSchema = z.object({
  expeditionId: z.string(),
  trailId: z.string().optional(),
  questionCount: z.number().min(3).max(10),
})

const quizResponseSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      explanation: z.string(),
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
    const { expeditionId, trailId, questionCount } = quizRequestSchema.parse(body)

    // Verify expedition ownership
    const { data: expedition, error: expeditionError } = await supabase
      .from("expeditions")
      .select("id, title, user_id")
      .eq("id", expeditionId)
      .single()

    if (expeditionError || !expedition || expedition.user_id !== user.id) {
      return new Response("Expedition not found or access denied", { status: 403 })
    }

    // Get trails - either specific trail or all trails in expedition
    let trailsQuery = supabase
      .from("trails")
      .select("id, title")
      .eq("expedition_id", expeditionId)

    if (trailId) {
      trailsQuery = trailsQuery.eq("id", trailId)
    }

    const { data: trails, error: trailsError } = await trailsQuery

    if (trailsError || !trails || trails.length === 0) {
      return new Response("No trails found", { status: 404 })
    }

    // Get all messages from all trails in this expedition
    const trailIds = trails.map((t) => t.id)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("role, content, trail_id")
      .in("trail_id", trailIds)
      .order("created_at", { ascending: true })

    if (messagesError) {
      return new Response("Failed to fetch messages", { status: 500 })
    }

    // If no messages, cannot generate quiz
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No conversation history found. Chat with the AI first to generate a quiz.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Build context from messages grouped by trail
    const trailMap = new Map<string, { title: string; messages: any[] }>()
    trails.forEach((trail) => {
      trailMap.set(trail.id, { title: trail.title, messages: [] })
    })

    messages.forEach((msg) => {
      const trail = trailMap.get(msg.trail_id)
      if (trail) {
        trail.messages.push(msg)
      }
    })

    let conversationContext = `Expedition: ${expedition.title}\n\n`
    trailMap.forEach((trail, trailId) => {
      if (trail.messages.length > 0) {
        conversationContext += `Trail: ${trail.title}\n`
        trail.messages.forEach((msg) => {
          conversationContext += `${msg.role}: ${msg.content}\n`
        })
        conversationContext += "\n"
      }
    })

    // Generate quiz using AI
    const systemPrompt = `You are a quiz generator for an educational platform. Based on the conversation history provided, generate ${questionCount} multiple-choice questions to test the user's understanding of the topics discussed.

Rules:
1. Questions should test understanding, not just memorization
2. Difficulty should be adaptive - analyze the depth of the conversation and create appropriately challenging questions
3. Each question must have exactly 4 options
4. Provide clear explanations for the correct answers
5. Questions should cover different topics/trails from the conversation when possible
6. Make questions engaging and educational

Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct and what was discussed in the conversation."
    }
  ]
}

Do not include any text before or after the JSON object.`

    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Generate ${questionCount} quiz questions based on this conversation:\n\n${conversationContext}`,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the AI response
    let quizData
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      quizData = JSON.parse(jsonMatch[0])
      quizData = quizResponseSchema.parse(quizData)
    } catch (parseError) {
      console.error("Failed to parse quiz response:", result.text)
      return new Response(
        JSON.stringify({
          error: "Failed to generate valid quiz questions. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(JSON.stringify(quizData), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Quiz generation error:", error)

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request format", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Failed to generate quiz" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
