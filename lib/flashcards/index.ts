/**
 * Flashcard Spaced Repetition System
 *
 * This module provides a complete FSRS (Free Spaced Repetition Scheduler)
 * implementation for intelligent flashcard scheduling.
 */

// FSRS Algorithm
export {
  FSRS,
  Rating,
  State,
  fsrs,
  createNewCardState,
  applyScheduling,
  DEFAULT_PARAMETERS,
  type CardState,
  type SchedulingInfo,
  type SchedulingResult,
} from "./fsrs";

// Scheduler utilities
export {
  buildReviewQueue,
  processReview,
  getIntervalPreview,
  calculateCatchUp,
  calculateStudyStats,
  generateForecast,
  dbToCardState,
  DEFAULT_SRS_SETTINGS,
  type DBFlashcard,
  type DueCardsSummary,
  type ReviewSession,
  type UserSRSSettings,
  type StudyStats,
} from "./scheduler";
