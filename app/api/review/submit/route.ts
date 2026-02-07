import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  processReview,
  DEFAULT_SRS_SETTINGS,
  type DBFlashcard,
  type UserSRSSettings,
} from "@/lib/flashcards";
import { Rating } from "@/lib/flashcards";

const reviewSchema = z.object({
  flashcardId: z.string().uuid(),
  rating: z.number().min(1).max(4),
  reviewDurationMs: z.number().min(0).optional().default(0),
});

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
    const { flashcardId, rating, reviewDurationMs } = reviewSchema.parse(body);

    // Get the flashcard
    const { data: card, error: cardError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", flashcardId)
      .eq("user_id", user.id)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 }
      );
    }

    // Get user's SRS settings
    const { data: userSettings } = await supabase
      .from("user_srs_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const settings: UserSRSSettings = userSettings
      ? {
          fsrsParameters: userSettings.fsrs_parameters || [],
          desiredRetention: userSettings.desired_retention || 0.9,
          maxNewCardsPerDay: userSettings.max_new_cards_per_day || 20,
          maxReviewsPerDay: userSettings.max_reviews_per_day || 200,
          vacationMode: userSettings.vacation_mode || false,
          catchUpEnabled: userSettings.catch_up_enabled ?? true,
          catchUpDays: userSettings.catch_up_days || 7,
          learningSteps: userSettings.learning_steps || [1, 10],
          relearningSteps: userSettings.relearning_steps || [10],
        }
      : DEFAULT_SRS_SETTINGS;

    // Process the review using FSRS
    const { updatedCard, reviewLog } = processReview(
      card as DBFlashcard,
      rating as Rating,
      reviewDurationMs,
      settings
    );

    // Update the flashcard
    const { error: updateError } = await supabase
      .from("flashcards")
      .update(updatedCard)
      .eq("id", flashcardId);

    if (updateError) {
      console.error("Error updating flashcard:", updateError);
      return NextResponse.json(
        { error: "Failed to update flashcard" },
        { status: 500 }
      );
    }

    // Log the review
    const { error: logError } = await supabase.from("flashcard_reviews").insert({
      flashcard_id: flashcardId,
      user_id: user.id,
      rating: reviewLog.rating,
      state_before: reviewLog.stateBefore,
      stability_before: reviewLog.stabilityBefore,
      difficulty_before: reviewLog.difficultyBefore,
      elapsed_days: reviewLog.elapsedDays,
      state_after: reviewLog.stateAfter,
      stability_after: reviewLog.stabilityAfter,
      difficulty_after: reviewLog.difficultyAfter,
      scheduled_days: reviewLog.scheduledDays,
      review_duration_ms: reviewLog.reviewDurationMs,
    });

    if (logError) {
      console.error("Error logging review:", logError);
      // Non-fatal - continue anyway
    }

    // Update study session if one exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await supabase.rpc("update_study_session_stats", {
      p_user_id: user.id,
      p_deck_id: card.deck_id,
      p_rating: rating,
      p_is_new: card.state === "new",
      p_duration_ms: reviewDurationMs,
    });

    return NextResponse.json({
      success: true,
      updatedCard: {
        ...card,
        ...updatedCard,
      },
      nextReviewIn: updatedCard.scheduled_days,
      nextReviewDate: updatedCard.due_date,
    });
  } catch (error) {
    console.error("Error in review submit API:", error);

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
