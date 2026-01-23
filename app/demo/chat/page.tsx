"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CTAButton } from "@/components/ui/cta-button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, ArrowLeft, MessageCircle, AlertCircle, Zap, Lightbulb } from "lucide-react"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

const MAX_DEMO_MESSAGES = 10

function DemoChatContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const topic = searchParams.get("topic") || "General Learning"

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedText, setSelectedText] = useState("")
    const [showExploreButton, setShowExploreButton] = useState(false)
    const [exploreButtonPosition, setExploreButtonPosition] = useState({ x: 0, y: 0 })
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const messageCount = messages.filter(m => m.role === "user").length
    const remainingMessages = MAX_DEMO_MESSAGES - messageCount

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    // Handle text selection for explore feature
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection()
            const text = selection?.toString().trim()

            if (text && text.length > 0 && text.length < 300) {
                const range = selection?.getRangeAt(0)
                const rect = range?.getBoundingClientRect()

                if (rect) {
                    setSelectedText(text)
                    setExploreButtonPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10
                    })
                    setShowExploreButton(true)
                }
            } else {
                setShowExploreButton(false)
            }
        }

        document.addEventListener("mouseup", handleSelection)
        document.addEventListener("touchend", handleSelection)

        return () => {
            document.removeEventListener("mouseup", handleSelection)
            document.removeEventListener("touchend", handleSelection)
        }
    }, [])

    const handleExploreText = () => {
        if (!selectedText) return

        if (messageCount >= MAX_DEMO_MESSAGES) {
            toast.error("Demo limit reached! Sign up to continue learning.")
            return
        }

        const exploreMessage = `Can you explain more about: "${selectedText}"?`
        setInput(exploreMessage)
        setShowExploreButton(false)
        window.getSelection()?.removeAllRanges()
        inputRef.current?.focus()
    }

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return

        if (messageCount >= MAX_DEMO_MESSAGES) {
            toast.error("Demo limit reached! Sign up to continue learning.")
            return
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat/demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.content,
                    topic,
                    messageHistory: messages
                })
            })

            if (!response.ok) {
                const error = await response.json()
                if (response.status === 429) {
                    toast.error("Demo limit reached! Sign up to continue.")
                    return
                }
                throw new Error(error.error || "Failed to get response")
            }

            if (!response.body) {
                throw new Error("No response body")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: ""
            }

            setMessages(prev => [...prev, assistantMessage])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split("\n")

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6)
                        if (data === "[DONE]") break

                        try {
                            const parsed = JSON.parse(data)
                            if (parsed.content) {
                                assistantMessage.content += parsed.content
                                setMessages(prev => {
                                    const newMessages = [...prev]
                                    newMessages[newMessages.length - 1] = { ...assistantMessage }
                                    return newMessages
                                })
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to send message")
            setMessages(prev => prev.filter(m => m.id !== userMessage.id))
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/demo")}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <div>
                                    <h1 className="font-bold text-slate-900 dark:text-white">
                                        {topic}
                                    </h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Demo Mode
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {remainingMessages}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400"> messages left</span>
                            </div>
                            <CTAButton asChild variant="primary" size="sm">
                                <Link href="/signup">Sign Up</Link>
                            </CTAButton>
                        </div>
                    </div>
                </div>
            </header>

            {/* Demo Banner */}
            {messageCount === 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50">
                    <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>
                                You're in demo mode with {MAX_DEMO_MESSAGES} messages. Data isn't saved.
                                <Link href="/signup" className="font-semibold underline ml-1">
                                    Sign up for unlimited access
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
                <ScrollArea ref={scrollRef} className="flex-1 pr-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <Card className="p-8 max-w-md text-center">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    Start Learning About {topic}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    Ask any question to begin your learning journey. I'm here to help you understand this topic deeply!
                                </p>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    Try asking:
                                    <ul className="mt-2 space-y-1 text-left">
                                        <li>• "What are the key concepts?"</li>
                                        <li>• "Can you explain the basics?"</li>
                                        <li>• "What should I learn first?"</li>
                                    </ul>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Limit Warning */}
                {remainingMessages <= 3 && remainingMessages > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                            <Zap className="w-4 h-4" />
                            <p>
                                Only {remainingMessages} message{remainingMessages !== 1 ? "s" : ""} remaining in demo mode!{" "}
                                <Link href="/signup" className="font-semibold underline">
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {/* Limit Reached */}
                {remainingMessages === 0 && (
                    <Card className="p-6 mb-4 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50">
                        <div className="text-center">
                            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                                Demo Limit Reached!
                            </h3>
                            <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">
                                You've used all {MAX_DEMO_MESSAGES} demo messages. Sign up to continue your learning journey with unlimited messages!
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button asChild variant="outline" className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50">
                                    <Link href="/demo">Try Another Topic</Link>
                                </Button>
                                <CTAButton asChild variant="primary">
                                    <Link href="/signup">Sign Up Free</Link>
                                </CTAButton>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Explore Button - Floating */}
                {showExploreButton && (
                    <div
                        className="fixed z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                        style={{
                            left: `${exploreButtonPosition.x}px`,
                            top: `${exploreButtonPosition.y}px`,
                            transform: "translate(-50%, -100%)"
                        }}
                    >
                        <Button
                            onClick={handleExploreText}
                            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-lg gap-2 h-9 px-4 font-bold"
                            size="sm"
                        >
                            <Lightbulb className="w-4 h-4" />
                            Explore This
                        </Button>
                    </div>
                )}

                {/* Hint for text selection */}
                {messages.length > 0 && messageCount < MAX_DEMO_MESSAGES && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
                            <Lightbulb className="w-4 h-4 flex-shrink-0" />
                            <p>
                                <strong>Pro tip:</strong> Highlight any text in the responses to explore that topic deeper!
                            </p>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <Textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            remainingMessages === 0
                                ? "Demo limit reached - Sign up to continue"
                                : "Type your message... (Shift + Enter for new line)"
                        }
                        disabled={isLoading || remainingMessages === 0}
                        className="min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Press Enter to send
                        </div>
                        <CTAButton
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isLoading || remainingMessages === 0}
                            variant="primary"
                            size="sm"
                        >
                            {isLoading ? "Sending..." : "Send"}
                        </CTAButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DemoChatPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading demo...</p>
                </div>
            </div>
        }>
            <DemoChatContent />
        </Suspense>
    )
}
