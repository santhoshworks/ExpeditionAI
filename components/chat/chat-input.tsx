"use client"

import { useState, KeyboardEvent, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Square, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  disabled?: boolean
}

export function ChatInput({ onSend, onStop, disabled }: ChatInputProps) {
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
            className="min-h-[44px] md:min-h-[48px] max-h-[120px] resize-none text-sm leading-relaxed px-4 py-2.5 rounded-lg border-2 focus:border-primary/20 transition-all bg-white dark:bg-slate-900 shadow-sm"
            rows={1}
          />
        </div>
        {/* Reverted Send/Stop button layout to horizontal */}
        <Button
          onClick={disabled ? onStop : handleSend}
          disabled={(disabled && !onStop) || (!input.trim() && !disabled)}
          className={cn(
            "h-11 w-11 flex-shrink-0 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center",
            disabled ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-indigo-600 hover:bg-slate-900 text-white"
          )}
          title={disabled ? "Stop generating" : "Send message"}
        >
          {disabled ? <Square className="h-4 w-4 fill-current" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-muted-foreground px-1">
        <span>Press Enter to send • Shift+Enter for new line</span>
      </div>
    </div>
  )
}
