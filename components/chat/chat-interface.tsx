"use client"

import { getTierOverride } from "@/lib/tier-override"
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
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyChatState } from "./empty-chat-state"

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

// Helper function to parse JSON trivia response from LLM
function parseTriviaResponse(rawContent: string, triviaEnabled: boolean): { content: string; trivia: TriviaData | null } {
  // If trivia is disabled, return content as-is
  if (!triviaEnabled) {
    return { content: rawContent, trivia: null }
  }

  // Trim any leading/trailing whitespace
  let trimmed = rawContent.trim()

  // Strip markdown code block wrapper if present (```json ... ```)
  if (trimmed.startsWith('```')) {
    // Remove opening ```json or ```
    trimmed = trimmed.replace(/^```(?:json)?\n?/, '')
    // Remove closing ```
    trimmed = trimmed.replace(/\n?```$/, '')
    trimmed = trimmed.trim()
  }

  try {
    // Try to parse as JSON
    const parsed = JSON.parse(trimmed)

    if (parsed.content && typeof parsed.content === 'string') {
      // Extract trivia if it exists and has values
      let trivia: TriviaData | null = null

      if (parsed.trivia && typeof parsed.trivia === 'object') {
        const t = parsed.trivia
        // Only create trivia object if at least one field has a value
        if (t.whyItMatters || t.realWorldUse || t.whenYouNeed || t.didYouKnow) {
          trivia = {
            whyItMatters: t.whyItMatters || '',
            realWorldUse: t.realWorldUse || '',
            whenYouNeed: t.whenYouNeed || '',
            didYouKnow: t.didYouKnow || ''
          }
        }
      }

      console.log('Successfully parsed JSON response')
      return { content: parsed.content, trivia }
    } else {
      console.log('JSON parsed but missing content field:', { hasContent: !!parsed.content, triviaType: typeof parsed.trivia })
    }
  } catch (e) {
    console.log('JSON parsing failed:', (e as Error).message)
    // JSON parsing failed - check if we should attempt alternative parsing
  }

  // Fallback: if not valid JSON or doesn't have expected structure, return raw content
  console.log('Returning raw content as fallback')
  return { content: rawContent, trivia: null }
}

// Helper to extract displayable content during streaming (attempt to parse partial JSON)
function extractStreamingContent(rawContent: string): string {
  // Strip markdown code block wrapper if present
  let content = rawContent
  if (content.startsWith('```')) {
    // Skip the markdown code block opening
    const newlineIndex = content.indexOf('\n')
    if (newlineIndex !== -1) {
      content = content.substring(newlineIndex + 1)
    }
  }

  // First, try to parse as complete JSON
  try {
    const parsed = JSON.parse(content)
    if (parsed.content && typeof parsed.content === 'string') {
      return parsed.content
    }
  } catch (e) {
    // Not complete JSON yet, continue below
  }

  // For incomplete JSON, manually parse the content field
  // Look for "content": " pattern and extract until closing quote
  const contentIndex = content.indexOf('"content"')
  if (contentIndex === -1) return ''

  // Find the opening quote of the content value
  let quoteIndex = content.indexOf('"', contentIndex + 10)
  if (quoteIndex === -1) return ''

  // Extract content until we find the closing quote (handling escapes)
  let result = ''
  let i = quoteIndex + 1

  while (i < content.length) {
    if (content[i] === '\\' && i + 1 < content.length) {
      // Handle escaped character
      const nextChar = content[i + 1]
      if (nextChar === '"') result += '"'
      else if (nextChar === '\\') result += '\\'
      else if (nextChar === 'n') result += '\n'
      else if (nextChar === 't') result += '\t'
      else result += nextChar
      i += 2
    } else if (content[i] === '"') {
      // Found closing quote
      return result
    } else {
      result += content[i]
      i++
    }
  }

  // If we have a substantial partial result, return it
  // (we might be in the middle of an unclosed string during streaming)
  return result.length > 50 ? result : ''
}

interface ChatInterfaceProps {
  trailId: string
  expeditionId: string
  model?: string
  trailTitle?: string
  trailSourceText?: string | null
  onOpenGenerateModal?: () => void
}

export function ChatInterface({ trailId, expeditionId, model, trailTitle, trailSourceText, onOpenGenerateModal }: ChatInterfaceProps) {
  const { selectedModel, autoMessageData, setAutoMessageData, addTrailWithNewResponse, clearTrailNewResponse } = useExploreStore()
  const { data: existingMessages, refetch, isLoading: isLoadingMessages, isFetched } = useMessages(trailId)
  const { generateIllustration, isGenerating: isGeneratingIllustration } = useIllustrations()
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentTrailIdRef = useRef(trailId)
  const aiResponseStartRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastUserMessageRef = useRef<string | null>(null)

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

  // Scroll to bottom when new messages arrive, but stay at top for empty state
  useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollElement) {
      if (messages.length > 0 || isLoading) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      } else {
        scrollElement.scrollTop = 0
      }
    }
  }, [messages, isLoading])

  // Scroll to AI response start when assistant begins responding
  const scrollToAiResponseStart = useCallback(() => {
    if (aiResponseStartRef.current) {
      aiResponseStartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  const handleSend = useCallback(async (content: string, isResend: boolean = false) => {
    const userMessage: ChatMessage = {
      id: nanoid(),
      role: "user",
      content,
    }

    // Capture the trail ID at the time of sending
    const requestTrailId = trailId

    // Add user message if not a resend
    if (!isResend) {
      setMessages(prev => [...prev, userMessage])
      lastUserMessageRef.current = content
    } else {
      // For resend, we might want to remove the previous (potentially failed/incomplete) assistant message
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last && last.role === "assistant" && (last.content === "" || error)) {
          return prev.slice(0, -1)
        }
        return prev
      })
    }

    setIsLoading(true)
    setError(undefined)

    // Create assistant placeholder
    const assistantId = nanoid()
    setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }])

    // Scroll to the start of the AI response after a brief delay to ensure DOM update
    setTimeout(() => {
      scrollToAiResponseStart()
    }, 100)

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      // Calculate messages for the API call
      // We start with the current messages and add the user message if it's not a resend
      let messagesForApi = isResend ? [...messages] : [...messages, userMessage]

      // If resending, the last user message might have an assistant response (failed or empty) after it
      // Filter out only the current sequence to avoid duplicates
      if (isResend) {
        // If the last message is assistant, remove it for the API call
        if (messagesForApi.length > 0 && messagesForApi[messagesForApi.length - 1].role === "assistant") {
          messagesForApi = messagesForApi.slice(0, -1)
        }
      }

      // Limit message history to last 20 messages to reduce API latency
      const MAX_HISTORY_MESSAGES = 20
      const limitedMessages = messagesForApi.length > MAX_HISTORY_MESSAGES
        ? messagesForApi.slice(-MAX_HISTORY_MESSAGES)
        : messagesForApi

      const tierOverride = getTierOverride()
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (tierOverride) {
        headers["x-test-tier"] = tierOverride.tier
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          trailId: requestTrailId,
          model: selectedModelValue,
          messages: limitedMessages.map(m => ({
            role: m.role === "illustration" ? "system" : m.role,
            content: m.role === "illustration" ? `[Illustration: ${m.content}]` : m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
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
          console.log('Stream chunk:', { chunkLength: chunk.length, totalLength: assistantContent.length, displayContent: displayContent.substring(0, 100) })

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
      console.log('Full response received:')
      console.log('  Length:', assistantContent.length)
      console.log('  First 300 chars:', assistantContent.substring(0, 300))
      console.log('  Last 100 chars:', assistantContent.substring(Math.max(0, assistantContent.length - 100)))

      const { content: finalContent, trivia } = parseTriviaResponse(assistantContent, triviaEnabled)
      console.log('Parsed result:', {
        contentLength: finalContent.length,
        hasTrivia: !!trivia,
        contentPreview: finalContent.substring(0, 100)
      })

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
      if ((err as Error).name === 'AbortError') {
        console.log('Fetch aborted')
      } else {
        setError(err instanceof Error ? err : new Error("Failed to send message"))
        // Remove the empty assistant message on error (only if still on same trail)
        if (currentTrailIdRef.current === requestTrailId) {
          setMessages(prev => prev.filter(m => m.id !== assistantId))
        }
      }
    } finally {
      // Only update loading state if still on the same trail
      if (currentTrailIdRef.current === requestTrailId) {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    }
  }, [messages, trailId, selectedModelValue, addTrailWithNewResponse, scrollToAiResponseStart, error])

  const handleResend = useCallback(() => {
    if (lastUserMessageRef.current) {
      handleSend(lastUserMessageRef.current, true)
    }
  }, [handleSend])

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
        const tierOverride = getTierOverride()
        const saveHeaders: HeadersInit = { "Content-Type": "application/json" }
        if (tierOverride) {
          saveHeaders["x-test-tier"] = tierOverride.tier
        }

        await fetch("/api/chat", {
          method: "POST",
          headers: saveHeaders,
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
  const hasTriggeredAutoMessage = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Only trigger if:
    // 1. Trail has sourceText (it's a generated topic)
    // 2. Messages query has completed (isFetched) and no messages exist in DB
    // 3. Not currently loading a chat response
    // 4. Haven't already triggered for this trail
    // 5. No autoMessageData is pending (to avoid double-triggering)
    if (
      trailSourceText &&
      trailTitle &&
      isFetched &&
      !isLoadingMessages &&
      (!existingMessages || existingMessages.length === 0) &&
      !isLoading &&
      !hasTriggeredAutoMessage.current.has(trailId) &&
      !autoMessageData
    ) {
      hasTriggeredAutoMessage.current.add(trailId)
      const autoMessage = `Explain more about "${trailTitle}"`
      handleSend(autoMessage)
    }
  }, [trailId, trailTitle, trailSourceText, isFetched, isLoadingMessages, existingMessages, isLoading, autoMessageData, handleSend])

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "generate_dives":
        if (onOpenGenerateModal) {
          onOpenGenerateModal()
        } else {
          handleSend("Suggest some specific sub-topics for me to dive deeper into.")
        }
        break
      case "quiz":
        handleSend("Quiz me on this topic with 3 challenging questions to test my understanding.")
        break
      case "summary":
        handleSend("Can you provide a concise but comprehensive summary of what we're learning here?")
        break
    }
  }, [handleSend, onOpenGenerateModal])

  const emptyState = useMemo(() => (
    <EmptyChatState
      topicTitle={trailTitle}
      onSuggest={handleSend}
      onAction={handleAction}
    />
  ), [trailTitle, handleSend, handleAction])

  return (
    <div className="flex flex-col h-full mobile-chat-container">
      <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollRef}>
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onUpdateMessage={handleUpdateMessage}
          aiResponseStartRef={aiResponseStartRef}
          emptyState={emptyState}
        />
      </ScrollArea>
      <div className="border-t bg-background/50 backdrop-blur-md mobile-input-container mobile-keyboard-safe p-3 md:p-4 relative">
        {/* Regenerate Button - Floating above input Area */}
        {!isLoading && lastUserMessageRef.current && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              className="pointer-events-auto bg-background/90 backdrop-blur-md shadow-lg rounded-full px-6 h-10 border-indigo-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 group border-2"
            >
              <RotateCcw className="h-4 w-4 text-indigo-600 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Regenerate response</span>
            </Button>
          </div>
        )}

        {illustrationsEnabled ? (
          <ChatInputWithOptions
            onSend={handleSend}
            onStop={handleStop}
            onGenerateIllustration={handleGenerateIllustration}
            disabled={isLoading}
            isGeneratingIllustration={isGeneratingIllustration}
          />
        ) : (
          <ChatInput
            onSend={handleSend}
            onStop={handleStop}
            disabled={isLoading} />
        )}
      </div>
    </div>
  )
}
