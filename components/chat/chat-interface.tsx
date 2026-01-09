"use client"

import { useChat } from "ai/react"
import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { useExploreStore } from "@/lib/store"
import { useMessages } from "@/lib/queries"

interface ChatInterfaceProps {
  trailId: string
  expeditionId: string
  model?: string
}

export function ChatInterface({ trailId, expeditionId, model }: ChatInterfaceProps) {
  const { selectedModel } = useExploreStore()
  const { data: existingMessages } = useMessages(trailId)
  const scrollRef = useRef<HTMLDivElement>(null)

  const selectedModelValue = model || selectedModel

  const initialMessages = existingMessages?.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
  })) || []

  const { messages, append, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    body: {
      trailId,
      model: selectedModelValue,
    },
    initialMessages,
  })

  // Update messages when existing messages change (e.g., when switching trails)
  useEffect(() => {
    if (existingMessages && existingMessages.length > 0) {
      const formattedMessages = existingMessages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
      setMessages(formattedMessages)
    } else {
      setMessages([])
    }
  }, [trailId, existingMessages, setMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight
    }
  }, [messages])

  const handleSend = async (content: string) => {
    // Build message history from current messages
    const messageHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    await append({
      role: "user",
      content,
      data: {
        trailId,
        messages: messageHistory,
      },
    })
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <MessageList messages={messages} isLoading={isLoading} error={error} />
      </ScrollArea>
      <div className="border-t p-4">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
