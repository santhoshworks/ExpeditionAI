/**
 * FSRS (Free Spaced Repetition Scheduler) v4 Implementation
 *
 * A modern spaced repetition algorithm that optimizes review scheduling
 * to maximize retention while minimizing review load.
 *
 * Based on: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * Key concepts:
 * - Stability (S): The number of days until retrievability drops to 90%
 * - Difficulty (D): How hard the card is (1-10 scale)
 * - Retrievability (R): Probability of successful recall at current moment
 */

// Rating scale (matches Anki)
export enum Rating {
  Again = 1, // Complete failure - reset learning
  Hard = 2, // Correct but with difficulty
  Good = 3, // Correct with some effort (default)
  Easy = 4, // Correct with no effort
}

// Card states
export enum State {
  New = "new", // Never reviewed
  Learning = "learning", // In initial learning phase
  Review = "review", // Graduated to review phase
  Relearning = "relearning", // Failed review, back to learning
}

// FSRS v4 default parameters (17 values)
// Optimized from 700+ million reviews
export const DEFAULT_PARAMETERS: number[] = [
  0.4, // w0: Initial stability for Again
  0.6, // w1: Initial stability for Hard
  2.4, // w2: Initial stability for Good
  5.8, // w3: Initial stability for Easy
  4.93, // w4: Difficulty base
  0.94, // w5: Difficulty factor
  0.86, // w6: Difficulty mean reversion
  0.01, // w7: Difficulty mean reversion weight
  1.49, // w8: Stability factor (after recall)
  0.14, // w9: Stability decay
  0.94, // w10: Retrievability factor
  2.18, // w11: Stability after forgetting - base
  0.05, // w12: Stability after forgetting - difficulty factor
  0.34, // w13: Stability after forgetting - stability factor
  1.26, // w14: Stability after forgetting - retrievability factor
  0.29, // w15: Hard penalty
  2.61, // w16: Easy bonus
];

// Card memory state
export interface CardState {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: State;
  lastReviewDate: Date | null;
}

// Scheduling result for a single rating
export interface SchedulingInfo {
  rating: Rating;
  state: State;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  dueDate: Date;
}

// Complete scheduling result for all ratings
export interface SchedulingResult {
  again: SchedulingInfo;
  hard: SchedulingInfo;
  good: SchedulingInfo;
  easy: SchedulingInfo;
}

export class FSRS {
  private w: number[];
  private desiredRetention: number;
  private maxInterval: number;

  constructor(
    parameters: number[] = DEFAULT_PARAMETERS,
    desiredRetention: number = 0.9,
    maxInterval: number = 36500 // 100 years
  ) {
    this.w = parameters;
    this.desiredRetention = Math.max(0.7, Math.min(0.99, desiredRetention));
    this.maxInterval = maxInterval;
  }

  /**
   * Calculate retrievability (probability of recall) at time t
   * R(t,S) = (1 + t/(9S))^(-1)
   */
  retrievability(elapsedDays: number, stability: number): number {
    if (stability <= 0) return 0;
    return Math.pow(1 + elapsedDays / (9 * stability), -1);
  }

  /**
   * Calculate initial stability based on first rating
   * S0(G) = w[G-1]
   */
  private initStability(rating: Rating): number {
    return Math.max(0.1, this.w[rating - 1]);
  }

  /**
   * Calculate initial difficulty based on first rating
   * D0(G) = w4 - (G - 3) * w5
   */
  private initDifficulty(rating: Rating): number {
    const d = this.w[4] - (rating - 3) * this.w[5];
    return this.constrainDifficulty(d);
  }

  /**
   * Constrain difficulty to valid range [1, 10]
   */
  private constrainDifficulty(d: number): number {
    return Math.max(1, Math.min(10, d));
  }

  /**
   * Calculate new difficulty after review
   * D'(D,G) = w7 * D0(3) + (1 - w7) * (D - w6 * (G - 3))
   */
  private nextDifficulty(currentDifficulty: number, rating: Rating): number {
    const d0 = this.w[4]; // D0(3) = w4
    const delta = -this.w[6] * (rating - 3);
    const newD = this.w[7] * d0 + (1 - this.w[7]) * (currentDifficulty + delta);
    return this.constrainDifficulty(newD);
  }

  /**
   * Calculate new stability after successful recall
   * S'_r(D,S,R,G) = S * (e^(w8) * (11-D) * S^(-w9) * (e^(w10*(1-R)) - 1) * hardPenalty * easyBonus + 1)
   */
  private recallStability(
    difficulty: number,
    stability: number,
    retrievability: number,
    rating: Rating
  ): number {
    const hardPenalty = rating === Rating.Hard ? this.w[15] : 1;
    const easyBonus = rating === Rating.Easy ? this.w[16] : 1;

    const factor =
      Math.exp(this.w[8]) *
      (11 - difficulty) *
      Math.pow(stability, -this.w[9]) *
      (Math.exp(this.w[10] * (1 - retrievability)) - 1) *
      hardPenalty *
      easyBonus;

    return stability * (factor + 1);
  }

  /**
   * Calculate new stability after forgetting (lapse)
   * S'_f(D,S,R) = w11 * D^(-w12) * ((S+1)^w13 - 1) * e^(w14*(1-R))
   */
  private forgetStability(
    difficulty: number,
    stability: number,
    retrievability: number
  ): number {
    return (
      this.w[11] *
      Math.pow(difficulty, -this.w[12]) *
      (Math.pow(stability + 1, this.w[13]) - 1) *
      Math.exp(this.w[14] * (1 - retrievability))
    );
  }

  /**
   * Calculate interval from stability and desired retention
   * I(r,S) = 9S * (1/r - 1)
   */
  private intervalFromStability(stability: number): number {
    const interval = 9 * stability * (1 / this.desiredRetention - 1);
    return Math.min(
      this.maxInterval,
      Math.max(1, Math.round(interval))
    );
  }

  /**
   * Schedule a new card (first review)
   */
  scheduleNew(now: Date = new Date()): SchedulingResult {
    return {
      again: this.createSchedulingInfo(Rating.Again, State.Learning, now, true),
      hard: this.createSchedulingInfo(Rating.Hard, State.Learning, now, true),
      good: this.createSchedulingInfo(Rating.Good, State.Learning, now, true),
      easy: this.createSchedulingInfo(Rating.Easy, State.Review, now, true),
    };
  }

  /**
   * Create scheduling info for a rating on a new card
   */
  private createSchedulingInfo(
    rating: Rating,
    state: State,
    now: Date,
    isNew: boolean,
    currentState?: CardState
  ): SchedulingInfo {
    if (isNew) {
      const stability = this.initStability(rating);
      const difficulty = this.initDifficulty(rating);

      // New cards: short intervals for learning, full interval for Easy
      let scheduledDays: number;
      if (rating === Rating.Again) {
        scheduledDays = 0; // Same day (minutes later in practice)
      } else if (rating === Rating.Hard) {
        scheduledDays = 0; // Same day
      } else if (rating === Rating.Good) {
        scheduledDays = 1; // Next day
      } else {
        scheduledDays = this.intervalFromStability(stability);
      }

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + scheduledDays);

      return {
        rating,
        state,
        stability,
        difficulty,
        scheduledDays,
        dueDate,
      };
    }

    // Existing card
    const { stability, difficulty, elapsedDays } = currentState!;
    const retrievability = this.retrievability(elapsedDays, stability);

    let newStability: number;
    let newDifficulty: number;
    let newState: State;
    let scheduledDays: number;

    if (rating === Rating.Again) {
      // Lapse - forgot the card
      newStability = this.forgetStability(difficulty, stability, retrievability);
      newDifficulty = this.nextDifficulty(difficulty, rating);
      newState = State.Relearning;
      scheduledDays = 0; // Review again today
    } else {
      // Successful recall
      newStability = this.recallStability(
        difficulty,
        stability,
        retrievability,
        rating
      );
      newDifficulty = this.nextDifficulty(difficulty, rating);
      newState = State.Review;
      scheduledDays = this.intervalFromStability(newStability);
    }

    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + scheduledDays);

    return {
      rating,
      state: newState,
      stability: newStability,
      difficulty: newDifficulty,
      scheduledDays,
      dueDate,
    };
  }

  /**
   * Schedule a card that has been reviewed before
   */
  scheduleReview(cardState: CardState, now: Date = new Date()): SchedulingResult {
    // Calculate elapsed days since last review
    const elapsedDays = cardState.lastReviewDate
      ? Math.max(
          0,
          Math.floor(
            (now.getTime() - cardState.lastReviewDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

    const stateWithElapsed = { ...cardState, elapsedDays };

    return {
      again: this.createSchedulingInfo(
        Rating.Again,
        State.Relearning,
        now,
        false,
        stateWithElapsed
      ),
      hard: this.createSchedulingInfo(
        Rating.Hard,
        State.Review,
        now,
        false,
        stateWithElapsed
      ),
      good: this.createSchedulingInfo(
        Rating.Good,
        State.Review,
        now,
        false,
        stateWithElapsed
      ),
      easy: this.createSchedulingInfo(
        Rating.Easy,
        State.Review,
        now,
        false,
        stateWithElapsed
      ),
    };
  }

  /**
   * Get the scheduling result for a specific rating
   */
  schedule(
    cardState: CardState | null,
    rating: Rating,
    now: Date = new Date()
  ): SchedulingInfo {
    const result =
      cardState === null || cardState.state === State.New
        ? this.scheduleNew(now)
        : this.scheduleReview(cardState, now);

    switch (rating) {
      case Rating.Again:
        return result.again;
      case Rating.Hard:
        return result.hard;
      case Rating.Good:
        return result.good;
      case Rating.Easy:
        return result.easy;
    }
  }

  /**
   * Preview intervals for all ratings
   * Useful for showing user what will happen for each choice
   */
  previewIntervals(cardState: CardState | null, now: Date = new Date()): {
    again: number;
    hard: number;
    good: number;
    easy: number;
  } {
    const result =
      cardState === null || cardState.state === State.New
        ? this.scheduleNew(now)
        : this.scheduleReview(cardState, now);

    return {
      again: result.again.scheduledDays,
      hard: result.hard.scheduledDays,
      good: result.good.scheduledDays,
      easy: result.easy.scheduledDays,
    };
  }

  /**
   * Format interval for display
   */
  static formatInterval(days: number): string {
    if (days === 0) return "<1d";
    if (days < 30) return `${days}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${(days / 365).toFixed(1)}y`;
  }

  /**
   * Get retention rate at current time
   */
  currentRetention(cardState: CardState, now: Date = new Date()): number {
    if (cardState.state === State.New || !cardState.lastReviewDate) return 0;

    const elapsedDays = Math.max(
      0,
      Math.floor(
        (now.getTime() - cardState.lastReviewDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    return this.retrievability(elapsedDays, cardState.stability);
  }
}

// Singleton instance with default parameters
export const fsrs = new FSRS();

// Helper to create initial card state
export function createNewCardState(): CardState {
  return {
    stability: 0,
    difficulty: 5.0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
    lastReviewDate: null,
  };
}

// Helper to apply scheduling result to card state
export function applyScheduling(
  cardState: CardState,
  scheduling: SchedulingInfo,
  now: Date = new Date()
): CardState {
  return {
    ...cardState,
    stability: scheduling.stability,
    difficulty: scheduling.difficulty,
    scheduledDays: scheduling.scheduledDays,
    elapsedDays: 0,
    reps: cardState.reps + 1,
    lapses:
      scheduling.rating === Rating.Again ? cardState.lapses + 1 : cardState.lapses,
    state: scheduling.state,
    lastReviewDate: now,
  };
}
