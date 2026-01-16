"use client"

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
}

export function MessageList({ messages, isLoading, error, onUpdateMessage, aiResponseStartRef }: MessageListProps) {
  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error: {error.message}</p>
      </div>
    )
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 md:py-12 text-muted-foreground px-4">
        <p className="text-sm md:text-base">Start a conversation to begin your learning journey</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-4">
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
        <div className="flex items-center gap-2 text-muted-foreground px-2">
          <div className="flex gap-1">
            <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm">AI is thinking...</span>
        </div>
      )}
    </div>
  )
}
