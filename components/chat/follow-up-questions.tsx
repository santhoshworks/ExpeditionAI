"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react"

interface FollowUpQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  isVisible: boolean
}

export function FollowUpQuestions({ questions, onQuestionClick, isVisible }: FollowUpQuestionsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!questions || questions.length === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="mb-3"
        >
          {/* Collapsible header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2 group"
          >
            <Sparkles className="w-3 h-3" />
            <span>Follow-up questions</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 group-hover:translate-y-[-1px] transition-transform" />
            ) : (
              <ChevronDown className="w-3 h-3 group-hover:translate-y-[1px] transition-transform" />
            )}
          </button>

          {/* Collapsible content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {questions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      onClick={() => onQuestionClick(question)}
                      className="px-3 py-1.5 rounded-full text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-200 cursor-pointer"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
