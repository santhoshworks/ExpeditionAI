"use client"

import { Target, Globe, Clock, Sparkles } from "lucide-react"
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

const triviaItems = [
  {
    key: "whyItMatters",
    label: "Why This Matters",
    icon: Target,
    color: "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
    tooltip: "Why This Matters",
  },
  {
    key: "realWorldUse",
    label: "Real-World Use",
    icon: Globe,
    color: "text-green-500 bg-green-500/10 hover:bg-green-500/20",
    tooltip: "Real-World Use",
  },
  {
    key: "whenYouNeed",
    label: "When You'd Need This",
    icon: Clock,
    color: "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20",
    tooltip: "When You'd Need This",
  },
  {
    key: "didYouKnow",
    label: "Did You Know?",
    icon: Sparkles,
    color: "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20",
    tooltip: "Fun Fact",
  },
]

export function TriviaIndicator({ trivia }: TriviaIndicatorProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="absolute -right-16 md:-right-20 top-2 flex flex-col gap-1">
        {triviaItems.map((item) => {
          const content = trivia[item.key as keyof TriviaData]

          // Skip if content is empty
          if (!content || content.trim() === '') {
            return null
          }

          const Icon = item.icon

          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "p-1.5 rounded-full",
                    item.color,
                    "transition-all duration-300 ease-in-out",
                    "cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
                  )}
                  aria-label={item.tooltip}
                  title={item.tooltip}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                align="center"
                className="w-72 p-0 bg-card border shadow-lg"
                sideOffset={8}
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold border-b pb-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    {content}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
