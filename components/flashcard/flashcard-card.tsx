"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface FlashcardCardProps {
  front: string
  back: string
  isFlipped: boolean
  onFlip: () => void
  importance?: number
}

export function FlashcardCard({
  front,
  back,
  isFlipped,
  onFlip,
  importance = 3,
}: FlashcardCardProps) {
  return (
    <div
      className="relative w-full aspect-[3/2] cursor-pointer perspective-1000"
      onClick={onFlip}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col",
            "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800",
            "shadow-lg hover:shadow-xl transition-shadow",
            "backface-hidden"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Importance indicator */}
          <div className="flex justify-end mb-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < importance
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 dark:text-slate-700"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white text-center leading-relaxed">
              {front}
            </p>
          </div>

          {/* Hint to flip */}
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Tap to reveal
            </span>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col",
            "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
            "border-2 border-amber-200 dark:border-amber-800",
            "shadow-lg",
            "backface-hidden"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Answer label */}
          <div className="flex justify-center mb-3">
            <span className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider font-bold">
              Answer
            </span>
          </div>

          {/* Answer content */}
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 text-center leading-relaxed">
              {back}
            </p>
          </div>

          {/* Tap hint */}
          <div className="text-center">
            <span className="text-xs text-amber-500/70 uppercase tracking-wider font-medium">
              Tap to flip back
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
