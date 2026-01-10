"use client"

import { useState, useEffect } from "react"
import { TrailWithCounts } from "@/types/database"
import { cn } from "@/lib/utils"
import { MessageSquare, ChevronRight, ChevronDown, FolderOpen, Folder, FileText, Tent } from "lucide-react"
import { FlagButton } from "@/components/trail/flag-button"

interface MiniTreeProps {
  trails: TrailWithCounts[]
  currentTrailId?: string
  onTrailSelect?: (trailId: string) => void
}

export function MiniTree({ trails, currentTrailId, onTrailSelect }: MiniTreeProps) {
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

  const renderTrail = (trail: TrailWithCounts, depth: number = 0): React.ReactNode => {
    const children = trails.filter((t) => t.parent_trail_id === trail.id)
    const isActive = trail.id === currentTrailId
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.has(trail.id)

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
              isExpanded ? (
                <FolderOpen className={cn("h-4 w-4", isActive ? "text-primary" : "text-yellow-500")} />
              ) : (
                <Folder className={cn("h-4 w-4", isActive ? "text-primary" : "text-yellow-600")} />
              )
            ) : (
              <FileText className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
            )}
          </div>

          {/* Trail Title and Info */}
          <div
            onClick={() => onTrailSelect?.(trail.id)}
            className="flex-1 flex items-center justify-between min-w-0 gap-2"
          >
            <span
              className={cn(
                "truncate font-medium",
                isActive ? "text-primary" : "text-foreground",
                trail.is_base_camp && "font-semibold"
              )}
            >
              {trail.title}
            </span>

            <div className="flex items-center gap-1 flex-shrink-0 text-xs">
              <div className={cn(
                "transition-opacity duration-200",
                trail.is_flagged ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <FlagButton
                  trailId={trail.id}
                  isFlagged={trail.is_flagged}
                  size="xs"
                />
              </div>
              {(trail.message_count || 0) > 0 && (
                <span className="flex items-center gap-0.5 text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-[10px] font-medium">{trail.message_count}</span>
                </span>
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
    </div>
  )
}
