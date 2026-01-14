"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatInputWithOptions } from "./chat-input-with-options"
import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { useExploreStore } from "@/lib/store"
import { useMessages } from "@/lib/queries"
import { useIllustrations } from "@/hooks/use-illustrations"
import { nanoid } from "nanoid"
import type { Message as DBMessage } from "@/types/database"

// Trivia data structure
interface TriviaData {
  whyItMatters: string
  realWorldUse: string
  whenYouNeed: string
  didYouKnow: string
}

// Message format for the chat
interface ChatMessage {
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
}

// Helper function to parse trivia response from LLM using marker-based format
function parseTriviaResponse(rawContent: string, triviaEnabled: boolean): { content: string; trivia: TriviaData | null } {
  const triviaMarkerStart = '---TRIVIA---'
  const triviaMarkerEnd = '---END_TRIVIA---'

  const startIndex = rawContent.indexOf(triviaMarkerStart)

  // No trivia section found
  if (startIndex === -1) {
    return { content: rawContent, trivia: null }
  }

  const endIndex = rawContent.indexOf(triviaMarkerEnd, startIndex)

  // Incomplete trivia section (still streaming)
  if (endIndex === -1) {
    // Return content before trivia marker
    return { content: rawContent.substring(0, startIndex).trim(), trivia: null }
  }

  // Extract main content (everything before trivia) - ALWAYS remove trivia section from display
  const content = rawContent.substring(0, startIndex).trim()

  // If trivia feature is disabled, just return content without trivia
  if (!triviaEnabled) {
    return { content, trivia: null }
  }

  // Extract trivia section
  const triviaText = rawContent.substring(startIndex + triviaMarkerStart.length, endIndex).trim()

  // Parse trivia fields
  const whyMatch = triviaText.match(/WHY_IT_MATTERS:\s*(.+?)(?=\n(?:REAL_WORLD_USE|WHEN_YOU_NEED|DID_YOU_KNOW|$))/s)
  const realWorldMatch = triviaText.match(/REAL_WORLD_USE:\s*(.+?)(?=\n(?:WHEN_YOU_NEED|DID_YOU_KNOW|$))/s)
  const whenMatch = triviaText.match(/WHEN_YOU_NEED:\s*(.+?)(?=\n(?:DID_YOU_KNOW|$))/s)
  const didYouKnowMatch = triviaText.match(/DID_YOU_KNOW:\s*(.+?)$/s)

  // Only create trivia object if we have all fields
  if (whyMatch && realWorldMatch && whenMatch && didYouKnowMatch) {
    const trivia: TriviaData = {
      whyItMatters: whyMatch[1].trim(),
      realWorldUse: realWorldMatch[1].trim(),
      whenYouNeed: whenMatch[1].trim(),
      didYouKnow: didYouKnowMatch[1].trim()
    }
    return { content, trivia }
  }

  // Trivia section incomplete or malformed - return content without trivia
  return { content, trivia: null }
}

// Helper to extract displayable content during streaming
function extractStreamingContent(rawContent: string): string {
  const triviaMarkerStart = '---TRIVIA---'
  const startIndex = rawContent.indexOf(triviaMarkerStart)

  // If trivia section started, only show content before it
  if (startIndex !== -1) {
    return rawContent.substring(0, startIndex).trim()
  }

  // No trivia section yet, show all content
  return rawContent
}

interface ChatInterfaceProps {
  trailId: string
  expeditionId: string
  model?: string
  trailTitle?: string
  trailSourceText?: string | null
}

export function ChatInterface({ trailId, expeditionId, model, trailTitle, trailSourceText }: ChatInterfaceProps) {
  const { selectedModel, autoMessageData, setAutoMessageData, addTrailWithNewResponse, clearTrailNewResponse } = useExploreStore()
  const { data: existingMessages, refetch, isLoading: isLoadingMessages, isFetched } = useMessages(trailId)
  const { generateIllustration, isGenerating: isGeneratingIllustration } = useIllustrations()
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentTrailIdRef = useRef(trailId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  // Feature flags
  const illustrationsEnabled = process.env.NEXT_PUBLIC_ENABLE_ILLUSTRATIONS === 'true'
  const triviaEnabled = process.env.NEXT_PUBLIC_ENABLE_TRIVIA === 'true'

  const selectedModelValue = model || selectedModel

  // Memoize formatted messages to avoid re-parsing JSON on every render
  const formattedExistingMessages = useMemo(() => {
    if (!existingMessages || existingMessages.length === 0) return []
    return existingMessages.map((m: DBMessage) => ({
      id: m.id,
      role: m.role as "user" | "assistant" | "system" | "illustration",
      content: m.content,
      metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
    }))
  }, [existingMessages])

  // Update current trail ref and reset UI state when switching trails
  useEffect(() => {
    currentTrailIdRef.current = trailId
    // Clear the "new response" indicator when visiting this trail
    clearTrailNewResponse(trailId)
    setIsLoading(false)
    setError(undefined)
    if (formattedExistingMessages.length > 0) {
      setMessages(formattedExistingMessages)
    } else {
      setMessages([])
    }
  }, [trailId, formattedExistingMessages, clearTrailNewResponse])

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

    // Capture the trail ID at the time of sending
    const requestTrailId = trailId

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(undefined)

    // Create assistant placeholder
    const assistantId = nanoid()
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])

    try {
      // Limit message history to last 20 messages to reduce API latency
      const MAX_HISTORY_MESSAGES = 20
      const allMessages = [...messages, userMessage]
      const limitedMessages = allMessages.length > MAX_HISTORY_MESSAGES
        ? allMessages.slice(-MAX_HISTORY_MESSAGES)
        : allMessages

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trailId: requestTrailId,
          model: selectedModelValue,
          messages: limitedMessages.map(m => ({
            role: m.role === "illustration" ? "system" : m.role,
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

          // During streaming, extract displayable content using helper
          const displayContent = extractStreamingContent(assistantContent)

          // Only update UI if still on the same trail
          if (currentTrailIdRef.current === requestTrailId) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId ? { ...m, content: displayContent } : m
              )
            )
          }
        }
      }

      // After streaming completes, parse the full response to extract trivia
      const { content: finalContent, trivia } = parseTriviaResponse(assistantContent, triviaEnabled)

      // Update with final parsed content and trivia
      if (currentTrailIdRef.current === requestTrailId) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: finalContent, trivia } : m
          )
        )
      }

      // If user switched to a different trail, mark the original trail as having a new response
      if (currentTrailIdRef.current !== requestTrailId) {
        addTrailWithNewResponse(requestTrailId)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send message"))
      // Remove the empty assistant message on error (only if still on same trail)
      if (currentTrailIdRef.current === requestTrailId) {
        setMessages(prev => prev.filter(m => m.id !== assistantId))
      }
    } finally {
      // Only update loading state if still on the same trail
      if (currentTrailIdRef.current === requestTrailId) {
        setIsLoading(false)
      }
    }
  }, [messages, trailId, selectedModelValue, addTrailWithNewResponse])

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

  // Handle auto-message for new trails (from explore button)
  useEffect(() => {
    if (autoMessageData && autoMessageData.trailId === trailId && messages.length === 0 && !isLoading) {
      const { selectedText } = autoMessageData
      // Clear the auto-message data immediately so it doesn't trigger again
      setAutoMessageData(null)

      // Trigger the first message
      const autoMessage = `Explain more about "${selectedText}"`
      handleSend(autoMessage)
    }
  }, [trailId, autoMessageData, messages.length, isLoading, setAutoMessageData, handleSend])

  // Handle auto-message for trails with sourceText (generated topics)
  // This triggers when visiting a trail that has sourceText but no messages yet
  const hasTriggeredAutoMessage = useRef<string | null>(null)

  useEffect(() => {
    // Only trigger if:
    // 1. Trail has sourceText (it's a generated topic)
    // 2. Messages query has completed (isFetched) and no messages exist
    // 3. Not currently loading a chat response
    // 4. Haven't already triggered for this trail
    // 5. No autoMessageData is pending (to avoid double-triggering)
    if (
      trailSourceText &&
      trailTitle &&
      isFetched &&
      !isLoadingMessages &&
      messages.length === 0 &&
      !isLoading &&
      hasTriggeredAutoMessage.current !== trailId &&
      !autoMessageData
    ) {
      hasTriggeredAutoMessage.current = trailId
      const autoMessage = `Explain more about "${trailTitle}"`
      handleSend(autoMessage)
    }
  }, [trailId, trailTitle, trailSourceText, isFetched, isLoadingMessages, messages.length, isLoading, autoMessageData, handleSend])

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
