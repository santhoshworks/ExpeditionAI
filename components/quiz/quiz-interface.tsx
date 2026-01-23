"use client"

import { useEffect, useState } from "react"
import { useExploreStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizInterfaceProps {
  expeditionId: string
  onExit: () => void
}

export function QuizInterface({ expeditionId, onExit }: QuizInterfaceProps) {
  const {
    quizState,
    setCurrentQuestionIndex,
    answerQuestion,
    setQuizLoading,
    setQuizError,
    setQuizQuestions,
    resetQuiz,
  } = useExploreStore()

  const [hasAnswered, setHasAnswered] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const currentQuestion = quizState.quizQuestions[quizState.currentQuestionIndex]
  const isLastQuestion =
    quizState.currentQuestionIndex === quizState.quizQuestions.length - 1
  const progress =
    ((quizState.currentQuestionIndex + 1) / quizState.quizQuestions.length) * 100

  // Calculate score
  const score = quizState.quizQuestions.filter(
    (q) => q.userAnswer !== null && q.userAnswer === q.correctAnswer
  ).length

  // Load quiz questions on mount
  useEffect(() => {
    const loadQuiz = async () => {
      if (quizState.quizQuestions.length > 0) return // Already loaded

      setQuizLoading(true)
      setQuizError(null)

      try {
        const response = await fetch("/api/quiz/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expeditionId,
            questionCount: quizState.selectedQuestionCount || 5,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to generate quiz")
        }

        const data = await response.json()

        // Add IDs to questions
        const questionsWithIds = data.questions.map(
          (q: any, index: number) => ({
            ...q,
            id: `q-${index}`,
            userAnswer: null,
          })
        )

        setQuizQuestions(questionsWithIds)
      } catch (error) {
        console.error("Quiz loading error:", error)
        setQuizError(
          error instanceof Error ? error.message : "Failed to load quiz"
        )
      } finally {
        setQuizLoading(false)
      }
    }

    loadQuiz()
  }, [expeditionId, quizState.selectedQuestionCount])

  const handleAnswer = (optionIndex: number) => {
    if (hasAnswered) return

    answerQuestion(quizState.currentQuestionIndex, optionIndex)
    setHasAnswered(true)
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      // Quiz complete - stay on results
      return
    }

    setCurrentQuestionIndex(quizState.currentQuestionIndex + 1)
    setHasAnswered(false)
    setShowExplanation(false)
  }

  const handleRetry = () => {
    resetQuiz()
    onExit()
  }

  const handleExit = () => {
    resetQuiz()
    onExit()
  }

  // Loading state
  if (quizState.quizLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-indigo-100 dark:bg-indigo-950 p-4 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Generating Your Quiz
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
          Analyzing your conversation and creating personalized questions...
        </p>
      </div>
    )
  }

  // Error state
  if (quizState.quizError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-red-100 dark:bg-red-950 p-4 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Quiz Generation Failed
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
          {quizState.quizError}
        </p>
        <Button onClick={handleExit} variant="outline">
          Back to Chat
        </Button>
      </div>
    )
  }

  // Quiz complete - show results
  if (
    hasAnswered &&
    isLastQuestion &&
    quizState.quizQuestions.every((q) => q.userAnswer !== null)
  ) {
    const percentage = Math.round(
      (score / quizState.quizQuestions.length) * 100
    )

    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-8">
              <div className="bg-indigo-100 dark:bg-indigo-950 p-4 rounded-full w-fit mx-auto mb-4">
                <Brain className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Quiz Complete!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Here&apos;s how you did:
              </p>
              <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {score}/{quizState.quizQuestions.length}
              </div>
              <div className="text-lg text-slate-600 dark:text-slate-400">
                {percentage}% Correct
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              {quizState.quizQuestions.map((question, index) => {
                const isCorrect = question.userAnswer === question.correctAnswer
                return (
                  <Card
                    key={question.id}
                    className={cn(
                      "p-4 border-2",
                      isCorrect
                        ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20"
                        : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                          Question {index + 1}: {question.question}
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                          <strong>Your answer:</strong>{" "}
                          {question.options[question.userAnswer!]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                            <strong>Correct answer:</strong>{" "}
                            {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="border-t bg-white dark:bg-slate-900 p-4 flex gap-3">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Quiz
          </Button>
          <Button onClick={handleExit} className="flex-1 gap-2">
            Back to Chat
          </Button>
        </div>
      </div>
    )
  }

  // Quiz in progress
  if (!currentQuestion) {
    return null
  }

  const isAnswerCorrect =
    hasAnswered && currentQuestion.userAnswer === currentQuestion.correctAnswer

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 dark:bg-indigo-950 p-2 rounded-lg">
              <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Question {quizState.currentQuestionIndex + 1} of{" "}
              {quizState.quizQuestions.length}
            </span>
          </div>
          <Button onClick={handleExit} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentQuestion.userAnswer === index
              const isCorrect = index === currentQuestion.correctAnswer
              const showCorrect = hasAnswered && isCorrect
              const showIncorrect = hasAnswered && isSelected && !isCorrect

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={hasAnswered}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all",
                    !hasAnswered &&
                      "hover:border-indigo-300 dark:hover:border-indigo-700",
                    !hasAnswered && isSelected && "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50",
                    !hasAnswered && !isSelected && "border-slate-200 dark:border-slate-800",
                    showCorrect && "border-green-500 bg-green-50 dark:bg-green-950/50",
                    showIncorrect && "border-red-500 bg-red-50 dark:bg-red-950/50",
                    hasAnswered && !isSelected && !isCorrect && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold",
                        !hasAnswered && isSelected && "border-indigo-600 bg-indigo-600 text-white",
                        !hasAnswered && !isSelected && "border-slate-300 dark:border-slate-700",
                        showCorrect && "border-green-600 bg-green-600",
                        showIncorrect && "border-red-600 bg-red-600"
                      )}
                    >
                      {showCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      )}
                      {showIncorrect && (
                        <XCircle className="h-5 w-5 text-white" />
                      )}
                      {!hasAnswered && String.fromCharCode(65 + index)}
                      {hasAnswered && !isSelected && !isCorrect && String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 font-medium text-slate-900 dark:text-white">
                      {option}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <Card
              className={cn(
                "p-4 border-2",
                isAnswerCorrect
                  ? "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20"
                  : "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20"
              )}
            >
              <div className="flex items-start gap-3">
                {isAnswerCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {isAnswerCorrect ? "Correct!" : "Incorrect"}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Navigation */}
      {hasAnswered && (
        <div className="border-t bg-white dark:bg-slate-900 p-4">
          <Button
            onClick={handleNext}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isLastQuestion ? "View Results" : "Next Question"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
