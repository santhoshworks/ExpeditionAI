"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { useExploreStore } from "@/lib/store"
import { useMessages } from "@/lib/queries"
import { nanoid } from "nanoid"
import type { Message as DBMessage } from "@/types/database"

// Message format for the chat
interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatInterfaceProps {
  trailId: string
  expeditionId: string
  model?: string
}

export function ChatInterface({ trailId, expeditionId, model }: ChatInterfaceProps) {
  const { selectedModel, autoMessageData, setAutoMessageData } = useExploreStore()
  const { data: existingMessages, refetch } = useMessages(trailId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  const selectedModelValue = model || selectedModel

  // Update messages when existing messages change (e.g., when switching trails)
  useEffect(() => {
    if (existingMessages && existingMessages.length > 0) {
      const formattedMessages: ChatMessage[] = existingMessages.map((m: DBMessage) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }))
      setMessages(formattedMessages)
    } else {
      setMessages([])
    }
  }, [trailId, existingMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content,
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(undefined)

    // Create assistant placeholder
    const assistantId = nanoid()
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trailId,
          model: selectedModelValue,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk

          // Update assistant message with streaming content
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            )
          )
        }
      }

      // Refetch messages from DB to get the saved versions
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send message"))
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }, [messages, trailId, selectedModelValue, refetch])

  // Handle auto-message for new trails
  useEffect(() => {
    if (autoMessageData && autoMessageData.trailId === trailId && messages.length === 0 && !isLoading) {
      const { selectedText } = autoMessageData
      // Clear the auto-message data immediately so it doesn't trigger again
      setAutoMessageData(null)

      // Trigger the first message
      const autoMessage = `Explain more about this ${selectedText}`
      handleSend(autoMessage)
    }
  }, [trailId, autoMessageData, messages.length, isLoading, setAutoMessageData, handleSend])


  return (
    <div className="flex flex-col h-full mobile-chat-container">
      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
        <MessageList messages={messages} isLoading={isLoading} error={error} />
      </ScrollArea>
      <div className="border-t bg-background mobile-input-container mobile-keyboard-safe p-4 md:p-6">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
