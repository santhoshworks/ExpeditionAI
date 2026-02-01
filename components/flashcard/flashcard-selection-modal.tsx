"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Layers, GitBranch, Compass } from "lucide-react"
import { cn } from "@/lib/utils"

interface FlashcardSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStart: (scope: 'trail' | 'expedition') => void
  hasCurrentTrail: boolean
  trailTitle?: string
  expeditionTitle?: string
}

export function FlashcardSelectionModal({
  open,
  onOpenChange,
  onStart,
  hasCurrentTrail,
  trailTitle,
  expeditionTitle,
}: FlashcardSelectionModalProps) {
  const [selectedScope, setSelectedScope] = useState<'trail' | 'expedition' | null>(null)

  const handleStart = () => {
    if (selectedScope) {
      onStart(selectedScope)
      onOpenChange(false)
      setSelectedScope(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded-lg">
              <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle>Create Flashcards</DialogTitle>
              <DialogDescription>
                Review what you&apos;ve learned with AI-generated flashcards
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose what to create flashcards from:
          </p>

          <div className="space-y-3">
            {/* Trail option */}
            {hasCurrentTrail && (
              <button
                onClick={() => setSelectedScope('trail')}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  selectedScope === 'trail'
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-amber-300"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedScope === 'trail'
                      ? "bg-amber-100 dark:bg-amber-900"
                      : "bg-slate-100 dark:bg-slate-800"
                  )}>
                    <GitBranch className={cn(
                      "h-4 w-4",
                      selectedScope === 'trail'
                        ? "text-amber-600 dark:text-amber-400"
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
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
                  : "border-slate-200 dark:border-slate-800 hover:border-amber-300"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  selectedScope === 'expedition'
                    ? "bg-amber-100 dark:bg-amber-900"
                    : "bg-slate-100 dark:bg-slate-800"
                )}>
                  <Compass className={cn(
                    "h-4 w-4",
                    selectedScope === 'expedition'
                      ? "text-amber-600 dark:text-amber-400"
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
            className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <Layers className="h-4 w-4" />
            Create Cards
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
