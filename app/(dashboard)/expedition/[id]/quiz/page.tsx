"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useExpedition, useTrails } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Brain, CheckCircle2, XCircle, Trophy, Loader2, ArrowRight, RotateCcw, ArrowLeft } from "lucide-react"
import { QuizChallengeModal } from "@/components/quiz/quiz-challenge-modal"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface QuizQuestion {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
}

export default function QuizPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const expeditionId = params.id as string
    const trailId = searchParams.get("trailId")

    const { data: expedition } = useExpedition(expeditionId)
    const { data: trails } = useTrails(expeditionId)
    const currentTrail = trails?.find(t => t.id === trailId)

    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showResult, setShowResult] = useState(false)
    const [score, setScore] = useState(0)
    const [showChallengeModal, setShowChallengeModal] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (trails && !currentTrail && initialized) {
            toast.error("Trail not found")
            router.push(`/expedition/${expeditionId}`)
        }
    }, [trails, currentTrail, expeditionId, router, initialized])

    useEffect(() => {
        if (currentTrail && !initialized) {
            generateQuiz()
            setInitialized(true)
        }
    }, [currentTrail, initialized])

    const generateQuiz = async () => {
        if (!currentTrail) return

        setLoading(true)
        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expeditionId,
                    content: currentTrail.source_text
                })
            })

            if (!response.ok) {
                throw new Error('Failed to generate quiz')
            }

            const data = await response.json()
            setQuestions(data.questions)
        } catch (error) {
            console.error('Error generating quiz:', error)
            toast.error('Failed to generate quiz. Please try again.')
            router.push(`/expedition/${expeditionId}`)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectAnswer = (index: number) => {
        if (showResult) return
        setSelectedAnswer(index)
    }

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return

        if (selectedAnswer === questions[currentQuestionIndex].correctIndex) {
            setScore(score + 1)
        }

        setShowResult(true)
    }

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setSelectedAnswer(null)
            setShowResult(false)
        } else {
            setQuizCompleted(true)
        }
    }

    const handleRestartQuiz = () => {
        setCurrentQuestionIndex(0)
        setSelectedAnswer(null)
        setShowResult(false)
        setScore(0)
        setQuizCompleted(false)
    }

    const currentQuestion = questions[currentQuestionIndex]
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
    const finalPercentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

    const getScoreMessage = () => {
        if (finalPercentage >= 90) return "Outstanding! You're a true expert!"
        if (finalPercentage >= 80) return "Excellent work! You really know your stuff!"
        if (finalPercentage >= 70) return "Great job! You've got a solid understanding!"
        if (finalPercentage >= 60) return "Good effort! Keep exploring to learn more!"
        return "Nice try! There's always more to discover!"
    }

    const getScoreEmoji = () => {
        if (finalPercentage >= 90) return "🏆"
        if (finalPercentage >= 80) return "🥇"
        if (finalPercentage >= 70) return "🥈"
        if (finalPercentage >= 60) return "🥉"
        return "📚"
    }

    if (!currentTrail || !expedition) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href={`/expedition/${expeditionId}?trailId=${trailId}`}
                        className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        <span className="font-bold text-sm">Back to Expedition</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-none mb-1">Knowledge Check</h1>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{currentTrail.title}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center text-center space-y-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse" />
                                <div className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Generating Your Quiz</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Our AI is analyzing the content of "{currentTrail.title}" to create challenging questions for you.
                                </p>
                            </div>
                        </motion.div>
                    ) : quizCompleted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md mx-auto"
                        >
                            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-6">
                                <div className="text-8xl mb-6 animate-bounce">{getScoreEmoji()}</div>
                                <div className="space-y-2 mb-8">
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">
                                        {score}/{questions.length}
                                    </div>
                                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        {finalPercentage}% Correct
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        {getScoreMessage()}
                                    </p>
                                </div>

                                <div className="grid gap-3">
                                    <Button
                                        onClick={() => setShowChallengeModal(true)}
                                        className="h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-98"
                                    >
                                        <Trophy className="h-5 w-5 mr-2" />
                                        Challenge Friends
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleRestartQuiz}
                                            className="flex-1 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Try Again
                                        </Button>
                                        <Link href={`/expedition/${expeditionId}?trailId=${trailId}`} className="flex-1">
                                            <Button
                                                variant="outline"
                                                className="w-full h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                                            >
                                                Done
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : currentQuestion ? (
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden"
                        >
                            {/* Progress Bar */}
                            <div className="bg-slate-50 dark:bg-slate-950/50 px-8 py-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                    <span className="text-slate-400">Question {currentQuestionIndex + 1} / {questions.length}</span>
                                    <span className="text-indigo-500">{score} Correct</span>
                                </div>
                                <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800" indicatorClassName="bg-indigo-500" />
                            </div>

                            <div className="p-8">
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">
                                    {currentQuestion.question}
                                </h3>

                                <div className="space-y-3 mb-8">
                                    {currentQuestion.options.map((option, index) => {
                                        const isCorrect = index === currentQuestion.correctIndex
                                        const isSelected = selectedAnswer === index
                                        const showCorrectness = showResult

                                        return (
                                            <motion.button
                                                key={index}
                                                whileHover={!showResult ? { scale: 1.01 } : {}}
                                                whileTap={!showResult ? { scale: 0.99 } : {}}
                                                onClick={() => handleSelectAnswer(index)}
                                                disabled={showResult}
                                                className={cn(
                                                    "w-full p-5 text-left rounded-2xl border-2 transition-all font-medium text-base md:text-lg relative overflow-hidden group",
                                                    !showCorrectness && isSelected && "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100",
                                                    !showCorrectness && !isSelected && "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 hover:border-indigo-200 hover:bg-white dark:hover:bg-slate-800",
                                                    showCorrectness && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100",
                                                    showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100",
                                                    showCorrectness && !isSelected && !isCorrect && "border-slate-100 dark:border-slate-800 opacity-50 grayscale"
                                                )}
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <span>{option}</span>
                                                    {showCorrectness && isCorrect && (
                                                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                    )}
                                                    {showCorrectness && isSelected && !isCorrect && (
                                                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                                    )}
                                                    {!showCorrectness && !isSelected && (
                                                        <div className="h-6 w-6 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-300 transition-colors" />
                                                    )}
                                                    {!showCorrectness && isSelected && (
                                                        <div className="h-6 w-6 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>

                                <AnimatePresence>
                                    {showResult && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-8"
                                        >
                                            <div className={cn(
                                                "p-5 rounded-2xl border",
                                                selectedAnswer === currentQuestion.correctIndex
                                                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900"
                                                    : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900"
                                            )}>
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "mt-1 p-1 rounded-full",
                                                        selectedAnswer === currentQuestion.correctIndex
                                                            ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                                                            : "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400"
                                                    )}>
                                                        {selectedAnswer === currentQuestion.correctIndex
                                                            ? <CheckCircle2 className="h-4 w-4" />
                                                            : <Brain className="h-4 w-4" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className={cn(
                                                            "font-bold text-sm mb-1",
                                                            selectedAnswer === currentQuestion.correctIndex
                                                                ? "text-green-700 dark:text-green-300"
                                                                : "text-amber-700 dark:text-amber-300"
                                                        )}>
                                                            {selectedAnswer === currentQuestion.correctIndex ? "Correct!" : "Explanation"}
                                                        </p>
                                                        <p className={cn(
                                                            "text-sm",
                                                            selectedAnswer === currentQuestion.correctIndex
                                                                ? "text-green-800 dark:text-green-200"
                                                                : "text-amber-800 dark:text-amber-200"
                                                        )}>
                                                            {currentQuestion.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-end">
                                    {!showResult ? (
                                        <Button
                                            onClick={handleSubmitAnswer}
                                            disabled={selectedAnswer === null}
                                            className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 disabled:shadow-none"
                                        >
                                            Check Answer
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNextQuestion}
                                            className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-lg shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
                                        >
                                            {currentQuestionIndex < questions.length - 1 ? (
                                                <>
                                                    Next Question
                                                    <ArrowRight className="h-5 w-5 ml-2" />
                                                </>
                                            ) : (
                                                <>
                                                    See Results
                                                    <Trophy className="h-5 w-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </main>

            <QuizChallengeModal
                open={showChallengeModal}
                onOpenChange={setShowChallengeModal}
                expeditionId={expeditionId}
                expeditionTitle={expedition.title}
                score={score}
                totalQuestions={questions.length}
            />
        </div>
    )
}
