# Quiz Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement an AI-generated quiz feature on expedition pages that quizzes users on topics with multiple-choice questions, evaluated client-side.

**Architecture:** Add a quiz mode toggle to expedition pages that replaces the chat interface with a quiz interface. Quiz questions are generated via a new API endpoint using GPT-4o-mini based on the entire expedition's message history. Client-side evaluation displays immediate feedback after each question with explanations.

**Tech Stack:** Next.js 15, React, TypeScript, Zustand (state), Tailwind CSS, OpenRouter AI SDK, Zod validation

---

## Task 1: Add Quiz State Management

**Files:**
- Modify: `lib/store.ts`

**Step 1: Add quiz state to the store**

Add the following types and state to the store:

```typescript
// Add after the ExploreState interface definition (around line 5)

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation: string
  userAnswer: number | null
}

export interface QuizState {
  isQuizMode: boolean
  quizQuestions: QuizQuestion[]
  currentQuestionIndex: number
  quizLoading: boolean
  quizError: string | null
  selectedQuestionCount: number | null
}
```

**Step 2: Add quiz state properties to ExploreState interface**

Add these properties to the ExploreState interface (around line 33):

```typescript
  // Quiz state
  quizState: QuizState

  // Quiz actions
  setQuizMode: (isActive: boolean) => void
  setQuizQuestions: (questions: QuizQuestion[]) => void
  setCurrentQuestionIndex: (index: number) => void
  answerQuestion: (questionIndex: number, answerIndex: number) => void
  setQuizLoading: (loading: boolean) => void
  setQuizError: (error: string | null) => void
  setSelectedQuestionCount: (count: number | null) => void
  resetQuiz: () => void
```

**Step 3: Implement quiz state and actions**

Add the initial state (around line 69):

```typescript
      // Initial quiz state
      quizState: {
        isQuizMode: false,
        quizQuestions: [],
        currentQuestionIndex: 0,
        quizLoading: false,
        quizError: null,
        selectedQuestionCount: null,
      },
```

Add the quiz actions (after the reset action, around line 127):

```typescript
      // Quiz actions
      setQuizMode: (isActive) =>
        set((state) => ({
          quizState: { ...state.quizState, isQuizMode: isActive },
        })),

      setQuizQuestions: (questions) =>
        set((state) => ({
          quizState: { ...state.quizState, quizQuestions: questions },
        })),

      setCurrentQuestionIndex: (index) =>
        set((state) => ({
          quizState: { ...state.quizState, currentQuestionIndex: index },
        })),

      answerQuestion: (questionIndex, answerIndex) =>
        set((state) => {
          const newQuestions = [...state.quizState.quizQuestions]
          newQuestions[questionIndex] = {
            ...newQuestions[questionIndex],
            userAnswer: answerIndex,
          }
          return {
            quizState: { ...state.quizState, quizQuestions: newQuestions },
          }
        }),

      setQuizLoading: (loading) =>
        set((state) => ({
          quizState: { ...state.quizState, quizLoading: loading },
        })),

      setQuizError: (error) =>
        set((state) => ({
          quizState: { ...state.quizState, quizError: error },
        })),

      setSelectedQuestionCount: (count) =>
        set((state) => ({
          quizState: { ...state.quizState, selectedQuestionCount: count },
        })),

      resetQuiz: () =>
        set((state) => ({
          quizState: {
            isQuizMode: false,
            quizQuestions: [],
            currentQuestionIndex: 0,
            quizLoading: false,
            quizError: null,
            selectedQuestionCount: null,
          },
        })),
```

**Step 4: Commit**

```bash
git add lib/store.ts
git commit -m "feat(quiz): add quiz state management to store"
```

---

## Task 2: Create Quiz API Endpoint

**Files:**
- Create: `app/api/quiz/generate/route.ts`

**Step 1: Create the quiz generation API route**

```typescript
import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

const quizRequestSchema = z.object({
  expeditionId: z.string(),
  questionCount: z.number().min(3).max(10),
})

const quizResponseSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()).length(4),
      correctAnswer: z.number().min(0).max(3),
      explanation: z.string(),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { expeditionId, questionCount } = quizRequestSchema.parse(body)

    // Verify expedition ownership
    const { data: expedition, error: expeditionError } = await supabase
      .from("expeditions")
      .select("id, title, user_id")
      .eq("id", expeditionId)
      .single()

    if (expeditionError || !expedition || expedition.user_id !== user.id) {
      return new Response("Expedition not found or access denied", { status: 403 })
    }

    // Get all trails for this expedition
    const { data: trails, error: trailsError } = await supabase
      .from("trails")
      .select("id, title")
      .eq("expedition_id", expeditionId)

    if (trailsError || !trails || trails.length === 0) {
      return new Response("No trails found for this expedition", { status: 404 })
    }

    // Get all messages from all trails in this expedition
    const trailIds = trails.map((t) => t.id)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("role, content, trail_id")
      .in("trail_id", trailIds)
      .order("created_at", { ascending: true })

    if (messagesError) {
      return new Response("Failed to fetch messages", { status: 500 })
    }

    // If no messages, cannot generate quiz
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No conversation history found. Chat with the AI first to generate a quiz.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Build context from messages grouped by trail
    const trailMap = new Map<string, { title: string; messages: any[] }>()
    trails.forEach((trail) => {
      trailMap.set(trail.id, { title: trail.title, messages: [] })
    })

    messages.forEach((msg) => {
      const trail = trailMap.get(msg.trail_id)
      if (trail) {
        trail.messages.push(msg)
      }
    })

    let conversationContext = `Expedition: ${expedition.title}\n\n`
    trailMap.forEach((trail, trailId) => {
      if (trail.messages.length > 0) {
        conversationContext += `Trail: ${trail.title}\n`
        trail.messages.forEach((msg) => {
          conversationContext += `${msg.role}: ${msg.content}\n`
        })
        conversationContext += "\n"
      }
    })

    // Generate quiz using AI
    const systemPrompt = `You are a quiz generator for an educational platform. Based on the conversation history provided, generate ${questionCount} multiple-choice questions to test the user's understanding of the topics discussed.

Rules:
1. Questions should test understanding, not just memorization
2. Difficulty should be adaptive - analyze the depth of the conversation and create appropriately challenging questions
3. Each question must have exactly 4 options
4. Provide clear explanations for the correct answers
5. Questions should cover different topics/trails from the conversation when possible
6. Make questions engaging and educational

Respond ONLY with valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct and what was discussed in the conversation."
    }
  ]
}

Do not include any text before or after the JSON object.`

    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Generate ${questionCount} quiz questions based on this conversation:\n\n${conversationContext}`,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the AI response
    let quizData
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      quizData = JSON.parse(jsonMatch[0])
      quizData = quizResponseSchema.parse(quizData)
    } catch (parseError) {
      console.error("Failed to parse quiz response:", result.text)
      return new Response(
        JSON.stringify({
          error: "Failed to generate valid quiz questions. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(JSON.stringify(quizData), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Quiz generation error:", error)

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request format", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Failed to generate quiz" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/quiz/generate/route.ts
git commit -m "feat(quiz): add quiz generation API endpoint"
```

---

## Task 3: Create Quiz Selection Modal Component

**Files:**
- Create: `components/quiz/quiz-selection-modal.tsx`

**Step 1: Create the quiz selection modal component**

```typescript
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Brain, Sparkles } from "lucide-react"

interface QuizSelectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartQuiz: (questionCount: number) => void
}

const QUESTION_OPTIONS = [
  { count: 3, label: "3 Questions", description: "Quick check", duration: "~2 min" },
  { count: 5, label: "5 Questions", description: "Standard quiz", duration: "~5 min" },
  { count: 7, label: "7 Questions", description: "Thorough test", duration: "~7 min" },
  { count: 10, label: "10 Questions", description: "Deep dive", duration: "~10 min" },
]

export function QuizSelectionModal({
  open,
  onOpenChange,
  onStartQuiz,
}: QuizSelectionModalProps) {
  const [selected, setSelected] = useState(5)

  const handleStart = () => {
    onStartQuiz(selected)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 dark:bg-indigo-950 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <DialogTitle className="text-xl">Start Quiz</DialogTitle>
          </div>
          <DialogDescription>
            Test your understanding of the topics discussed in this expedition. Choose how many questions you'd like:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {QUESTION_OPTIONS.map((option) => (
            <button
              key={option.count}
              onClick={() => setSelected(option.count)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selected === option.count
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {option.description}
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {option.duration}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add components/quiz/quiz-selection-modal.tsx
git commit -m "feat(quiz): add quiz selection modal component"
```

---

## Task 4: Create Quiz Interface Component

**Files:**
- Create: `components/quiz/quiz-interface.tsx`

**Step 1: Create the main quiz interface component**

```typescript
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
                Here's how you did:
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
```

**Step 2: Commit**

```bash
git add components/quiz/quiz-interface.tsx
git commit -m "feat(quiz): add quiz interface component"
```

---

## Task 5: Add Quiz Button to Expedition Page

**Files:**
- Modify: `app/(dashboard)/expedition/[id]/page.tsx`

**Step 1: Import quiz components and add state**

Add these imports at the top (after existing imports, around line 19):

```typescript
import { QuizSelectionModal } from "@/components/quiz/quiz-selection-modal"
import { QuizInterface } from "@/components/quiz/quiz-interface"
```

**Step 2: Add quiz modal state**

Add this state after the existing `generateModalOpen` state (around line 27):

```typescript
  const [quizModalOpen, setQuizModalOpen] = useState(false)
```

**Step 3: Get quiz store methods**

Update the `useExploreStore` destructuring (around line 29) to include quiz methods:

```typescript
  const {
    setCurrentExpedition,
    currentTrailId,
    setCurrentTrail,
    userTier,
    userCredits,
    quizState,
    setQuizMode,
    setSelectedQuestionCount,
  } = useExploreStore()
```

**Step 4: Add quiz handlers**

Add these handler functions after the existing effects (around line 66):

```typescript
  const handleStartQuiz = (questionCount: number) => {
    setSelectedQuestionCount(questionCount)
    setQuizMode(true)
  }

  const handleExitQuiz = () => {
    setQuizMode(false)
  }
```

**Step 5: Add Quiz button to header**

Find the "Quick actions" div (around line 167) and add the Quiz button before the Journal button:

```typescript
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setQuizModalOpen(true)}
                  className="h-9 rounded-lg border-slate-200 dark:border-slate-800 font-bold text-xs gap-2 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                >
                  <Brain className="h-3.5 w-3.5 text-purple-500" />
                  Quiz Me
                </Button>
                <Link href={`/expedition/${expeditionId}/journal`}>
                  <Button variant="outline" className="h-9 rounded-lg border-slate-200 dark:border-slate-800 font-bold text-xs gap-2 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                    Journal
                  </Button>
                </Link>
              </div>
```

**Step 6: Replace chat with quiz interface when quiz mode is active**

Replace the conditional rendering of ChatInterface (around line 183) with this:

```typescript
          {currentTrailId ? (
            quizState.isQuizMode ? (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/10">
                <QuizInterface
                  expeditionId={expeditionId}
                  onExit={handleExitQuiz}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/10">
                <ChatInterface
                  trailId={currentTrailId}
                  expeditionId={expeditionId}
                  trailTitle={currentTrail?.title}
                  trailSourceText={currentTrail?.source_text}
                  onOpenGenerateModal={() => setGenerateModalOpen(true)}
                />
                <ExploreButton
                  expeditionId={expeditionId}
                  parentTrailId={currentTrailId}
                />
              </div>
            )
          ) : (
```

**Step 7: Add quiz selection modal at the end**

Add the quiz modal before the closing div (around line 227, after the GenerateTopicsModal):

```typescript
      {/* Quiz Selection Modal */}
      <QuizSelectionModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
        onStartQuiz={handleStartQuiz}
      />
    </div>
  )
}
```

**Step 8: Add Brain import to lucide-react icons**

Update the import statement (around line 18) to include Brain:

```typescript
import { BookOpen, Wand2, GitBranch, Compass, Zap, Brain } from "lucide-react"
```

**Step 9: Commit**

```bash
git add app/\(dashboard\)/expedition/\[id\]/page.tsx
git commit -m "feat(quiz): integrate quiz button and interface into expedition page"
```

---

## Task 6: Add Quiz Feature to Constants

**Files:**
- Modify: `lib/constants.ts`

**Step 1: Add quiz model to FEATURE_MODELS**

Add this entry to the FEATURE_MODELS object (around line 259):

```typescript
  // Quiz generation
  QUIZ_GENERATION: 'openai/gpt-4o-mini',
```

**Step 2: Commit**

```bash
git add lib/constants.ts
git commit -m "feat(quiz): add quiz model to feature constants"
```

---

## Task 7: Create Progress UI Component (if missing)

**Files:**
- Check if exists: `components/ui/progress.tsx`
- Create if missing: `components/ui/progress.tsx`

**Step 1: Check if Progress component exists**

Run: `ls components/ui/progress.tsx`

If file does not exist, create it:

```typescript
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-indigo-600 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

**Step 2: Install required dependency if missing**

Run: `npm list @radix-ui/react-progress`

If not installed, run:

```bash
npm install @radix-ui/react-progress
```

**Step 3: Commit (if created)**

```bash
git add components/ui/progress.tsx
git commit -m "feat(quiz): add progress UI component"
```

---

## Task 8: Test Quiz Feature

**Step 1: Start the development server**

Run: `npm run dev`

Expected: Server starts successfully on http://localhost:3000

**Step 2: Test quiz flow**

1. Navigate to an expedition page
2. Click "Quiz Me" button in header
3. Select question count (e.g., 5 questions)
4. Click "Generate Quiz"
5. Verify quiz loads with questions
6. Answer questions and verify immediate feedback
7. Complete quiz and verify results page
8. Test "New Quiz" and "Back to Chat" buttons

**Step 3: Test error handling**

1. Try quiz on expedition with no messages - should show error
2. Verify graceful handling if API fails

**Step 4: Test UI responsiveness**

1. Test on mobile viewport
2. Verify progress bar updates correctly
3. Verify explanations display properly

---

## Task 9: Final Commit and Documentation

**Step 1: Update README or add feature documentation**

If there's a README or docs folder, add a note about the quiz feature:

```markdown
### Quiz Feature

Users can test their understanding with AI-generated quizzes based on their conversation history:

- Click "Quiz Me" button on expedition pages
- Choose number of questions (3-10)
- Get immediate feedback after each answer
- View comprehensive results with explanations
- Quiz questions adapt to conversation depth
```

**Step 2: Final commit**

```bash
git add .
git commit -m "docs: add quiz feature documentation"
```

**Step 3: Create PR or merge**

Run: `git log --oneline -10` to review commits

Consider creating a PR:
```bash
git push origin HEAD
```

---

## Notes for Implementation

- The quiz uses `openai/gpt-4o-mini` model for cost-effective generation
- Quiz questions are adaptive based on conversation depth
- All evaluation happens client-side (no backend storage)
- Quiz state is managed in Zustand store
- UI replaces chat interface completely when quiz mode is active
- Immediate feedback after each question with explanations
- Comprehensive results page at the end

## Testing Checklist

- [ ] Quiz button appears in expedition header
- [ ] Quiz modal opens and allows question count selection
- [ ] Quiz questions generate successfully
- [ ] Questions display with 4 options each
- [ ] Answer selection works correctly
- [ ] Immediate feedback appears after answering
- [ ] Explanations are clear and helpful
- [ ] Progress bar updates correctly
- [ ] Results page shows accurate score
- [ ] Question review on results page works
- [ ] "New Quiz" button generates fresh quiz
- [ ] "Back to Chat" returns to normal chat
- [ ] Error handling works for edge cases
- [ ] Mobile responsive design works
- [ ] Dark mode styling works correctly
