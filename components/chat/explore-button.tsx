"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useExploreStore } from "@/lib/store"
import { useCreateTrail } from "@/lib/queries"
import { Compass, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ExploreButtonProps {
  expeditionId: string
  parentTrailId?: string
}

export function ExploreButton({ expeditionId, parentTrailId }: ExploreButtonProps) {
  const { selectedText, selectedTextPosition, setSelectedText, setCurrentTrail, currentTrailId } = useExploreStore()
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState("")
  const createTrail = useCreateTrail()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus input when showing
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCancel()
      }
    }

    if (selectedText) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [selectedText])

  const handleExplore = async () => {
    if (!title.trim() || !selectedText) return

    try {
      const trail = await createTrail.mutateAsync({
        expeditionId,
        parentTrailId: parentTrailId || currentTrailId || undefined,
        title: title.trim(),
        sourceText: selectedText,
      })

      handleCancel()
      setCurrentTrail(trail.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to create trail:", error)
    }
  }

  const handleCancel = () => {
    setShowInput(false)
    setSelectedText(null)
    setTitle("")
  }

  const handleStartExplore = () => {
    setShowInput(true)
  }

  if (!selectedText || !selectedTextPosition) return null

  // Calculate position - ensure it stays within viewport
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(Math.max(selectedTextPosition.x - 100, 10), window.innerWidth - 320),
    top: Math.max(selectedTextPosition.y - (showInput ? 120 : 50), 10),
    zIndex: 1000,
  }

  return (
    <div
      ref={containerRef}
      style={tooltipStyle}
      className={cn(
        "bg-popover border rounded-lg shadow-lg p-2 animate-in fade-in-0 zoom-in-95",
        showInput ? "w-[300px]" : "w-auto"
      )}
    >
      {!showInput ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleStartExplore}
            className="gap-2"
          >
            <Compass className="h-4 w-4" />
            Start New Trail
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Compass className="h-4 w-4" />
              New Trail
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded max-h-16 overflow-y-auto">
            "{selectedText.substring(0, 100)}{selectedText.length > 100 ? "..." : ""}"
          </div>
          <Input
            ref={inputRef}
            placeholder="Trail title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim()) {
                handleExplore()
              }
              if (e.key === "Escape") {
                handleCancel()
              }
            }}
            className="h-8 text-sm"
          />
          <Button
            size="sm"
            onClick={handleExplore}
            disabled={!title.trim() || createTrail.isPending}
            className="w-full"
          >
            {createTrail.isPending ? "Creating..." : "Create Trail"}
          </Button>
        </div>
      )}
    </div>
  )
}
