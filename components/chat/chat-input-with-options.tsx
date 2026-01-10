"use client"

import { useState, KeyboardEvent, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ChatInputWithOptionsProps {
    onSend: (message: string) => void
    onGenerateIllustration: (topic: string) => void
    disabled?: boolean
    isGeneratingIllustration?: boolean
}

export function ChatInputWithOptions({
    onSend,
    onGenerateIllustration,
    disabled,
    isGeneratingIllustration
}: ChatInputWithOptionsProps) {
    const [input, setInput] = useState("")
    const [showIllustrationInput, setShowIllustrationInput] = useState(false)
    const [illustrationTopic, setIllustrationTopic] = useState("")
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const illustrationInputRef = useRef<HTMLInputElement>(null)

    const handleSend = () => {
        if (!input.trim() || disabled) return
        onSend(input.trim())
        setInput("")

        // Reset textarea height after sending
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
        }
    }

    const handleGenerateIllustration = () => {
        if (!illustrationTopic.trim() || isGeneratingIllustration) return
        onGenerateIllustration(illustrationTopic.trim())
        setIllustrationTopic("")
        setShowIllustrationInput(false)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleIllustrationKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleGenerateIllustration()
        }
        if (e.key === "Escape") {
            setShowIllustrationInput(false)
            setIllustrationTopic("")
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
            }, 300)
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

    // Quick illustration topics
    const quickTopics = [
        "Current conversation topic",
        "Key concepts discussed",
        "Process diagram",
        "Custom topic..."
    ]

    return (
        <div className="space-y-3">
            {/* Options Bar */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            disabled={disabled || isGeneratingIllustration}
                        >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Generate Illustration
                            <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        {quickTopics.map((topic, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => {
                                    if (topic === "Custom topic...") {
                                        setShowIllustrationInput(true)
                                        setTimeout(() => illustrationInputRef.current?.focus(), 100)
                                    } else {
                                        onGenerateIllustration(topic)
                                    }
                                }}
                                className="text-sm"
                            >
                                <Sparkles className="h-3 w-3 mr-2" />
                                {topic}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {isGeneratingIllustration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                            <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span>Generating illustration...</span>
                    </div>
                )}
            </div>

            {/* Custom Illustration Topic Input */}
            {showIllustrationInput && (
                <div className="flex gap-2 p-3 bg-muted/50 rounded-lg border">
                    <input
                        ref={illustrationInputRef}
                        type="text"
                        value={illustrationTopic}
                        onChange={(e) => setIllustrationTopic(e.target.value)}
                        onKeyDown={handleIllustrationKeyDown}
                        placeholder="Enter illustration topic..."
                        className="flex-1 bg-transparent border-none outline-none text-sm"
                        disabled={isGeneratingIllustration}
                    />
                    <Button
                        size="sm"
                        onClick={handleGenerateIllustration}
                        disabled={!illustrationTopic.trim() || isGeneratingIllustration}
                        className="h-7 px-3 text-xs"
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setShowIllustrationInput(false)
                            setIllustrationTopic("")
                        }}
                        className="h-7 px-2 text-xs"
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Main Chat Input */}
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