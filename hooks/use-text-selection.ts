"use client"

import { useEffect } from "react"
import { useExploreStore } from "@/lib/store"

export function useTextSelection() {
  const { setSelectedText, showExploreButton } = useExploreStore()

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Ignore if clicking on interactive elements that shouldn't trigger selection
      const target = e.target as HTMLElement
      if (target.closest('[data-ignore-selection]')) {
        return
      }

      const selection = window.getSelection()
      const selectedText = selection?.toString().trim()

      if (selectedText) {
        // Show explore button for the selection
        const range = selection?.getRangeAt(0)
        if (range) {
          // Check if the selection is inside an AI response
          const commonAncestor = range.commonAncestorContainer as HTMLElement
          const ancestorElement = commonAncestor.nodeType === 1 ? commonAncestor : commonAncestor.parentElement

          // Only show tooltip if selection is within an AI response
          if (!ancestorElement?.closest('[data-ai-response]')) {
            return
          }

          // Also check if inside ignored element
          if (ancestorElement?.closest('[data-ignore-selection]')) {
            return
          }

          const rect = range.getBoundingClientRect()
          setSelectedText(selectedText, {
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          })
        }
      } else {
        // Only clear if we're not clicking inside the tooltip
        if (!target.closest('[data-ignore-selection]')) {
          setSelectedText(null)
        }
      }
    }

    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [setSelectedText])

  return { showExploreButton }
}
