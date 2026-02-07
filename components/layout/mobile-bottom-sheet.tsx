"use client"

import { useEffect, useRef, ReactNode } from "react"
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  className?: string
  /** Height as percentage of viewport (0-100) or 'auto' */
  height?: number | "auto"
  /** Show drag handle at top */
  showDragHandle?: boolean
  /** Show close button */
  showCloseButton?: boolean
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
  height = 50,
  showDragHandle = true,
  showCloseButton = true,
}: MobileBottomSheetProps) {
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleDragEnd = (_: never, info: PanInfo) => {
    // Close if dragged down more than 100px or with velocity
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose()
    }
  }

  const heightStyle = height === "auto" ? "auto" : `${height}vh`
  const maxHeight = height === "auto" ? "90vh" : `${Math.min(height + 10, 90)}vh`

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 md:hidden",
              "bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl",
              "flex flex-col mobile-safe-area",
              className
            )}
            style={{
              height: heightStyle,
              maxHeight: maxHeight,
            }}
          >
            {/* Drag Handle */}
            {showDragHandle && (
              <div
                className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
            )}

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 pb-2">
                {title && (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 -mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-target"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
