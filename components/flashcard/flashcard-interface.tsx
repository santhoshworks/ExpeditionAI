"use client"

import { useEffect, useState } from "react"
import { useExploreStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Layers,
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { FlashcardCard } from "./flashcard-card"

interface FlashcardInterfaceProps {
  expeditionId: string
  trailId?: string
  onExit: () => void
}

export function FlashcardInterface({ expeditionId, trailId, onExit }: FlashcardInterfaceProps) {
  const {
    flashcardState,
    setFlashcards,
    setCurrentCardIndex,
    markCardProgress,
    setFlashcardLoading,
    setFlashcardError,
    resetFlashcards,
  } = useExploreStore()

  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = flashcardState.flashcards[flashcardState.currentCardIndex]
  const isLastCard = flashcardState.currentCardIndex === flashcardState.flashcards.length - 1
  const isFirstCard = flashcardState.currentCardIndex === 0
  const progress = flashcardState.flashcards.length > 0
    ? ((flashcardState.currentCardIndex + 1) / flashcardState.flashcards.length) * 100
    : 0

  // Calculate stats
  const gotItCount = Object.values(flashcardState.cardProgress).filter(
    (p) => p.status === "got_it"
  ).length
  const missedCount = Object.values(flashcardState.cardProgress).filter(
    (p) => p.status === "missed"
  ).length
  const reviewedCount = gotItCount + missedCount

  // Load flashcards on mount
  useEffect(() => {
    const loadFlashcards = async () => {
      if (flashcardState.flashcards.length > 0) return // Already loaded

      setFlashcardLoading(true)
      setFlashcardError(null)

      try {
        const response = await fetch("/api/flashcards/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expeditionId,
            trailId,
            cardCount: 10,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to generate flashcards")
        }

        const data = await response.json()
        setFlashcards(data.cards)
      } catch (error) {
        console.error("Flashcard loading error:", error)
        setFlashcardError(
          error instanceof Error ? error.message : "Failed to load flashcards"
        )
      } finally {
        setFlashcardLoading(false)
      }
    }

    loadFlashcards()
  }, [expeditionId, trailId])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleGotIt = () => {
    if (currentCard) {
      markCardProgress(currentCard.id, "got_it")
      handleNext()
    }
  }

  const handleMissed = () => {
    if (currentCard) {
      markCardProgress(currentCard.id, "missed")
      handleNext()
    }
  }

  const handleNext = () => {
    if (!isLastCard) {
      setCurrentCardIndex(flashcardState.currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (!isFirstCard) {
      setCurrentCardIndex(flashcardState.currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleRetry = () => {
    resetFlashcards()
    onExit()
  }

  const handleExit = () => {
    resetFlashcards()
    onExit()
  }

  // Loading state
  if (flashcardState.flashcardLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-amber-100 dark:bg-amber-950 p-4 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Creating Your Flashcards
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
          Analyzing your conversation and extracting key concepts...
        </p>
      </div>
    )
  }

  // Error state
  if (flashcardState.flashcardError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-red-100 dark:bg-red-950 p-4 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Flashcard Generation Failed
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
          {flashcardState.flashcardError}
        </p>
        <Button onClick={handleExit} variant="outline">
          Back to Chat
        </Button>
      </div>
    )
  }

  // Session complete - show summary
  if (reviewedCount === flashcardState.flashcards.length && flashcardState.flashcards.length > 0) {
    const percentage = Math.round((gotItCount / flashcardState.flashcards.length) * 100)

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-amber-100 dark:bg-amber-950 p-4 rounded-full mb-4">
            <Layers className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Session Complete!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Here&apos;s how you did:
          </p>

          <div className="flex gap-8 mb-8">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold text-green-600">{gotItCount}</span>
              </div>
              <span className="text-sm text-slate-500">Got It</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-3xl font-bold text-red-600">{missedCount}</span>
              </div>
              <span className="text-sm text-slate-500">Missed</span>
            </div>
          </div>

          <div className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            {percentage}% Mastered
          </div>

          {missedCount > 0 && (
            <p className="text-sm text-slate-500 mb-4 text-center max-w-md">
              Consider reviewing the {missedCount} card{missedCount > 1 ? "s" : ""} you missed!
            </p>
          )}
        </div>

        <div className="border-t bg-white dark:bg-slate-900 p-4 flex gap-3">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="flex-1 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Session
          </Button>
          <Button onClick={handleExit} className="flex-1 gap-2">
            Back to Chat
          </Button>
        </div>
      </div>
    )
  }

  // Main flashcard view
  if (!currentCard) {
    return null
  }

  const currentProgress = flashcardState.cardProgress[currentCard.id]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded-lg">
              <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              Card {flashcardState.currentCardIndex + 1} of {flashcardState.flashcards.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {gotItCount}
              </Badge>
              <Badge variant="secondary" className="bg-red-50 text-red-600 border-red-100">
                <XCircle className="h-3 w-3 mr-1" />
                {missedCount}
              </Badge>
            </div>
            <Button onClick={handleExit} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="w-full max-w-lg">
          {/* Source Trail Badge */}
          <div className="flex justify-center mb-4">
            <Badge variant="outline" className="text-xs">
              From: {currentCard.sourceTrailTitle}
            </Badge>
          </div>

          {/* Flashcard */}
          <FlashcardCard
            front={currentCard.front}
            back={currentCard.back}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            importance={currentCard.importance}
          />

          {/* Instructions */}
          {!isFlipped && !currentProgress && (
            <p className="text-center text-sm text-slate-500 mt-4">
              Tap the card to reveal the answer
            </p>
          )}
        </div>
      </div>

      {/* Navigation / Actions */}
      <div className="border-t bg-white dark:bg-slate-900 p-4">
        {isFlipped && !currentProgress ? (
          // Show grading buttons after flip
          <div className="flex gap-3">
            <Button
              onClick={handleMissed}
              variant="outline"
              className="flex-1 gap-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600"
            >
              <XCircle className="h-4 w-4" />
              Missed It
            </Button>
            <Button
              onClick={handleGotIt}
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Got It!
            </Button>
          </div>
        ) : currentProgress ? (
          // Show navigation after grading
          <div className="flex gap-3">
            <Button
              onClick={handlePrev}
              variant="outline"
              disabled={isFirstCard}
              className="flex-1 gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            {!isLastCard ? (
              <Button
                onClick={handleNext}
                className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
              >
                Next Card
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentCardIndex(flashcardState.currentCardIndex)}
                className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
              >
                View Results
              </Button>
            )}
          </div>
        ) : (
          // Show flip instruction
          <Button
            onClick={handleFlip}
            className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
          >
            <RotateCcw className="h-4 w-4" />
            Flip Card
          </Button>
        )}
      </div>
    </div>
  )
}
