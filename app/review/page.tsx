"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layers,
  ArrowLeft,
  RotateCcw,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  Target,
  ChevronRight,
  Keyboard,
  Wand2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FlashcardCard } from "@/components/flashcard/flashcard-card";
import { FSRS, Rating, type DBFlashcard, type DueCardsSummary } from "@/lib/flashcards";

// Feature flag check
const IS_SPACED_REPETITION_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION === "true";

interface ReviewState {
  queue: DBFlashcard[];
  summary: DueCardsSummary;
  currentIndex: number;
  isFlipped: boolean;
  isLoading: boolean;
  error: string | null;
  sessionStats: {
    reviewed: number;
    again: number;
    hard: number;
    good: number;
    easy: number;
    startTime: number;
  };
  cardStartTime: number;
}

export default function ReviewPage() {
  const router = useRouter();

  const [state, setState] = useState<ReviewState>({
    queue: [],
    summary: {
      totalDue: 0,
      newCount: 0,
      learningCount: 0,
      reviewCount: 0,
      overdueCount: 0,
    },
    currentIndex: 0,
    isFlipped: false,
    isLoading: true,
    error: null,
    sessionStats: {
      reviewed: 0,
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
      startTime: Date.now(),
    },
    cardStartTime: Date.now(),
  });

  // Redirect if feature is disabled
  useEffect(() => {
    if (!IS_SPACED_REPETITION_ENABLED) {
      router.replace("/dashboard");
    }
  }, [router]);

  const [intervalPreview, setIntervalPreview] = useState({
    again: "<1d",
    hard: "<1d",
    good: "1d",
    easy: "4d",
  });

  // Enhancement state
  const [enhanceMenuOpen, setEnhanceMenuOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  type EnhanceMode = "improve_clarity" | "add_context" | "make_harder" | "make_easier" | "add_mnemonics";

  const ENHANCE_OPTIONS: { mode: EnhanceMode; label: string }[] = [
    { mode: "improve_clarity", label: "Improve Clarity" },
    { mode: "add_context", label: "Add Context" },
    { mode: "make_harder", label: "Make Harder" },
    { mode: "make_easier", label: "Make Easier" },
    { mode: "add_mnemonics", label: "Add Mnemonics" },
  ];

  const handleEnhanceCard = async (mode: EnhanceMode) => {
    if (!currentCard) return;
    setIsEnhancing(true);
    setEnhanceMenuOpen(false);

    try {
      const response = await fetch("/api/flashcards/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: currentCard.id,
          front: currentCard.front,
          back: currentCard.back,
          enhanceMode: mode,
        }),
      });

      if (!response.ok) throw new Error("Failed to enhance card");

      const data = await response.json();

      // Update the card in the queue
      setState((s) => ({
        ...s,
        queue: s.queue.map((c) =>
          c.id === currentCard.id
            ? { ...c, front: data.enhanced.front, back: data.enhanced.back }
            : c
        ),
      }));

      // Toast with explanation
      const explanation = data.enhanced.explanation;
      if (explanation) {
        toast.success(explanation);
      } else {
        toast.success("Card enhanced!");
      }
    } catch {
      toast.error("Failed to enhance card");
    } finally {
      setIsEnhancing(false);
    }
  };

  const currentCard = state.queue[state.currentIndex];
  const isSessionComplete =
    state.currentIndex >= state.queue.length && state.queue.length > 0;
  const progress =
    state.queue.length > 0
      ? (state.currentIndex / state.queue.length) * 100
      : 0;

  // Fetch due cards
  const fetchDueCards = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/review/due");
      if (!response.ok) {
        throw new Error("Failed to fetch due cards");
      }

      const data = await response.json();

      setState((s) => ({
        ...s,
        queue: data.queue || [],
        summary: data.summary || s.summary,
        isLoading: false,
        currentIndex: 0,
        cardStartTime: Date.now(),
        sessionStats: {
          reviewed: 0,
          again: 0,
          hard: 0,
          good: 0,
          easy: 0,
          startTime: Date.now(),
        },
      }));
    } catch (error) {
      console.error("Error fetching due cards:", error);
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "Failed to load review cards. Please try again.",
      }));
    }
  }, []);

  useEffect(() => {
    fetchDueCards();
  }, [fetchDueCards]);

  // Update interval preview when card changes
  useEffect(() => {
    if (currentCard) {
      const fsrs = new FSRS();
      const cardState = currentCard.state === "new" ? null : {
        stability: currentCard.stability,
        difficulty: currentCard.difficulty,
        elapsedDays: currentCard.elapsed_days,
        scheduledDays: currentCard.scheduled_days,
        reps: currentCard.reps,
        lapses: currentCard.lapses,
        state: currentCard.state as any,
        lastReviewDate: currentCard.last_review_date
          ? new Date(currentCard.last_review_date)
          : null,
      };

      const intervals = fsrs.previewIntervals(cardState);
      setIntervalPreview({
        again: FSRS.formatInterval(intervals.again),
        hard: FSRS.formatInterval(intervals.hard),
        good: FSRS.formatInterval(intervals.good),
        easy: FSRS.formatInterval(intervals.easy),
      });
    }
  }, [currentCard]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentCard || state.isLoading) return;

      // Space to flip
      if (e.code === "Space") {
        e.preventDefault();
        setState((s) => ({ ...s, isFlipped: !s.isFlipped }));
        return;
      }

      // Only allow rating shortcuts when card is flipped
      if (!state.isFlipped) return;

      switch (e.key) {
        case "1":
          handleRating(Rating.Again);
          break;
        case "2":
          handleRating(Rating.Hard);
          break;
        case "3":
          handleRating(Rating.Good);
          break;
        case "4":
          handleRating(Rating.Easy);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, state.isFlipped, state.isLoading]);

  const handleFlip = () => {
    setState((s) => ({ ...s, isFlipped: !s.isFlipped }));
  };

  const handleRating = async (rating: Rating) => {
    if (!currentCard || state.isLoading) return;

    const reviewDurationMs = Date.now() - state.cardStartTime;

    try {
      const response = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcardId: currentCard.id,
          rating,
          reviewDurationMs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      // Update session stats and close enhance menu
      setEnhanceMenuOpen(false);
      setState((s) => ({
        ...s,
        currentIndex: s.currentIndex + 1,
        isFlipped: false,
        cardStartTime: Date.now(),
        sessionStats: {
          ...s.sessionStats,
          reviewed: s.sessionStats.reviewed + 1,
          again: s.sessionStats.again + (rating === Rating.Again ? 1 : 0),
          hard: s.sessionStats.hard + (rating === Rating.Hard ? 1 : 0),
          good: s.sessionStats.good + (rating === Rating.Good ? 1 : 0),
          easy: s.sessionStats.easy + (rating === Rating.Easy ? 1 : 0),
        },
      }));
    } catch (error) {
      console.error("Error submitting review:", error);
      // Continue anyway - show next card
      setState((s) => ({
        ...s,
        currentIndex: s.currentIndex + 1,
        isFlipped: false,
        cardStartTime: Date.now(),
      }));
    }
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-amber-100 dark:bg-amber-950 p-4 rounded-full mb-4 inline-block">
            <Layers className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Loading Review Queue
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Preparing your cards...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="bg-red-100 dark:bg-red-950 p-4 rounded-full mb-4 inline-block">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Error Loading Cards
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {state.error}
            </p>
            <Button onClick={fetchDueCards} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state - no cards due
  if (state.queue.length === 0 && !state.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="border-b bg-white dark:bg-slate-900 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              href="/learn"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Link>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex items-center justify-center p-8" style={{ minHeight: "calc(100vh - 73px)" }}>
          <div className="text-center max-w-md">
            <div className="bg-green-100 dark:bg-green-950 p-6 rounded-full mb-6 inline-block">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              All Caught Up!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You have no cards due for review right now. Keep learning to generate
              more flashcards, or check back later.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/learn">
                <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                  <Sparkles className="h-4 w-4" />
                  Continue Learning
                </Button>
              </Link>
              <Button variant="outline" onClick={fetchDueCards} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Session complete
  if (isSessionComplete) {
    const sessionDuration = Math.round(
      (Date.now() - state.sessionStats.startTime) / 1000 / 60
    );
    const accuracy =
      state.sessionStats.reviewed > 0
        ? Math.round(
            ((state.sessionStats.good + state.sessionStats.easy) /
              state.sessionStats.reviewed) *
              100
          )
        : 0;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="border-b bg-white dark:bg-slate-900 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link
              href="/learn"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Link>
          </div>
        </header>

        {/* Session Complete */}
        <div className="flex items-center justify-center p-8" style={{ minHeight: "calc(100vh - 73px)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="bg-amber-100 dark:bg-amber-950 p-6 rounded-full mb-6 inline-block">
              <Flame className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Session Complete!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Great work! Here's how you did:
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {state.sessionStats.reviewed}
                  </div>
                  <div className="text-sm text-slate-500">Cards Reviewed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-slate-500">Accuracy</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {sessionDuration}
                  </div>
                  <div className="text-sm text-slate-500">Minutes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center gap-1 mb-1">
                    <span className="text-red-500">{state.sessionStats.again}</span>
                    <span className="text-orange-500">{state.sessionStats.hard}</span>
                    <span className="text-green-500">{state.sessionStats.good}</span>
                    <span className="text-blue-500">{state.sessionStats.easy}</span>
                  </div>
                  <div className="text-sm text-slate-500">Rating Breakdown</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/learn">
                <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                  <Sparkles className="h-4 w-4" />
                  Continue Learning
                </Button>
              </Link>
              <Button variant="outline" onClick={fetchDueCards} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Review More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main review interface
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/learn"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit
            </Link>

            <div className="flex items-center gap-3">
              {/* Queue stats */}
              <div className="flex gap-2 text-sm">
                {state.summary.newCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {state.summary.newCount} New
                  </Badge>
                )}
                {state.summary.learningCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100">
                    <Clock className="h-3 w-3 mr-1" />
                    {state.summary.learningCount} Learning
                  </Badge>
                )}
                {state.summary.reviewCount > 0 && (
                  <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {state.summary.reviewCount} Review
                  </Badge>
                )}
              </div>

              {/* Card counter */}
              <span className="font-semibold text-slate-900 dark:text-white">
                {state.currentIndex + 1} / {state.queue.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Source badge */}
          {currentCard?.source_trail_title && (
            <div className="flex justify-center mb-4">
              <Badge variant="outline" className="text-xs">
                From: {currentCard.source_trail_title}
              </Badge>
            </div>
          )}

          {/* Card state badge */}
          <div className="flex justify-center mb-4">
            <Badge
              variant="outline"
              className={
                currentCard?.state === "new"
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : currentCard?.state === "learning" || currentCard?.state === "relearning"
                  ? "bg-orange-50 text-orange-600 border-orange-200"
                  : "bg-green-50 text-green-600 border-green-200"
              }
            >
              {currentCard?.state === "new"
                ? "New Card"
                : currentCard?.state === "learning"
                ? "Learning"
                : currentCard?.state === "relearning"
                ? "Relearning"
                : "Review"}
            </Badge>
          </div>

          {/* Flashcard */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <FlashcardCard
                front={currentCard?.front || ""}
                back={currentCard?.back || ""}
                isFlipped={state.isFlipped}
                onFlip={handleFlip}
                importance={currentCard?.importance}
              />
            </motion.div>
          </AnimatePresence>

          {/* Instructions */}
          {!state.isFlipped && (
            <p className="text-center text-sm text-slate-500 mt-4">
              Tap the card or press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">Space</kbd> to reveal
            </p>
          )}

          {/* Enhance button - shown when card is flipped */}
          {state.isFlipped && currentCard && (
            <div className="flex justify-center mt-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                  disabled={isEnhancing}
                  onClick={() => setEnhanceMenuOpen(!enhanceMenuOpen)}
                >
                  {isEnhancing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  {isEnhancing ? "Enhancing..." : "Enhance Card"}
                </Button>

                {enhanceMenuOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1">
                    {ENHANCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.mode}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                        onClick={() => handleEnhanceCard(opt.mode)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating buttons */}
      <div className="border-t bg-white dark:bg-slate-900 p-4">
        <div className="max-w-lg mx-auto">
          {state.isFlipped ? (
            <div className="space-y-3">
              {/* Rating buttons with intervals */}
              <div className="grid grid-cols-4 gap-2">
                <Button
                  onClick={() => handleRating(Rating.Again)}
                  variant="outline"
                  className="flex-col h-auto py-3 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
                >
                  <span className="text-xs font-medium">{intervalPreview.again}</span>
                  <span className="text-sm font-semibold">Again</span>
                  <span className="text-xs text-slate-400">1</span>
                </Button>
                <Button
                  onClick={() => handleRating(Rating.Hard)}
                  variant="outline"
                  className="flex-col h-auto py-3 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-600"
                >
                  <span className="text-xs font-medium">{intervalPreview.hard}</span>
                  <span className="text-sm font-semibold">Hard</span>
                  <span className="text-xs text-slate-400">2</span>
                </Button>
                <Button
                  onClick={() => handleRating(Rating.Good)}
                  variant="outline"
                  className="flex-col h-auto py-3 border-green-200 hover:bg-green-50 hover:border-green-300 text-green-600"
                >
                  <span className="text-xs font-medium">{intervalPreview.good}</span>
                  <span className="text-sm font-semibold">Good</span>
                  <span className="text-xs text-slate-400">3</span>
                </Button>
                <Button
                  onClick={() => handleRating(Rating.Easy)}
                  variant="outline"
                  className="flex-col h-auto py-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                >
                  <span className="text-xs font-medium">{intervalPreview.easy}</span>
                  <span className="text-sm font-semibold">Easy</span>
                  <span className="text-xs text-slate-400">4</span>
                </Button>
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <Keyboard className="h-3 w-3" />
                Press 1-4 to rate
              </p>
            </div>
          ) : (
            <Button
              onClick={handleFlip}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              Show Answer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
