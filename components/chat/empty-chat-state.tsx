"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Sparkles,
    HelpCircle,
    BookOpen,
    Wand2,
    Zap,
    Lightbulb,
    GraduationCap,
    MessageSquare,
    Search,
    BrainCircuit
} from "lucide-react"
import { motion } from "framer-motion"

interface EmptyChatStateProps {
    onSuggest: (text: string) => void
    onAction: (actionId: string) => void
    topicTitle?: string
}

export function EmptyChatState({ onSuggest, onAction, topicTitle }: EmptyChatStateProps) {
    const suggestions = [
        `How does ${topicTitle || "this"} work?`,
        `What are the key concepts of ${topicTitle || "this topic"}?`,
        `Can you give me a real-world example?`,
        "What should I learn first?",
    ]

    const actions = [
        {
            id: "generate_dives",
            title: "Generate Dives",
            description: "Break this down into sub-topics to explore.",
            icon: Wand2,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-500/10",
            border: "border-indigo-100 dark:border-indigo-500/20",
        },
        {
            id: "quiz",
            title: "Quiz Me",
            description: "Test your knowledge with a few questions.",
            icon: GraduationCap,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-500/10",
            border: "border-amber-100 dark:border-amber-500/20",
        },
        {
            id: "summary",
            title: "Quick Summary",
            description: "Get a high-level overview of everything.",
            icon: BookOpen,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            border: "border-emerald-100 dark:border-emerald-500/20",
        },
    ]

    return (
        <div className="flex flex-col items-center justify-start min-h-full py-8 md:py-12 p-4 md:p-6 text-center max-w-2xl mx-auto space-y-8 md:space-y-12 transition-all">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3 md:space-y-4"
            >
                <div className="bg-indigo-600 p-3 md:p-4 rounded-2xl md:rounded-3xl w-fit mx-auto shadow-xl shadow-indigo-100 dark:shadow-none mb-4 md:mb-6">
                    <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight px-2">
                    Welcome to <span className="text-indigo-600">{topicTitle || "this Expedition"}</span>
                </h2>
                <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mx-auto">
                    Your AI guide is ready to help you master this topic. Choose a path to begin your learning journey.
                </p>
            </motion.div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full px-2">
                {actions.map((action, index) => (
                    <motion.div
                        key={action.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                        className={action.id === "summary" ? "sm:col-span-2 md:col-span-1" : ""}
                    >
                        <Card
                            className={`group flex flex-col items-start p-4 md:p-5 h-full text-left cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-none hover:-translate-y-1 border-2 ${action.border} bg-white dark:bg-slate-900/50 backdrop-blur-sm`}
                            onClick={() => onAction(action.id)}
                        >
                            <div className={`${action.bg} ${action.color} p-2 md:p-3 rounded-xl md:rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white mb-1 md:mb-2">{action.title}</h3>
                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                {action.description}
                            </p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Suggestion Chips */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-3 md:space-y-4 w-full"
            >
                <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                    <MessageSquare className="w-3 md:w-4 h-3 md:h-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Quick Questions</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 px-2">
                    {suggestions.map((suggestion, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className="rounded-full px-3 md:px-5 py-1.5 md:py-2 h-auto text-xs md:text-sm font-semibold border-slate-200 dark:border-slate-800 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 dark:hover:border-indigo-500/30 text-slate-600 dark:text-slate-300 transition-all"
                            onClick={() => onSuggest(suggestion)}
                        >
                            <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 md:mr-2 text-indigo-500" />
                            {suggestion}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Pro Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 flex items-start gap-3 md:gap-4 text-left w-full mx-auto max-w-lg"
            >
                <div className="bg-amber-100 dark:bg-amber-500/20 p-1.5 md:p-2 rounded-lg md:rounded-xl shrink-0">
                    <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                </div>
                <div className="space-y-0.5 md:space-y-1">
                    <p className="text-[10px] md:text-xs font-bold text-slate-900 dark:text-white">Pro Tip</p>
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                        Try highlighting any text in the chat to <span className="text-indigo-600 dark:text-indigo-400 font-bold">Deep Dive</span> into specific concepts.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
