"use client"

import { useEffect } from "react"
import { useExploreStore } from "@/lib/store"

export function useTextSelection() {
  const { setSelectedText, showExploreButton } = useExploreStore()

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection()
      const selectedText = selection?.toString().trim()

      if (selectedText && selectedText.length > 10) {
        // Only show explore button for meaningful selections (at least 10 chars)
        const range = selection?.getRangeAt(0)
        if (range) {
          const rect = range.getBoundingClientRect()
          setSelectedText(selectedText, {
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
          })
        }
      } else {
        setSelectedText(null)
      }
    }

    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [setSelectedText])

  return { showExploreButton }
}
