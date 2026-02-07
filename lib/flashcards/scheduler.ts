/**
 * Flashcard Scheduler
 *
 * Handles review queue management, smart catch-up for overdue cards,
 * and study session tracking.
 */

import { FSRS, State, Rating, CardState, SchedulingInfo, fsrs } from "./fsrs";

// Database flashcard type (matches Supabase schema)
export interface DBFlashcard {
  id: string;
  deck_id: string;
  user_id: string;
  front: string;
  back: string;
  source_trail_id: string | null;
  source_trail_title: string | null;
  source_type: "concept" | "question" | "cloze" | "image_occlusion" | null;
  importance: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: State;
  due_date: string;
  last_review_date: string | null;
  is_suspended: boolean;
  is_buried: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

// Due cards summary
export interface DueCardsSummary {
  totalDue: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  overdueCount: number;
}

// Review session state
export interface ReviewSession {
  id: string;
  deckId: string | null;
  userId: string;
  queue: DBFlashcard[];
  currentIndex: number;
  startedAt: Date;
  stats: {
    cardsStudied: number;
    newCards: number;
    reviewCards: number;
    againCount: number;
    hardCount: number;
    goodCount: number;
    easyCount: number;
    totalTimeMs: number;
  };
}

// User SRS settings
export interface UserSRSSettings {
  fsrsParameters: number[];
  desiredRetention: number;
  maxNewCardsPerDay: number;
  maxReviewsPerDay: number;
  vacationMode: boolean;
  catchUpEnabled: boolean;
  catchUpDays: number;
  learningSteps: number[]; // in minutes
  relearningSteps: number[]; // in minutes
}

export const DEFAULT_SRS_SETTINGS: UserSRSSettings = {
  fsrsParameters: [],
  desiredRetention: 0.9,
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 200,
  vacationMode: false,
  catchUpEnabled: true,
  catchUpDays: 7,
  learningSteps: [1, 10], // 1 min, 10 min
  relearningSteps: [10], // 10 min
};

/**
 * Convert database flashcard to CardState for FSRS
 */
export function dbToCardState(card: DBFlashcard): CardState {
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReviewDate: card.last_review_date
      ? new Date(card.last_review_date)
      : null,
  };
}

/**
 * Calculate smart catch-up distribution for overdue cards
 *
 * Instead of showing all overdue cards at once (overwhelming),
 * spread them over multiple days while prioritizing most overdue.
 */
export function calculateCatchUp(
  overdueCards: DBFlashcard[],
  catchUpDays: number,
  maxReviewsPerDay: number
): Map<number, DBFlashcard[]> {
  if (overdueCards.length === 0 || catchUpDays <= 0) {
    return new Map([[0, []]]);
  }

  // Sort by how overdue (most overdue first)
  const sorted = [...overdueCards].sort((a, b) => {
    const aOverdue = new Date().getTime() - new Date(a.due_date).getTime();
    const bOverdue = new Date().getTime() - new Date(b.due_date).getTime();
    return bOverdue - aOverdue;
  });

  // Distribute across days
  const distribution = new Map<number, DBFlashcard[]>();
  const cardsPerDay = Math.ceil(sorted.length / catchUpDays);
  const effectivePerDay = Math.min(cardsPerDay, maxReviewsPerDay);

  let dayIndex = 0;
  let dayCount = 0;

  for (const card of sorted) {
    if (!distribution.has(dayIndex)) {
      distribution.set(dayIndex, []);
    }

    distribution.get(dayIndex)!.push(card);
    dayCount++;

    if (dayCount >= effectivePerDay) {
      dayIndex++;
      dayCount = 0;
    }
  }

  return distribution;
}

/**
 * Build optimized review queue
 *
 * Priority order:
 * 1. Learning/Relearning cards (time-sensitive)
 * 2. Overdue review cards (prioritize most overdue)
 * 3. Due review cards
 * 4. New cards (up to daily limit)
 */
export function buildReviewQueue(
  dueCards: DBFlashcard[],
  settings: UserSRSSettings,
  todayNewCardsStudied: number = 0
): DBFlashcard[] {
  const now = new Date();

  // Separate by category
  const learning: DBFlashcard[] = [];
  const relearning: DBFlashcard[] = [];
  const overdue: DBFlashcard[] = [];
  const dueReview: DBFlashcard[] = [];
  const newCards: DBFlashcard[] = [];

  for (const card of dueCards) {
    if (card.is_suspended || card.is_buried) continue;

    const dueDate = new Date(card.due_date);

    if (card.state === State.New) {
      newCards.push(card);
    } else if (card.state === State.Learning) {
      learning.push(card);
    } else if (card.state === State.Relearning) {
      relearning.push(card);
    } else if (card.state === State.Review) {
      // Check if overdue (more than 1 day past due)
      const daysPastDue = Math.floor(
        (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysPastDue > 1) {
        overdue.push(card);
      } else if (dueDate <= now) {
        dueReview.push(card);
      }
    }
  }

  // Sort overdue by most overdue first
  overdue.sort((a, b) => {
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  // Limit new cards
  const newCardsToday = Math.max(
    0,
    settings.maxNewCardsPerDay - todayNewCardsStudied
  );
  const limitedNewCards = newCards.slice(0, newCardsToday);

  // Build final queue
  const queue: DBFlashcard[] = [];

  // 1. Learning first (interleave for better retention)
  queue.push(...learning);

  // 2. Relearning
  queue.push(...relearning);

  // 3. Overdue (with optional catch-up spreading)
  if (settings.catchUpEnabled && overdue.length > settings.maxReviewsPerDay) {
    const catchUpMap = calculateCatchUp(
      overdue,
      settings.catchUpDays,
      settings.maxReviewsPerDay
    );
    const todayOverdue = catchUpMap.get(0) || [];
    queue.push(...todayOverdue);
  } else {
    queue.push(...overdue);
  }

  // 4. Due reviews
  queue.push(...dueReview);

  // 5. New cards at the end
  queue.push(...limitedNewCards);

  // Limit total reviews per day
  return queue.slice(0, settings.maxReviewsPerDay);
}

/**
 * Process a review and get the updated card data
 */
export function processReview(
  card: DBFlashcard,
  rating: Rating,
  reviewDurationMs: number,
  settings?: UserSRSSettings
): {
  updatedCard: Partial<DBFlashcard>;
  reviewLog: {
    rating: Rating;
    stateBefore: State;
    stabilityBefore: number;
    difficultyBefore: number;
    elapsedDays: number;
    stateAfter: State;
    stabilityAfter: number;
    difficultyAfter: number;
    scheduledDays: number;
    reviewDurationMs: number;
  };
} {
  const now = new Date();
  const cardState = dbToCardState(card);

  // Create FSRS instance with user parameters if provided
  const scheduler = settings?.fsrsParameters?.length
    ? new FSRS(settings.fsrsParameters, settings.desiredRetention)
    : fsrs;

  // Get scheduling for this rating
  const scheduling = scheduler.schedule(cardState, rating, now);

  // Build review log
  const reviewLog = {
    rating,
    stateBefore: card.state,
    stabilityBefore: card.stability,
    difficultyBefore: card.difficulty,
    elapsedDays: card.elapsed_days,
    stateAfter: scheduling.state,
    stabilityAfter: scheduling.stability,
    difficultyAfter: scheduling.difficulty,
    scheduledDays: scheduling.scheduledDays,
    reviewDurationMs,
  };

  // Build updated card data
  const updatedCard: Partial<DBFlashcard> = {
    stability: scheduling.stability,
    difficulty: scheduling.difficulty,
    scheduled_days: scheduling.scheduledDays,
    elapsed_days: 0,
    reps: card.reps + 1,
    lapses: rating === Rating.Again ? card.lapses + 1 : card.lapses,
    state: scheduling.state,
    due_date: scheduling.dueDate.toISOString(),
    last_review_date: now.toISOString(),
    updated_at: now.toISOString(),
  };

  return { updatedCard, reviewLog };
}

/**
 * Get interval preview text for UI
 */
export function getIntervalPreview(
  card: DBFlashcard | null,
  settings?: UserSRSSettings
): { again: string; hard: string; good: string; easy: string } {
  const scheduler = settings?.fsrsParameters?.length
    ? new FSRS(settings.fsrsParameters, settings.desiredRetention)
    : fsrs;

  const cardState = card ? dbToCardState(card) : null;
  const intervals = scheduler.previewIntervals(cardState);

  return {
    again: FSRS.formatInterval(intervals.again),
    hard: FSRS.formatInterval(intervals.hard),
    good: FSRS.formatInterval(intervals.good),
    easy: FSRS.formatInterval(intervals.easy),
  };
}

/**
 * Calculate study statistics for a time period
 */
export interface StudyStats {
  cardsReviewed: number;
  newCardsLearned: number;
  reviewAccuracy: number; // % of cards rated Good or Easy
  averageTimePerCard: number; // ms
  streak: number;
  retentionRate: number;
}

export function calculateStudyStats(
  reviews: Array<{
    rating: number;
    review_duration_ms: number;
    state_before: State;
    reviewed_at: string;
  }>
): StudyStats {
  if (reviews.length === 0) {
    return {
      cardsReviewed: 0,
      newCardsLearned: 0,
      reviewAccuracy: 0,
      averageTimePerCard: 0,
      streak: 0,
      retentionRate: 0,
    };
  }

  const totalReviews = reviews.length;
  const newCards = reviews.filter((r) => r.state_before === State.New).length;
  const goodOrEasy = reviews.filter(
    (r) => r.rating === Rating.Good || r.rating === Rating.Easy
  ).length;
  const totalTime = reviews.reduce((sum, r) => sum + (r.review_duration_ms || 0), 0);

  // Calculate streak (consecutive days with reviews)
  const reviewDates = new Set(
    reviews.map((r) => new Date(r.reviewed_at).toDateString())
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (reviewDates.has(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Retention rate (% not forgotten on first try)
  const notForgotten = reviews.filter((r) => r.rating !== Rating.Again).length;

  return {
    cardsReviewed: totalReviews,
    newCardsLearned: newCards,
    reviewAccuracy: Math.round((goodOrEasy / totalReviews) * 100),
    averageTimePerCard: Math.round(totalTime / totalReviews),
    streak,
    retentionRate: Math.round((notForgotten / totalReviews) * 100),
  };
}

/**
 * Generate review forecast for the next N days
 */
export function generateForecast(
  cards: DBFlashcard[],
  days: number = 30
): Array<{ date: Date; count: number }> {
  const forecast: Map<string, number> = new Map();

  // Initialize all days with 0
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    forecast.set(date.toDateString(), 0);
  }

  // Count due cards per day
  for (const card of cards) {
    if (card.is_suspended) continue;

    const dueDate = new Date(card.due_date);
    dueDate.setHours(0, 0, 0, 0);

    const dateStr = dueDate.toDateString();
    if (forecast.has(dateStr)) {
      forecast.set(dateStr, (forecast.get(dateStr) || 0) + 1);
    }
  }

  // Convert to array
  return Array.from(forecast.entries())
    .map(([dateStr, count]) => ({
      date: new Date(dateStr),
      count,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
