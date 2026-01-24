"use client"

import { useState, useEffect } from "react"
import { TrailWithCounts } from "@/types/database"
import { FlagType } from "@/types/flags"
import { getDisplayFlagType } from "@/lib/flag-migration"
import { cn } from "@/lib/utils"
import { MessageSquare, ChevronRight, ChevronDown, Compass, MapPin, Tent, Trash2 } from "lucide-react"
import { MultiFlagButton } from "@/components/trail/multi-flag-button"
import { useExploreStore } from "@/lib/store"
import { useDeleteTrail } from "@/lib/queries"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TrailTreeProps {
  trails: TrailWithCounts[]
  currentTrailId?: string
  onTrailSelect: (trailId: string) => void
}

export function TrailTree({ trails, currentTrailId, onTrailSelect }: TrailTreeProps) {
  const trailsWithNewResponse = useExploreStore((state) => state.trailsWithNewResponse)
  const deleteTrailMutation = useDeleteTrail()
  const currentExpeditionId = useExploreStore((state) => state.currentExpeditionId)

  const [trailToDelete, setTrailToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize with all trails that have children expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const trailsWithChildren = new Set<string>()
    trails.forEach(trail => {
      if (trail.parent_trail_id) {
        trailsWithChildren.add(trail.parent_trail_id)
      }
    })
    return trailsWithChildren
  })

  // Auto-expand all nodes with children and the active trail's path
  useEffect(() => {
    const trailsWithChildren = new Set<string>()
    trails.forEach(trail => {
      if (trail.parent_trail_id) {
        trailsWithChildren.add(trail.parent_trail_id)
      }
    })

    // Also expand the active trail's parents
    if (currentTrailId) {
      const findParents = (trailId: string) => {
        const trail = trails.find((t) => t.id === trailId)
        if (trail?.parent_trail_id) {
          trailsWithChildren.add(trail.parent_trail_id)
          findParents(trail.parent_trail_id)
        }
      }
      findParents(currentTrailId)
    }

    setExpandedNodes(trailsWithChildren)
  }, [currentTrailId, trails])

  if (trails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-4">
        <p>No trails yet. Start exploring!</p>
      </div>
    )
  }

  // Find root trails (base camps or trails without parents)
  const rootTrails = trails.filter((t) => t.is_base_camp || !t.parent_trail_id)

  const toggleExpanded = (trailId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(trailId)) {
        next.delete(trailId)
      } else {
        next.add(trailId)
      }
      return next
    })
  }

  const handleTrailDelete = async (trailId: string) => {
    if (!currentExpeditionId) return
    setIsDeleting(true)

    try {
      await deleteTrailMutation.mutateAsync({
        trailId,
        expeditionId: currentExpeditionId
      })
      toast.success("Trail deleted successfully")

      // If we deleted the current trail, select base camp or first available trail
      if (currentTrailId === trailId) {
        const baseCamp = trails.find(t => t.is_base_camp)
        if (baseCamp && baseCamp.id !== trailId) {
          onTrailSelect(baseCamp.id)
        } else {
          const firstOther = trails.find(t => trailId !== t.id)
          if (firstOther) onTrailSelect(firstOther.id)
        }
      }
      setTrailToDelete(null)
    } catch (error) {
      console.error("Failed to delete trail:", error)
      toast.error("Failed to delete trail")
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (e: React.MouseEvent, trailId: string) => {
    e.stopPropagation()
    setTrailToDelete(trailId)
  }

  const renderTrail = (trail: TrailWithCounts, depth: number = 0): React.ReactNode => {
    const children = trails.filter((t) => t.parent_trail_id === trail.id && !t.is_base_camp)
    const isActive = trail.id === currentTrailId
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.has(trail.id)
    const hasNewResponse = trailsWithNewResponse.has(trail.id)

    // Calculate indent
    const indent = depth * 16

    return (
      <div key={trail.id}>
        <div
          className={cn(
            "group relative flex items-center gap-1 pr-2 py-1.5 text-sm transition-all rounded-md cursor-pointer select-none",
            "hover:bg-accent/50",
            isActive && "bg-primary/10 border-l-2 border-primary"
          )}
          style={{ paddingLeft: `${indent + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) {
                toggleExpanded(trail.id)
              }
            }}
            className={cn(
              "flex items-center justify-center w-4 h-4 rounded hover:bg-accent transition-colors",
              !hasChildren && "invisible"
            )}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )
            )}
          </button>

          {/* Trail Icon */}
          <div className="flex-shrink-0">
            {trail.is_base_camp ? (
              <Tent className={cn("h-4 w-4", isActive ? "text-primary" : "text-blue-500")} />
            ) : hasChildren ? (
              <Compass className={cn("h-4 w-4", isActive ? "text-primary" : "text-amber-500")} />
            ) : (
              <MapPin className={cn("h-4 w-4", isActive ? "text-primary" : "text-green-600")} />
            )}
          </div>

          {/* Trail Title and Info */}
          <div
            onClick={() => onTrailSelect(trail.id)}
            className="flex-1 flex items-center justify-between min-w-0 gap-2"
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <div className="min-w-0 flex-1 truncate">
                <span
                  className={cn(
                    "font-medium",
                    isActive ? "text-primary" : "text-foreground",
                    trail.is_base_camp && "font-semibold"
                  )}
                  title={trail.title}
                >
                  {trail.title}
                </span>
              </div>
              {hasNewResponse && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="New response ready" />
              )}
            </span>

            <div className="flex items-center gap-1 flex-shrink-0 text-xs">
              <div className={cn(
                "transition-opacity duration-200",
                getDisplayFlagType(trail) !== FlagType.NOT_EXPLORED ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <MultiFlagButton
                  trailId={trail.id}
                  currentFlag={getDisplayFlagType(trail)}
                  size="xs"
                />
              </div>
              {(trail.message_count || 0) > 0 && (
                <span className="flex items-center gap-0.5 text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-[10px] font-medium">{trail.message_count}</span>
                </span>
              )}
              {!trail.is_base_camp && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all rounded-lg"
                  onClick={(e) => confirmDelete(e, trail.id)}
                  title="Delete trail"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Connecting Line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-border/50"
              style={{ left: `${indent + 20}px` }}
            />
            {children.map((child) => renderTrail(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-2 space-y-0.5 w-full">
      {rootTrails.map((trail) => renderTrail(trail))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!trailToDelete} onOpenChange={(open) => !open && setTrailToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Trail</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trail? This action cannot be undone.
              All messages and branched trails within this path will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <p className="text-sm text-rose-800 dark:text-rose-300 font-medium">
                Warning: Deleting this trail will also delete all its "child" trails and conversation history.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setTrailToDelete(null)}
              disabled={isDeleting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => trailToDelete && handleTrailDelete(trailToDelete)}
              disabled={isDeleting}
              className="rounded-full bg-rose-600 hover:bg-rose-700"
            >
              {isDeleting ? "Deleting..." : "Delete Trail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
