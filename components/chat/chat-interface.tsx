"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInputWithOptions } from "./chat-input-with-options"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { useExploreStore } from "@/lib/store"
import { useMessages } from "@/lib/queries"
import { useIllustrations } from "@/hooks/use-illustrations"
import { nanoid } from "nanoid"
import type { Message as DBMessage } from "@/types/database"

// Message format for the chat
interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system" | "illustration"
  content: string
  metadata?: {
    topic?: string
    imageUrl?: string
    description?: string
    query?: string
    generatedAt?: string
    trailId?: string
  }
}

interface ChatInterfaceProps {
  trailId: string
  expeditionId: string
  model?: string
}

export function ChatInterface({ trailId, expeditionId, model }: ChatInterfaceProps) {
  const { selectedModel, autoMessageData, setAutoMessageData } = useExploreStore()
  const { data: existingMessages, refetch } = useMessages(trailId)
  const { generateIllustration, isGenerating: isGeneratingIllustration } = useIllustrations()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  // Feature flag for illustrations
  const illustrationsEnabled = process.env.NEXT_PUBLIC_ENABLE_ILLUSTRATIONS === 'true'

  const selectedModelValue = model || selectedModel

  // Update messages when existing messages change (e.g., when switching trails)
  useEffect(() => {
    if (existingMessages && existingMessages.length > 0) {
      const formattedMessages: ChatMessage[] = existingMessages.map((m: DBMessage) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system" | "illustration",
        content: m.content,
        metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
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
            role: m.role === "illustration" ? "system" : m.role, // Convert illustration to system for API
            content: m.role === "illustration" ? `[Illustration: ${m.content}]` : m.content,
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

  const handleGenerateIllustration = useCallback(async (topic: string) => {
    // Determine the actual topic based on the input
    let actualTopic = topic

    if (topic === "Current conversation topic") {
      // Extract topic from recent messages
      const recentMessages = messages.slice(-3).filter(m => m.role === "assistant")
      if (recentMessages.length > 0) {
        const lastContent = recentMessages[recentMessages.length - 1].content
        // Simple extraction - you could make this more sophisticated
        actualTopic = lastContent.split('.')[0].substring(0, 100) + "..."
      } else {
        actualTopic = "General discussion topic"
      }
    } else if (topic === "Key concepts discussed") {
      actualTopic = "Key concepts from our conversation"
    } else if (topic === "Process diagram") {
      actualTopic = "Process flow diagram"
    }

    // Create illustration message immediately
    const illustrationId = nanoid()
    const illustrationMessage: ChatMessage = {
      id: illustrationId,
      role: "illustration",
      content: actualTopic,
      metadata: {
        topic: actualTopic,
        trailId: trailId,
        generatedAt: new Date().toISOString()
      }
    }

    // Add illustration message to chat
    setMessages(prev => [...prev, illustrationMessage])

    try {
      // Generate the illustration
      const result = await generateIllustration(trailId, actualTopic)

      if (result) {
        // Update the illustration message with the result
        setMessages(prev =>
          prev.map(m =>
            m.id === illustrationId
              ? {
                ...m,
                metadata: {
                  ...m.metadata,
                  imageUrl: result.imageUrl,
                  description: result.description,
                  query: result.query,
                  generatedAt: new Date().toISOString()
                }
              }
              : m
          )
        )

        // Save to database
        await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trailId,
            model: "illustration",
            messages: [{
              role: "illustration",
              content: actualTopic,
              metadata: JSON.stringify({
                topic: actualTopic,
                imageUrl: result.imageUrl,
                description: result.description,
                query: result.query,
                trailId: trailId,
                generatedAt: new Date().toISOString()
              })
            }],
          }),
        })
      }
    } catch (err) {
      console.error("Failed to generate illustration:", err)
      // Remove the failed illustration message
      setMessages(prev => prev.filter(m => m.id !== illustrationId))
    }
  }, [messages, trailId, generateIllustration])

  const handleUpdateMessage = useCallback((messageId: string, updates: any) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId ? { ...m, ...updates } : m
      )
    )
  }, [])

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
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onUpdateMessage={handleUpdateMessage}
        />
      </ScrollArea>
      <div className="border-t bg-background mobile-input-container mobile-keyboard-safe p-4 md:p-6">
        {illustrationsEnabled ? (
          <ChatInputWithOptions
            onSend={handleSend}
            onGenerateIllustration={handleGenerateIllustration}
            disabled={isLoading}
            isGeneratingIllustration={isGeneratingIllustration}
          />
        ) : (
          <ChatInput onSend={handleSend} disabled={isLoading} />
        )}
      </div>
    </div>
  )
}
