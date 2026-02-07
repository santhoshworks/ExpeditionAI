import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  buildReviewQueue,
  DEFAULT_SRS_SETTINGS,
  type DBFlashcard,
  type DueCardsSummary,
  type UserSRSSettings,
} from "@/lib/flashcards";
import { State } from "@/lib/flashcards";

export async function GET(req: NextRequest) {
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

    const searchParams = req.nextUrl.searchParams;
    const deckId = searchParams.get("deckId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

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

    // Check vacation mode
    if (settings.vacationMode) {
      return NextResponse.json({
        queue: [],
        summary: {
          totalDue: 0,
          newCount: 0,
          learningCount: 0,
          reviewCount: 0,
          overdueCount: 0,
        },
        vacationMode: true,
        message: "Vacation mode is enabled. Reviews are paused.",
      });
    }

    // Build query for due cards
    let query = supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_suspended", false)
      .eq("is_buried", false)
      .lte("due_date", new Date().toISOString());

    if (deckId) {
      query = query.eq("deck_id", deckId);
    }

    const { data: dueCards, error: cardsError } = await query.order("due_date", {
      ascending: true,
    });

    if (cardsError) {
      console.error("Error fetching due cards:", cardsError);
      return NextResponse.json(
        { error: "Failed to fetch due cards" },
        { status: 500 }
      );
    }

    // Get today's new cards studied count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayNewCount } = await supabase
      .from("flashcard_reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("state_before", State.New)
      .gte("reviewed_at", today.toISOString());

    // Build optimized review queue
    const queue = buildReviewQueue(
      (dueCards as DBFlashcard[]) || [],
      settings,
      todayNewCount || 0
    ).slice(0, limit);

    // Calculate summary
    const now = new Date();
    const allCards = (dueCards as DBFlashcard[]) || [];

    const summary: DueCardsSummary = {
      totalDue: allCards.length,
      newCount: allCards.filter((c) => c.state === State.New).length,
      learningCount: allCards.filter(
        (c) => c.state === State.Learning || c.state === State.Relearning
      ).length,
      reviewCount: allCards.filter((c) => c.state === State.Review).length,
      overdueCount: allCards.filter((c) => {
        const due = new Date(c.due_date);
        const daysPast = Math.floor(
          (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
        );
        return c.state === State.Review && daysPast > 1;
      }).length,
    };

    return NextResponse.json({
      queue,
      summary,
      settings: {
        maxNewCardsPerDay: settings.maxNewCardsPerDay,
        maxReviewsPerDay: settings.maxReviewsPerDay,
        desiredRetention: settings.desiredRetention,
      },
    });
  } catch (error) {
    console.error("Error in due cards API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
