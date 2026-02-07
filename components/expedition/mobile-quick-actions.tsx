"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Plus,
  X,
  Brain,
  Layers,
  BookOpen,
  Wand2,
  GitBranch,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MobileBottomSheet } from "@/components/layout/mobile-bottom-sheet"

interface MobileQuickActionsProps {
  expeditionId: string
  onQuizClick: () => void
  onFlashcardsClick: () => void
  onGenerateClick: () => void
  onTrailsClick: () => void
  flashcardsEnabled?: boolean
}

const actionItems = [
  {
    id: "quiz",
    label: "Quiz Me",
    icon: Brain,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    textColor: "text-purple-500",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: Layers,
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-600",
    textColor: "text-amber-500",
  },
  {
    id: "journal",
    label: "Journal",
    icon: BookOpen,
    color: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
    textColor: "text-indigo-500",
    isLink: true,
  },
  {
    id: "generate",
    label: "Generate Dives",
    icon: Wand2,
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
    textColor: "text-emerald-500",
  },
  {
    id: "trails",
    label: "Switch Trail",
    icon: GitBranch,
    color: "bg-slate-500",
    hoverColor: "hover:bg-slate-600",
    textColor: "text-slate-500",
  },
]

export function MobileQuickActions({
  expeditionId,
  onQuizClick,
  onFlashcardsClick,
  onGenerateClick,
  onTrailsClick,
  flashcardsEnabled = false,
}: MobileQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleAction = (actionId: string) => {
    setIsOpen(false)
    switch (actionId) {
      case "quiz":
        onQuizClick()
        break
      case "flashcards":
        onFlashcardsClick()
        break
      case "generate":
        onGenerateClick()
        break
      case "trails":
        onTrailsClick()
        break
    }
  }

  const filteredActions = actionItems.filter(
    (item) => item.id !== "flashcards" || flashcardsEnabled
  )

  return (
    <>
      {/* FAB Button - positioned above chat input area */}
      <div className="fixed bottom-44 right-3 z-40 md:hidden">
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-11 h-11 rounded-xl shadow-lg flex items-center justify-center transition-all",
            "bg-indigo-600 hover:bg-indigo-700 text-white",
            "active:scale-95"
          )}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </motion.div>
        </motion.button>
      </div>

      {/* Bottom Sheet with Actions */}
      <MobileBottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Quick Actions"
        height="auto"
      >
        <div className="grid grid-cols-3 gap-2 pb-20">
          {filteredActions.map((action) => {
            const Icon = action.icon

            if (action.isLink) {
              return (
                <Link
                  key={action.id}
                  href={`/expedition/${expeditionId}/journal`}
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                      action.color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
                    {action.label}
                  </span>
                </Link>
              )
            }

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleAction(action.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                    action.color
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </MobileBottomSheet>
    </>
  )
}
