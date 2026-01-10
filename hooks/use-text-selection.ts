"use client"

import { useEffect } from "react"
import { useExploreStore } from "@/lib/store"

export function useTextSelection() {
  const { setSelectedText, showExploreButton } = useExploreStore()

  useEffect(() => {
    const handleSelectionEnd = (e: MouseEvent | TouchEvent) => {
      // Small delay to ensure selection is complete
      setTimeout(() => {
        // Ignore if clicking on interactive elements that shouldn't trigger selection
        const target = e.target as HTMLElement
        if (target.closest('[data-ignore-selection]')) {
          return
        }

        const selection = window.getSelection()
        const selectedText = selection?.toString().trim()

        if (selectedText && selectedText.length > 2) { // Minimum 3 characters
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

            // For mobile, adjust position to be more touch-friendly
            const isMobile = window.innerWidth <= 768
            const xOffset = isMobile ? 0 : rect.width / 2
            const yOffset = isMobile ? -60 : -10 // More space on mobile for finger access

            setSelectedText(selectedText, {
              x: rect.left + xOffset,
              y: rect.top + yOffset,
            })
          }
        } else {
          // Only clear if we're not clicking inside the tooltip
          if (!target.closest('[data-ignore-selection]')) {
            setSelectedText(null)
          }
        }
      }, 100) // Small delay for mobile selection to complete
    }

    // Handle both mouse and touch events
    const handleMouseUp = (e: MouseEvent) => handleSelectionEnd(e)
    const handleTouchEnd = (e: TouchEvent) => handleSelectionEnd(e)

    // Also handle selection change directly (better for mobile)
    const handleSelectionChange = () => {
      setTimeout(() => {
        const selection = window.getSelection()
        const selectedText = selection?.toString().trim()

        if (selectedText && selectedText.length > 2) {
          const range = selection?.getRangeAt(0)
          if (range) {
            const commonAncestor = range.commonAncestorContainer as HTMLElement
            const ancestorElement = commonAncestor.nodeType === 1 ? commonAncestor : commonAncestor.parentElement

            // Only show tooltip if selection is within an AI response
            if (ancestorElement?.closest('[data-ai-response]')) {
              const rect = range.getBoundingClientRect()

              // For mobile, adjust position to be more touch-friendly
              const isMobile = window.innerWidth <= 768
              const xOffset = isMobile ? 0 : rect.width / 2
              const yOffset = isMobile ? -60 : -10

              setSelectedText(selectedText, {
                x: rect.left + xOffset,
                y: rect.top + yOffset,
              })
            }
          }
        }
      }, 150) // Longer delay for selectionchange event
    }

    // Add event listeners
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchend", handleTouchEnd, { passive: true })
    document.addEventListener("selectionchange", handleSelectionChange)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [setSelectedText])

  return { showExploreButton }
}
