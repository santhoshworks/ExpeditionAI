"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowRight, Loader2, Zap, Brain, BookOpen, AlertCircle } from "lucide-react"
import Link from "next/link"

const DEMO_TOPICS = [
    {
        title: "Machine Learning Fundamentals",
        description: "Explore neural networks, deep learning, and AI basics",
        emoji: "🤖"
    },
    {
        title: "Web Development with React",
        description: "Learn modern web development with React and Next.js",
        emoji: "⚛️"
    },
    {
        title: "Quantum Physics Basics",
        description: "Dive into the fascinating world of quantum mechanics",
        emoji: "⚛️"
    }
]

export default function DemoPage() {
    const router = useRouter()
    const [isStarting, setIsStarting] = useState(false)

    const handleStartDemo = (topic: string) => {
        setIsStarting(true)
        setTimeout(() => {
            router.push(`/demo/chat?topic=${encodeURIComponent(topic)}`)
        }, 300)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Background */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="container mx-auto px-6 py-12 md:py-20 flex items-center justify-center min-h-screen">
                <div className="w-full max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Link href="/" className="inline-flex items-center gap-2.5 group mb-8">
                            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                                ExpeditionAI
                            </span>
                        </Link>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
                            Try ExpeditionAI Free
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                            Experience AI-powered learning. Choose a topic and start chatting!
                        </p>
                    </div>

                    {/* Demo Limitation Banner */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 mb-8 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                                Demo Mode - Data Not Saved
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                You get 10 messages to try out ExpeditionAI. Progress resets when you leave. Sign up to save your learning journey!
                            </p>
                        </div>
                    </div>

                    {/* Topic Selection */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                            Choose a Topic to Explore
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {DEMO_TOPICS.map((topic) => (
                                <Card
                                    key={topic.title}
                                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                                    onClick={() => !isStarting && handleStartDemo(topic.title)}
                                >
                                    <CardHeader>
                                        <div className="text-4xl mb-3">{topic.emoji}</div>
                                        <CardTitle className="text-lg text-slate-900 dark:text-white">
                                            {topic.title}
                                        </CardTitle>
                                        <CardDescription className="text-slate-600 dark:text-slate-400">
                                            {topic.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white"
                                            disabled={isStarting}
                                        >
                                            {isStarting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Starting...
                                                </>
                                            ) : (
                                                <>
                                                    Start Learning
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Features Preview */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 mb-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                            What You'll Experience
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">AI-Powered Chat</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Ask questions and get intelligent, context-aware responses
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Interactive Learning</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Engage with topics through conversation and exploration
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Deep Insights</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Learn concepts thoroughly with detailed explanations
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    Want More?
                                </h4>
                                <p className="text-sm text-indigo-700 dark:text-indigo-400">
                                    Sign up for unlimited messages, save your progress, create multiple learning paths, and unlock advanced features!
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button asChild variant="outline" className="border-indigo-200 dark:border-indigo-800">
                                    <Link href="/login">Log In</Link>
                                </Button>
                                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Link href="/signup">Sign Up Free</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
