"use client"

import { TrailWithCounts } from "@/types/database"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Flag, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"

interface TrailListProps {
  trails: TrailWithCounts[]
  currentTrailId?: string
  onTrailSelect: (trailId: string) => void
  expeditionId: string
}

export function TrailList({
  trails,
  currentTrailId,
  onTrailSelect,
  expeditionId,
}: TrailListProps) {
  // Build tree structure
  const trailMap = new Map(trails.map((t) => [t.id, t]))
  const rootTrails = trails.filter((t) => !t.parent_trail_id)

  const renderTrail = (trail: TrailWithCounts, level: number = 0) => {
    const children = trails.filter((t) => t.parent_trail_id === trail.id)
    const isActive = trail.id === currentTrailId

    return (
      <div key={trail.id}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start text-left h-auto py-2 px-3 mb-1",
            level > 0 && "ml-4"
          )}
          onClick={() => onTrailSelect(trail.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {trail.is_flagged && (
                <Flag className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              )}
              <span className="font-medium truncate">{trail.title}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {trail.message_count || 0}
              </span>
              {trail.last_message_at && (
                <span>{formatDate(trail.last_message_at)}</span>
              )}
            </div>
          </div>
        </Button>
        {children.map((child) => renderTrail(child, level + 1))}
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-1">
        {rootTrails.map((trail) => renderTrail(trail))}
      </div>
      {trails.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <p>No trails yet. Start a conversation to create your first trail!</p>
        </div>
      )}
    </ScrollArea>
  )
}
