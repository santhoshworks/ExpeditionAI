"use client"

import { useState, KeyboardEvent, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput("")

    // Reset textarea height after sending
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Scroll input into view on mobile when focused
  const handleFocus = () => {
    if (window.innerWidth <= 768 && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        })
      }, 300) // Delay to allow keyboard to appear
    }
  }

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  return (
    <div className="space-y-2">
      {/* Input area with more breathing room */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Ask a question or explore a topic..."
            disabled={disabled}
            className="min-h-[72px] md:min-h-[80px] max-h-[120px] resize-none text-sm md:text-base leading-relaxed px-4 py-3 rounded-xl border-2 focus:border-primary/50 transition-all"
            rows={3}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="h-12 w-12 md:h-14 md:w-14 flex-shrink-0 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        >
          <Send className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-muted-foreground px-1">
        <span>Press Enter to send • Shift+Enter for new line</span>
      </div>
    </div>
  )
}
