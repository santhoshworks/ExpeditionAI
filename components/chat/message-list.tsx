"use client"

import { Compass, AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Message } from "./message"
import type { TriviaData } from "./trivia-indicator"

interface MessageListProps {
  messages: Array<{
    id: string
    role: "user" | "assistant" | "system" | "illustration"
    content: string
    trivia?: TriviaData | null
    metadata?: {
      topic?: string
      imageUrl?: string
      description?: string
      query?: string
      generatedAt?: string
      trailId?: string
    }
  }>
  isLoading: boolean
  error?: Error
  onRetry?: () => void
  onUpdateMessage?: (messageId: string, updates: any) => void
  aiResponseStartRef?: React.RefObject<HTMLDivElement>
  emptyState?: React.ReactNode
}

export function MessageList({ messages, isLoading, error, onRetry, onUpdateMessage, aiResponseStartRef, emptyState }: MessageListProps) {
  if (messages.length === 0 && !isLoading && !error) {
    return emptyState || (
      <div className="text-center py-8 md:py-12 text-muted-foreground px-4">
        <p className="text-sm md:text-base">Start a conversation to begin your learning journey</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-4 w-full overflow-x-hidden min-w-0">
      {messages.map((message, index) => {
        // Find the last assistant message to attach the ref
        const isLastAssistant = message.role === "assistant" &&
          index === messages.length - 1

        return (
          <div key={message.id} ref={isLastAssistant ? aiResponseStartRef : null}>
            <Message
              message={message}
              onUpdateMessage={onUpdateMessage}
            />
          </div>
        )
      })}
      {isLoading && (
        <div className="flex items-center gap-3 text-muted-foreground px-2 py-2">
          <Compass className="h-5 w-5 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Charting your path...</span>
        </div>
      )}
      {error && !isLoading && (
        <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 mx-1">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Something went wrong
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
              {error.message || "Failed to get a response. Please try again."}
            </p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="shrink-0 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 h-8 px-3 rounded-lg"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
