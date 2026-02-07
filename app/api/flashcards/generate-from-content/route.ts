import { createClient } from "@/lib/supabase/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const generateFromContentSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters"),
  sourceUrl: z.string().url().optional(),
  sourceTitle: z.string().optional(),
  cardCount: z.number().min(5).max(50).default(10),
  deckTitle: z.string().optional(),
  autoSave: z.boolean().default(true),
});

interface GeneratedCard {
  front: string;
  back: string;
  sourceType: "concept" | "question" | "cloze";
  importance: number;
  tags: string[];
}

/**
 * POST /api/flashcards/generate-from-content
 *
 * Generates flashcards from arbitrary text content or URL
 */
export async function POST(req: NextRequest) {
  // Check feature flag
  if (process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION !== "true") {
    return NextResponse.json(
      { error: "Spaced repetition feature is not enabled" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, sourceUrl, sourceTitle, cardCount, deckTitle, autoSave } =
      generateFromContentSchema.parse(body);

    // Generate flashcards using AI
    const systemPrompt = `You are an expert educational content creator specializing in creating effective flashcards for spaced repetition learning.

Your task is to analyze the provided content and create ${cardCount} high-quality flashcards that:
1. Cover the most important concepts, facts, and relationships
2. Use clear, concise language
3. Test understanding, not just recognition
4. Include a mix of:
   - Concept cards (what is X?)
   - Application cards (how does X work in context Y?)
   - Comparison cards (how does X differ from Y?)
5. Assign importance (1-5) based on how fundamental the concept is
6. Add relevant tags for organization

Return a JSON object with this structure:
{
  "cards": [
    {
      "front": "Question or prompt",
      "back": "Answer or explanation",
      "sourceType": "concept" | "question",
      "importance": 1-5,
      "tags": ["tag1", "tag2"]
    }
  ],
  "suggestedTitle": "A descriptive title for this deck",
  "summary": "Brief summary of what was learned"
}

Do not include any text before or after the JSON object.`;

    const userPrompt = `Create ${cardCount} flashcards from the following content:

${sourceUrl ? `Source: ${sourceUrl}` : ""}
${sourceTitle ? `Title: ${sourceTitle}` : ""}

CONTENT:
${content}

Remember to:
- Focus on the most important and testable information
- Make cards specific and unambiguous
- Vary the question types
- Include context where helpful`;

    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Parse JSON from response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse flashcard data from AI response");
    }

    const flashcardData = JSON.parse(jsonMatch[0]);

    // Add IDs and timestamps to cards
    const cardsWithIds = flashcardData.cards.map(
      (card: GeneratedCard, index: number) => ({
        ...card,
        id: `fc-${Date.now()}-${index}`,
        createdAt: new Date().toISOString(),
        sourceUrl: sourceUrl || null,
        sourceTitle: sourceTitle || flashcardData.suggestedTitle || null,
      })
    );

    // Auto-save to database if enabled
    let savedToDeck = false;
    let deckId: string | null = null;

    if (autoSave) {
      try {
        // Create a new deck for this content
        const finalDeckTitle =
          deckTitle || flashcardData.suggestedTitle || "AI Generated Deck";

        const { data: newDeck, error: deckError } = await supabase
          .from("flashcard_decks")
          .insert({
            user_id: user.id,
            expedition_id: null, // Not tied to an expedition
            title: finalDeckTitle,
            description: sourceUrl
              ? `Generated from ${sourceUrl}`
              : `AI-generated flashcards: ${flashcardData.summary || ""}`,
          })
          .select("id")
          .single();

        if (deckError) {
          console.error("Error creating deck:", deckError);
        } else if (newDeck) {
          deckId = newDeck.id;

          // Save flashcards to database
          const now = new Date().toISOString();
          const flashcardsToInsert = flashcardData.cards.map(
            (card: GeneratedCard) => ({
              deck_id: deckId,
              user_id: user.id,
              front: card.front,
              back: card.back,
              source_trail_id: null,
              source_trail_title: sourceTitle || flashcardData.suggestedTitle,
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
              tags: card.tags || [],
            })
          );

          const { error: insertError } = await supabase
            .from("flashcards")
            .insert(flashcardsToInsert);

          if (!insertError) {
            savedToDeck = true;
          } else {
            console.error("Error auto-saving flashcards:", insertError);
          }
        }
      } catch (saveError) {
        console.error("Error in auto-save:", saveError);
      }
    }

    return NextResponse.json({
      cards: cardsWithIds,
      suggestedTitle: flashcardData.suggestedTitle,
      summary: flashcardData.summary,
      savedToDeck,
      deckId,
      cardCount: cardsWithIds.length,
    });
  } catch (error) {
    console.error("Content flashcard generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate flashcards" },
      { status: 500 }
    );
  }
}
