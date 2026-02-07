"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DueSummary {
  totalDue: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  overdueCount: number;
  totalCards: number;
  reviewedToday: number;
  streak: number;
}

export function DueCardsWidget() {
  const [summary, setSummary] = useState<DueSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check feature flag - if disabled, don't render anything
  const isFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION === "true";

  useEffect(() => {
    // Skip fetching if feature is disabled
    if (!isFeatureEnabled) {
      setIsLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/review/summary");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        // Check if feature was disabled server-side
        if (data.featureDisabled) {
          setIsLoading(false);
          return;
        }
        setSummary(data);
      } catch (err) {
        // Silently fail - widget is optional
        setError("Unable to load");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [isFeatureEnabled]);

  // Don't show widget if feature is disabled or no cards
  if (!isFeatureEnabled) {
    return null;
  }

  if (!isLoading && summary?.totalCards === 0) {
    return null;
  }

  // Loading state - compact
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl animate-pulse">
              <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-amber-200/50 rounded animate-pulse" />
              <div className="h-3 w-32 bg-amber-200/30 rounded mt-1 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state - minimal
  if (error || !summary) {
    return null;
  }

  const hasReviews = summary.totalDue > 0;
  const hasOverdue = summary.overdueCount > 0;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        hasOverdue
          ? "bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200/50 dark:border-red-800/50"
          : hasReviews
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50"
          : "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200/50 dark:border-green-800/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: Icon and stats */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl",
                hasOverdue
                  ? "bg-red-100 dark:bg-red-900/50"
                  : hasReviews
                  ? "bg-amber-100 dark:bg-amber-900/50"
                  : "bg-green-100 dark:bg-green-900/50"
              )}
            >
              {hasOverdue ? (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : hasReviews ? (
                <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-lg font-bold",
                    hasOverdue
                      ? "text-red-700 dark:text-red-300"
                      : hasReviews
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-green-700 dark:text-green-300"
                  )}
                >
                  {hasReviews
                    ? `${summary.totalDue} cards due`
                    : "All caught up!"}
                </span>
                {summary.streak > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                  >
                    <Flame className="h-3 w-3 mr-1" />
                    {summary.streak}
                  </Badge>
                )}
              </div>

              {/* Stats breakdown */}
              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {summary.newCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    {summary.newCount} new
                  </span>
                )}
                {summary.learningCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    {summary.learningCount} learning
                  </span>
                )}
                {summary.reviewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-green-500" />
                    {summary.reviewCount} review
                  </span>
                )}
                {hasOverdue && (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    {summary.overdueCount} overdue
                  </span>
                )}
                {summary.reviewedToday > 0 && (
                  <span className="text-slate-400">
                    ({summary.reviewedToday} done today)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action button */}
          <Link href="/review">
            <Button
              size="sm"
              className={cn(
                "rounded-xl font-semibold gap-1",
                hasOverdue
                  ? "bg-red-600 hover:bg-red-700"
                  : hasReviews
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {hasReviews ? "Review" : "Stats"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
