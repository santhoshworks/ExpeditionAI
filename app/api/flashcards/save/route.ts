import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const saveFlashcardsSchema = z.object({
  expeditionId: z.string().uuid(),
  deckTitle: z.string().optional(),
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
      sourceTrailId: z.string().optional(),
      sourceTrailTitle: z.string().optional(),
      sourceType: z.enum(["concept", "question", "cloze", "image_occlusion"]).optional(),
      importance: z.number().min(1).max(5).optional().default(3),
    })
  ),
});

/**
 * POST /api/flashcards/save
 *
 * Saves AI-generated flashcards to the database with FSRS scheduling
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
    const { expeditionId, deckTitle, cards } = saveFlashcardsSchema.parse(body);

    // Verify expedition ownership
    const { data: expedition, error: expeditionError } = await supabase
      .from("expeditions")
      .select("id, title")
      .eq("id", expeditionId)
      .eq("user_id", user.id)
      .single();

    if (expeditionError || !expedition) {
      return NextResponse.json(
        { error: "Expedition not found or access denied" },
        { status: 403 }
      );
    }

    // Check if deck already exists for this expedition
    let deckId: string;

    const { data: existingDeck } = await supabase
      .from("flashcard_decks")
      .select("id")
      .eq("expedition_id", expeditionId)
      .eq("user_id", user.id)
      .single();

    if (existingDeck) {
      deckId = existingDeck.id;
    } else {
      // Create new deck
      const { data: newDeck, error: deckError } = await supabase
        .from("flashcard_decks")
        .insert({
          user_id: user.id,
          expedition_id: expeditionId,
          title: deckTitle || `${expedition.title} Flashcards`,
          description: `Flashcards from ${expedition.title}`,
        })
        .select("id")
        .single();

      if (deckError || !newDeck) {
        console.error("Error creating deck:", deckError);
        return NextResponse.json(
          { error: "Failed to create flashcard deck" },
          { status: 500 }
        );
      }

      deckId = newDeck.id;
    }

    // Prepare flashcards for insertion
    const now = new Date().toISOString();
    const flashcardsToInsert = cards.map((card) => ({
      deck_id: deckId,
      user_id: user.id,
      front: card.front,
      back: card.back,
      source_trail_id: card.sourceTrailId || null,
      source_trail_title: card.sourceTrailTitle || null,
      source_type: card.sourceType || "concept",
      importance: card.importance,
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
    }));

    // Insert flashcards
    const { data: insertedCards, error: insertError } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("id, front, back");

    if (insertError) {
      console.error("Error inserting flashcards:", insertError);
      return NextResponse.json(
        { error: "Failed to save flashcards" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deckId,
      cardsCreated: insertedCards?.length || 0,
      message: `Saved ${insertedCards?.length || 0} flashcards to your deck`,
    });
  } catch (error) {
    console.error("Error in save flashcards API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
