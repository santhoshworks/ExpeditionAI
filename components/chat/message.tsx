"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { cn } from "@/lib/utils"
import { IllustrationMessage } from "./illustration-message"
import type { Components } from "react-markdown"

interface MessageProps {
  message: {
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
  onUpdateMessage?: (messageId: string, updates: any) => void
}

export function Message({ message, onUpdateMessage }: MessageProps) {
  const isUser = message.role === "user"
  const isSystem = message.role === "system"
  const isIllustration = message.role === "illustration"

  // Feature flag for illustrations
  const illustrationsEnabled = process.env.NEXT_PUBLIC_ENABLE_ILLUSTRATIONS === 'true'

  if (isSystem) {
    return null
  }

  // Handle illustration messages (only if feature is enabled)
  if (isIllustration && illustrationsEnabled && message.metadata) {
    const handleRegenerate = (newImageUrl: string, newDescription: string) => {
      if (onUpdateMessage) {
        onUpdateMessage(message.id, {
          metadata: {
            ...message.metadata,
            imageUrl: newImageUrl,
            description: newDescription,
            generatedAt: new Date().toISOString()
          }
        })
      }
    }

    return (
      <IllustrationMessage
        trailId={message.metadata.trailId || ''}
        topic={message.metadata.topic || message.content}
        imageUrl={message.metadata.imageUrl}
        description={message.metadata.description}
        query={message.metadata.query}
        generatedAt={message.metadata.generatedAt}
        onRegenerate={handleRegenerate}
      />
    )
  }

  // If illustrations are disabled, treat illustration messages as system messages (hidden)
  if (isIllustration && !illustrationsEnabled) {
    return null
  }

  const markdownComponents: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const codeString = String(children).replace(/\n$/, "")

      // Check if this is a code block (has language) vs inline code
      if (match) {
        return (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
          >
            {codeString}
          </SyntaxHighlighter>
        )
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
  }

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[90%] md:max-w-[85%] rounded-lg px-3 md:px-4 py-2 md:py-3 select-text",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none select-text text-sm md:text-base" data-ai-response>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
