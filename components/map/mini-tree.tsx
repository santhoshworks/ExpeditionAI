"use client"

import { TrailWithCounts } from "@/types/database"
import { cn } from "@/lib/utils"
import { Flag, MessageSquare, ChevronRight } from "lucide-react"

interface MiniTreeProps {
  trails: TrailWithCounts[]
  currentTrailId?: string
  onTrailSelect?: (trailId: string) => void
}

export function MiniTree({ trails, currentTrailId, onTrailSelect }: MiniTreeProps) {
  if (trails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
        <p>No trails yet</p>
      </div>
    )
  }

  // Find root trails (base camps or trails without parents)
  const rootTrails = trails.filter((t) => t.is_base_camp || !t.parent_trail_id)

  const renderTrail = (trail: TrailWithCounts, depth: number = 0): React.ReactNode => {
    const children = trails.filter((t) => t.parent_trail_id === trail.id)
    const isActive = trail.id === currentTrailId
    const hasChildren = children.length > 0

    // Use predefined padding classes for depths 0-5
    const paddingClass = [
      "pl-2",
      "pl-5",
      "pl-8",
      "pl-11",
      "pl-14",
      "pl-16",
    ][Math.min(depth, 5)]

    return (
      <div key={trail.id}>
        <button
          onClick={() => onTrailSelect?.(trail.id)}
          className={cn(
            "w-full text-left pr-2 py-1.5 rounded text-xs transition-colors flex items-center gap-1",
            "hover:bg-accent",
            isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
            paddingClass
          )}
        >
          {hasChildren && (
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          )}
          {!hasChildren && <span className="w-3" />}

          <span className="truncate flex-1">{trail.title}</span>

          <span className="flex items-center gap-1 flex-shrink-0">
            {trail.is_flagged && (
              <Flag className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
            )}
            <span className="flex items-center gap-0.5 text-[10px] opacity-70">
              <MessageSquare className="h-2.5 w-2.5" />
              {trail.message_count || 0}
            </span>
          </span>
        </button>

        {children.length > 0 && (
          <div className="border-l border-border ml-3">
            {children.map((child) => renderTrail(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-2 space-y-0.5">
      {rootTrails.map((trail) => renderTrail(trail))}
    </div>
  )
}
