"use client"

import { useState } from "react"
import { useExploreStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { BookOpen, Compass, Info } from "lucide-react"

export function LearningModeToggle() {
  const { learningMode, toggleLearningMode } = useExploreStore()
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="inline-flex items-center gap-2" data-ignore-selection>
      <div className="inline-flex items-center rounded-full bg-muted p-1 text-muted-foreground">
        <button
          onClick={() => !learningMode && toggleLearningMode()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
            learningMode
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:text-foreground"
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Learn</span>
        </button>
        <button
          onClick={() => learningMode && toggleLearningMode()}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
            !learningMode
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:text-foreground"
          )}
        >
          <Compass className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Explore</span>
        </button>
      </div>

      {/* Info tooltip */}
      <div className="relative">
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onClick={() => setShowInfo(!showInfo)}
          aria-label="Mode information"
        >
          <Info className="h-4 w-4" />
        </button>

        {showInfo && (
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-popover border rounded-lg shadow-lg z-50 text-sm">
            <div className="space-y-3">
              <div className="flex gap-2">
                <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Learn Mode</p>
                  <p className="text-muted-foreground text-xs">
                    Focus mode - dims distractions and disables the explore tooltip for uninterrupted reading.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Compass className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Explore Mode</p>
                  <p className="text-muted-foreground text-xs">
                    Highlight any text to see a quick definition and create new exploration trails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
