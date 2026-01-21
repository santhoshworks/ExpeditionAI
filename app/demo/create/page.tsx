"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowRight, Loader2, Zap, Brain, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function DemoCreatePage() {
    const router = useRouter()
    const [topic, setTopic] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateDemo = async () => {
        if (!topic.trim()) {
            toast.error("Please enter a topic to explore")
            return
        }

        setIsCreating(true)

        try {
            // Import and create demo expedition
            const { DemoSessionManager } = await import("@/lib/demo-session")
            const sessionManager = new DemoSessionManager()
            const expedition = sessionManager.createExpedition(topic.trim())

            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 500))

            // Redirect to demo expedition
            router.push(`/demo/expedition/${expedition.id}`)
        } catch (error) {
            console.error("Error creating demo:", error)
            toast.error(`Failed to create demo: ${error instanceof Error ? error.message : 'Unknown error'}`)
            setIsCreating(false)
        }
    }

    const exampleTopics = [
        "Machine Learning Fundamentals",
        "Web Development with React",
        "Quantum Physics Basics",
        "Ancient Roman History",
        "Climate Change Science"
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* Dynamic Background - matching landing page */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />
            <div className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="container mx-auto px-6 py-20 flex items-center justify-center min-h-screen">
                <div className="w-full max-w-2xl">
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
                            Start Your Learning Journey
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                            Enter any topic and explore it visually with AI. No signup required!
                        </p>
                    </div>

                    {/* Main Card */}
                    <Card className="shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <CardHeader className="space-y-3">
                            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">What do you want to learn?</CardTitle>
                            <CardDescription className="text-base md:text-lg text-slate-600 dark:text-slate-400">
                                We&apos;ll create an interactive knowledge map for you to explore
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Input */}
                            <div className="space-y-3">
                                <Label htmlFor="topic" className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                    Enter a topic or question
                                </Label>
                                <Input
                                    id="topic"
                                    placeholder="Type any topic you want to learn about..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && topic.trim() && !isCreating && handleCreateDemo()}
                                    className="h-14 text-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                                    disabled={isCreating}
                                />
                            </div>

                            {/* Example Topics */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Or try one of these:</p>
                                <div className="flex flex-wrap gap-2">
                                    {exampleTopics.map((example) => (
                                        <button
                                            key={example}
                                            onClick={() => setTopic(example)}
                                            disabled={isCreating}
                                            className="px-4 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 rounded-full transition-all disabled:opacity-50"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Create Button */}
                            <Button
                                onClick={handleCreateDemo}
                                disabled={isCreating || !topic.trim()}
                                className="w-full h-14 text-lg font-bold rounded-2xl bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white shadow-xl shadow-slate-200 dark:shadow-indigo-900/50 hover:shadow-indigo-200 dark:hover:shadow-indigo-800/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating Your Expedition...
                                    </>
                                ) : !topic.trim() ? (
                                    <>
                                        Enter a Topic First
                                        <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
                                    </>
                                ) : (
                                    <>
                                        Start Exploring
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            {/* User guidance */}
                            {!topic.trim() && !isCreating && (
                                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                                    💡 Enter a topic above or click one of the example topics to enable the &quot;Start Exploring&quot; button
                                </div>
                            )}

                            {/* Demo Limitations */}
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-5">
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    Demo Mode Limitations
                                </h4>
                                <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-2 font-medium">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"></span>
                                        10 AI chat messages
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"></span>
                                        5 topic branches (trails)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"></span>
                                        Progress not saved (resets on refresh)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"></span>
                                        Sign up for unlimited access!
                                    </li>
                                </ul>
                            </div>

                            {/* Features Preview */}
                            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <Brain className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">AI-Powered</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <Sparkles className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600">Visual Maps</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                                        <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600">Deep Dives</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-8 space-y-3">
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                            Want to save your progress?{" "}
                            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline transition-colors">
                                Sign up for free
                            </Link>
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Already have an account?{" "}
                            <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
