import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

const flashcardRequestSchema = z.object({
  expeditionId: z.string(),
  trailId: z.string().optional(),
  cardCount: z.number().min(3).max(20).default(10),
})

const flashcardResponseSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
      sourceTrailId: z.string(),
      sourceTrailTitle: z.string(),
      sourceType: z.enum(["concept", "question"]),
      importance: z.number().min(1).max(5),
    })
  ),
})

export async function POST(req: Request) {
  // Check feature flag
  if (process.env.NEXT_PUBLIC_ENABLE_FLASHCARDS !== "true") {
    return new Response(
      JSON.stringify({ error: "Flashcard feature is not enabled" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { expeditionId, trailId, cardCount } = flashcardRequestSchema.parse(body)

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

    // Get all messages from the selected trails
    const trailIds = trails.map((t) => t.id)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("role, content, trail_id, created_at")
      .in("trail_id", trailIds)
      .order("created_at", { ascending: true })

    if (messagesError) {
      return new Response("Failed to fetch messages", { status: 500 })
    }

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No conversation history found. Chat with the AI first to generate flashcards.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Build context from messages grouped by trail with message counts for importance weighting
    const trailMap = new Map<string, { title: string; messages: any[]; messageCount: number }>()
    trails.forEach((trail) => {
      trailMap.set(trail.id, { title: trail.title, messages: [], messageCount: 0 })
    })

    messages.forEach((msg) => {
      const trail = trailMap.get(msg.trail_id)
      if (trail) {
        trail.messages.push(msg)
        trail.messageCount++
      }
    })

    // Build conversation context with trail info for the AI
    let conversationContext = `Expedition: ${expedition.title}\n\n`
    const trailInfo: { id: string; title: string; messageCount: number }[] = []

    trailMap.forEach((trail, trailId) => {
      if (trail.messages.length > 0) {
        trailInfo.push({ id: trailId, title: trail.title, messageCount: trail.messageCount })
        conversationContext += `=== Trail: ${trail.title} (ID: ${trailId}) ===\n`
        conversationContext += `Message count: ${trail.messageCount}\n\n`
        trail.messages.forEach((msg) => {
          conversationContext += `${msg.role}: ${msg.content}\n`
        })
        conversationContext += "\n"
      }
    })

    // Generate flashcards using AI
    const systemPrompt = `You are a flashcard generator for an educational learning platform. Based on the conversation history provided, generate ${cardCount} flashcards to help the user review and retain what they've learned.

Rules for generating flashcards:
1. Extract BOTH key concepts/definitions AND important questions the user asked
2. Weight importance by discussion depth - topics with more back-and-forth get higher importance (1-5 scale)
3. The "front" should be a question or prompt that tests recall
4. The "back" should be a concise, clear answer
5. Include the sourceTrailId and sourceTrailTitle for each card based on where the content came from
6. Mark sourceType as "concept" for definitions/facts, "question" for cards based on user questions
7. Make cards focused on one concept each - not too broad
8. Prioritize concepts that were discussed in depth or that the user seemed to struggle with

Available trails:
${trailInfo.map((t) => `- ID: ${t.id}, Title: ${t.title}, Messages: ${t.messageCount}`).join("\n")}

Respond ONLY with valid JSON in this exact format:
{
  "cards": [
    {
      "front": "What is [concept]?",
      "back": "Clear, concise explanation from the conversation.",
      "sourceTrailId": "trail-uuid-here",
      "sourceTrailTitle": "Trail Title Here",
      "sourceType": "concept",
      "importance": 4
    }
  ]
}

Do not include any text before or after the JSON object.`

    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Generate ${cardCount} flashcards based on this conversation:\n\n${conversationContext}`,
      temperature: 0.7,
      maxTokens: 3000,
    })

    // Parse the AI response
    let flashcardData
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      flashcardData = JSON.parse(jsonMatch[0])
      flashcardData = flashcardResponseSchema.parse(flashcardData)
    } catch (parseError) {
      console.error("Failed to parse flashcard response:", result.text)
      return new Response(
        JSON.stringify({
          error: "Failed to generate valid flashcards. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Add IDs and timestamps to cards
    const cardsWithIds = flashcardData.cards.map((card: any, index: number) => ({
      ...card,
      id: `fc-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
    }))

    // Auto-save to database if spaced repetition is enabled
    let savedToDeck = false
    let deckId: string | null = null

    if (process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION === "true") {
      try {
        // Check if deck already exists for this expedition
        const { data: existingDeck } = await supabase
          .from("flashcard_decks")
          .select("id")
          .eq("expedition_id", expeditionId)
          .eq("user_id", user.id)
          .single()

        if (existingDeck) {
          deckId = existingDeck.id
        } else {
          // Create new deck
          const { data: newDeck, error: deckError } = await supabase
            .from("flashcard_decks")
            .insert({
              user_id: user.id,
              expedition_id: expeditionId,
              title: `${expedition.title} Flashcards`,
              description: `Auto-generated flashcards from ${expedition.title}`,
            })
            .select("id")
            .single()

          if (!deckError && newDeck) {
            deckId = newDeck.id
          }
        }

        // Save flashcards to database
        if (deckId) {
          const now = new Date().toISOString()
          const flashcardsToInsert = flashcardData.cards.map((card: any) => ({
            deck_id: deckId,
            user_id: user.id,
            front: card.front,
            back: card.back,
            source_trail_id: card.sourceTrailId || null,
            source_trail_title: card.sourceTrailTitle || null,
            source_type: card.sourceType || "concept",
            importance: card.importance || 3,
            // FSRS initial state
            stability: 0,
            difficulty: 5.0,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 0,
            lapses: 0,
            state: "new",
            due_date: now,
            last_review_date: null,
            is_suspended: false,
            is_buried: false,
            tags: [],
          }))

          const { error: insertError } = await supabase
            .from("flashcards")
            .insert(flashcardsToInsert)

          if (!insertError) {
            savedToDeck = true
          } else {
            console.error("Error auto-saving flashcards:", insertError)
          }
        }
      } catch (saveError) {
        // Non-fatal - cards are still returned for immediate use
        console.error("Error in auto-save:", saveError)
      }
    }

    return new Response(JSON.stringify({
      cards: cardsWithIds,
      savedToDeck,
      deckId,
      message: savedToDeck
        ? "Flashcards generated and saved for spaced repetition!"
        : "Flashcards generated successfully!"
    }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Flashcard generation error:", error)

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request format", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Failed to generate flashcards" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
