"use client"

import { Message } from "./message"

interface MessageListProps {
  messages: Array<{
    id: string
    role: "user" | "assistant" | "system"
    content: string
  }>
  isLoading: boolean
  error?: Error
}

export function MessageList({ messages, isLoading, error }: MessageListProps) {
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
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
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
