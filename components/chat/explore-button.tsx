"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useExploreStore } from "@/lib/store"
import { useCreateTrail, useExpedition } from "@/lib/queries"
import { Compass, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ExploreButtonProps {
  expeditionId: string
  parentTrailId?: string
}

export function ExploreButton({ expeditionId, parentTrailId }: ExploreButtonProps) {
  const { selectedText, selectedTextPosition, setSelectedText, setCurrentTrail, currentTrailId, setAutoMessageData } = useExploreStore()
  const { data: expedition } = useExpedition(expeditionId)
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState("")
  const [definition, setDefinition] = useState<string | null>(null)
  const [isDefining, setIsDefining] = useState(false)
  const createTrail = useCreateTrail()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Function to truncate text to 3 words
  const truncateText = (text: string) => {
    if (!text) return ""
    const words = text.trim().split(/\s+/)
    if (words.length > 3) {
      return words.slice(0, 3).join(" ") + "..."
    }
    return text
  }

  // Fetch definition when text is selected
  useEffect(() => {
    if (selectedText && selectedText.length > 0 && selectedText.length < 500) {
      const fetchDefinition = async () => {
        setIsDefining(true)
        setDefinition(null)
        try {
          const response = await fetch("/api/define", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: selectedText,
              context: expedition?.title // Pass expedition title as context
            }),
          })
          if (response.ok) {
            const data = await response.json()
            setDefinition(data.definition)
          }
        } catch (error) {
          console.error("Failed to fetch definition:", error)
        } finally {
          setIsDefining(false)
        }
      }
      fetchDefinition()
    } else {
      setDefinition(null)
    }
  }, [selectedText, expedition?.title])

  const handleCancel = useCallback(() => {
    setShowInput(false)
    setSelectedText(null)
    setTitle("")
    setDefinition(null)
  }, [setSelectedText])

  // Focus input when showing
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  // Close when clicking outside (handle both mouse and touch)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCancel()
      }
    }

    const handleTouchOutside = (e: TouchEvent) => handleClickOutside(e)
    const handleMouseOutside = (e: MouseEvent) => handleClickOutside(e)

    if (selectedText) {
      document.addEventListener("mousedown", handleMouseOutside)
      document.addEventListener("touchstart", handleTouchOutside, { passive: true })
      return () => {
        document.removeEventListener("mousedown", handleMouseOutside)
        document.removeEventListener("touchstart", handleTouchOutside)
      }
    }
  }, [selectedText, handleCancel])

  const handleExplore = async () => {
    if (!selectedText || createTrail.isPending) return

    try {
      const effectiveParentId = (parentTrailId || currentTrailId) ?? undefined
      const newTitle = title.trim() || selectedText.substring(0, 30) || "New Exploration"

      const trail = await createTrail.mutateAsync({
        expeditionId,
        parentTrailId: effectiveParentId,
        title: newTitle,
        sourceText: selectedText,
      })

      if (trail && trail.id) {
        // Store the auto-message data for the ChatInterface to pick up
        setAutoMessageData({
          trailId: trail.id,
          selectedText: (newTitle || "this topic"),
        })

        // 1. Set the new trail as current
        setCurrentTrail(trail.id)

        // 2. Clear the selection/input state
        setShowInput(false)
        setDefinition(null)
        setTitle("")
        setSelectedText(null) // This will unmount the tooltip

        // 3. Navigate to ensure we're on the expedition page
        // Use a timeout to ensure store updates have flushed
        setTimeout(() => {
          router.push(`/expedition/${expeditionId}?trailId=${trail.id}`)
        }, 0)
      }
    } catch (error) {
      console.error("Failed to create trail:", error)
      alert("Failed to create exploration trail. Please try again.")
    }
  }

  const handleStartExplore = () => {
    setShowInput(true)
    if (selectedText) {
      setTitle(selectedText)
    }
  }

  if (!selectedText || !selectedTextPosition) return null

  // Calculate position - ensure it stays within viewport with better mobile handling
  const isMobile = window.innerWidth <= 768
  const tooltipWidth = showInput || definition ? (isMobile ? 280 : 300) : 200

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.min(Math.max(selectedTextPosition.x - (tooltipWidth / 2), 10), window.innerWidth - tooltipWidth - 10),
    top: Math.max(selectedTextPosition.y - (showInput ? (isMobile ? 140 : 120) : (definition ? (isMobile ? 170 : 150) : (isMobile ? 100 : 80))), 10),
    zIndex: 1000,
  }

  return (
    <div
      ref={containerRef}
      style={tooltipStyle}
      data-ignore-selection
      className={cn(
        "bg-popover border rounded-xl shadow-2xl p-3 md:p-4 animate-in fade-in-0 zoom-in-95 backdrop-blur-md ring-1 ring-white/10",
        "touch-manipulation", // Better touch handling on mobile
        showInput || definition ? "w-[280px] md:w-[300px]" : "w-auto min-w-[200px]"
      )}
    >
      {!showInput ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {truncateText(selectedText)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="h-6 w-6 p-0 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {isDefining ? (
              <div className="space-y-2 py-1">
                <div className="h-3 bg-muted animate-pulse rounded w-full" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </div>
            ) : definition ? (
              <p className="text-xs md:text-sm text-foreground/90 leading-relaxed italic border-l-2 border-primary/30 pl-3">
                {definition}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleExplore}
              disabled={createTrail.isPending}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 shadow-sm text-xs md:text-sm"
            >
              {createTrail.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Compass className="h-3.5 w-3.5" />
              )}
              {createTrail.isPending ? "Starting..." : "Explore More"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="gap-2 text-xs md:text-sm px-2 md:px-3"
              disabled={createTrail.isPending}
            >
              Close
            </Button>
          </div>
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
            &quot;{selectedText.substring(0, 100)}{selectedText.length > 100 ? "..." : ""}&quot;
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
            className="w-full gap-2"
          >
            {createTrail.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {createTrail.isPending ? "Exploring..." : "Explore this topic"}
          </Button>
        </div>
      )}
    </div>
  )
}
