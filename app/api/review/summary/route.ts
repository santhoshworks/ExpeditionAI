import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { State } from "@/lib/flashcards";

/**
 * GET /api/review/summary
 *
 * Returns a quick summary of due cards for the dashboard widget
 */
export async function GET() {
  // Check feature flag - return empty summary if disabled (widget will hide itself)
  if (process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION !== "true") {
    return NextResponse.json({
      totalDue: 0,
      newCount: 0,
      learningCount: 0,
      reviewCount: 0,
      overdueCount: 0,
      totalCards: 0,
      reviewedToday: 0,
      streak: 0,
      featureDisabled: true,
    });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get all cards for the user
    const { data: cards, error } = await supabase
      .from("flashcards")
      .select("state, due_date, is_suspended")
      .eq("user_id", user.id)
      .eq("is_suspended", false)
      .eq("is_buried", false);

    if (error) {
      console.error("Error fetching cards:", error);
      return NextResponse.json(
        { error: "Failed to fetch cards" },
        { status: 500 }
      );
    }

    // Calculate summary
    let totalDue = 0;
    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;
    let overdueCount = 0;
    let totalCards = cards?.length || 0;

    for (const card of cards || []) {
      const dueDate = new Date(card.due_date);
      const isDue = dueDate <= now;

      if (isDue) {
        totalDue++;

        if (card.state === State.New) {
          newCount++;
        } else if (
          card.state === State.Learning ||
          card.state === State.Relearning
        ) {
          learningCount++;
        } else if (card.state === State.Review) {
          reviewCount++;
          // Check if overdue (more than 1 day past due)
          if (dueDate < oneDayAgo) {
            overdueCount++;
          }
        }
      }
    }

    // Get today's study stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: reviewedToday } = await supabase
      .from("flashcard_reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("reviewed_at", today.toISOString());

    // Get current streak
    const { data: streakData } = await supabase
      .from("learning_streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      totalDue,
      newCount,
      learningCount,
      reviewCount,
      overdueCount,
      totalCards,
      reviewedToday: reviewedToday || 0,
      streak: streakData?.current_streak || 0,
    });
  } catch (error) {
    console.error("Error in summary API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
