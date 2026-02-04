"use client"

import { Compass } from "lucide-react"
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
  onUpdateMessage?: (messageId: string, updates: any) => void
  aiResponseStartRef?: React.RefObject<HTMLDivElement>
  emptyState?: React.ReactNode
}

export function MessageList({ messages, isLoading, error, onUpdateMessage, aiResponseStartRef, emptyState }: MessageListProps) {
  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error: {error.message}</p>
      </div>
    )
  }

  if (messages.length === 0 && !isLoading) {
    return emptyState || (
      <div className="text-center py-8 md:py-12 text-muted-foreground px-4">
        <p className="text-sm md:text-base">Start a conversation to begin your learning journey</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-4 w-full overflow-x-hidden">
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
    </div>
  )
}
