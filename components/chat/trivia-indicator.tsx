"use client"

import { useState } from "react"
import { Lightbulb } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface TriviaData {
  whyItMatters: string
  realWorldUse: string
  whenYouNeed: string
  didYouKnow: string
}

interface TriviaIndicatorProps {
  trivia: TriviaData
}

export function TriviaIndicator({ trivia }: TriviaIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "absolute -right-8 md:-right-10 top-2 p-1.5 rounded-full",
              "bg-amber-500/10 hover:bg-amber-500/20",
              "transition-all duration-300 ease-in-out",
              "group cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="View trivia"
          >
            <Lightbulb
              className={cn(
                "w-4 h-4 md:w-5 md:h-5 text-amber-500",
                "trivia-glow"
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="w-80 p-0 bg-card border shadow-lg"
          sideOffset={8}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-500 font-medium border-b pb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Did You Know?</span>
            </div>

            <div className="space-y-3 text-sm">
              <TriviaItem
                icon="🎯"
                label="Why This Matters"
                content={trivia.whyItMatters}
              />
              <TriviaItem
                icon="🌍"
                label="Real-World Use"
                content={trivia.realWorldUse}
              />
              <TriviaItem
                icon="⏰"
                label="When You'd Need This"
                content={trivia.whenYouNeed}
              />
              <TriviaItem
                icon="💡"
                label="Did You Know?"
                content={trivia.didYouKnow}
              />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TriviaItem({
  icon,
  label,
  content,
}: {
  icon: string
  label: string
  content: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
        <span>{icon}</span>
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-foreground leading-relaxed pl-5">{content}</p>
    </div>
  )
}
