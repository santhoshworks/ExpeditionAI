"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb } from "lucide-react"

interface FollowUpQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  isVisible: boolean
}

export function FollowUpQuestions({ questions, onQuestionClick, isVisible }: FollowUpQuestionsProps) {
  if (!questions || questions.length === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="mb-3 md:mb-4"
        >
          <div className="bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-3 md:p-4 space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500" />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide">Continue exploring</span>
            </div>

            <div className="flex flex-row gap-2">
              {questions.map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => onQuestionClick(question)}
                  className="group w-full text-left p-2.5 md:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all duration-200 cursor-pointer"
                >
                  <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {question}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
