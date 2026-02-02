"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles, GitBranch, Compass } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartQuiz: (questionCount: number, scope: 'trail' | 'expedition') => void
  hasCurrentTrail: boolean
  trailTitle?: string
  expeditionTitle?: string
}

const QUESTION_OPTIONS = [
  { count: 3, label: "3 Questions", description: "Quick check", duration: "~2 min" },
  { count: 5, label: "5 Questions", description: "Standard quiz", duration: "~5 min" },
  { count: 7, label: "7 Questions", description: "Thorough test", duration: "~7 min" },
  { count: 10, label: "10 Questions", description: "Deep dive", duration: "~10 min" },
]

export function QuizSelectionModal({
  open,
  onOpenChange,
  onStartQuiz,
  hasCurrentTrail,
  trailTitle,
  expeditionTitle,
}: QuizSelectionModalProps) {
  const [selectedCount, setSelectedCount] = useState(5)
  const [selectedScope, setSelectedScope] = useState<'trail' | 'expedition' | null>(
    hasCurrentTrail ? 'trail' : 'expedition'
  )

  const handleStart = () => {
    if (selectedScope) {
      onStartQuiz(selectedCount, selectedScope)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 dark:bg-purple-950 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <DialogTitle>Start Quiz</DialogTitle>
              <DialogDescription>
                Test your understanding with AI-generated questions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Scope Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Choose what to quiz on:
            </p>

            {/* Trail option */}
            {hasCurrentTrail && (
              <button
                onClick={() => setSelectedScope('trail')}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  selectedScope === 'trail'
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-purple-300"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedScope === 'trail'
                      ? "bg-purple-100 dark:bg-purple-900"
                      : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    <GitBranch className={cn(
                      "h-4 w-4",
                      selectedScope === 'trail'
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-slate-500"
                    )} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Current Trail Only
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {trailTitle || "This trail"}
                    </p>
                  </div>
                </div>
              </button>
            )}

            {/* Expedition option */}
            <button
              onClick={() => setSelectedScope('expedition')}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all",
                selectedScope === 'expedition'
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                  : "border-slate-200 dark:border-slate-800 hover:border-purple-300"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  selectedScope === 'expedition'
                    ? "bg-purple-100 dark:bg-purple-900"
                    : "bg-slate-100 dark:bg-slate-800"
                )}>
                  <Compass className={cn(
                    "h-4 w-4",
                    selectedScope === 'expedition'
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-slate-500"
                  )} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Entire Expedition
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {expeditionTitle || "All trails in this expedition"}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Question Count Selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              How many questions?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_OPTIONS.map((option) => (
                <button
                  key={option.count}
                  onClick={() => setSelectedCount(option.count)}
                  className={cn(
                    "text-left p-3 rounded-lg border-2 transition-all",
                    selectedCount === option.count
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/50"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    {option.duration}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={!selectedScope}
            className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
