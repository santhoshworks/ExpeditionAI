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
            Test your understanding of the topics discussed in this exploration. Choose how many questions you&apos;d like:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {QUESTION_OPTIONS.map((option) => (
            <button
              key={option.count}
              onClick={() => setSelected(option.count)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selected === option.count
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
