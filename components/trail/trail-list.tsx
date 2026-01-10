"use client"

import { TrailWithCounts } from "@/types/database"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare } from "lucide-react"
import { FlagButton } from "@/components/trail/flag-button"
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
  const rootTrails = trails.filter((t) => !t.parent_trail_id)

  const renderTrail = (trail: TrailWithCounts, level: number = 0) => {
    const children = trails.filter((t) => t.parent_trail_id === trail.id)
    const isActive = trail.id === currentTrailId

    return (
      <div key={trail.id}>
        <div className="group relative flex items-center mb-1">
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "flex-1 justify-start text-left h-auto py-2 px-3",
              level > 0 && "ml-4"
            )}
            onClick={() => onTrailSelect(trail.id)}
          >
            <div className="flex-1 min-w-0">
              <span className="font-medium truncate block">{trail.title}</span>
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
          <div className={cn(
            "absolute right-2 transition-opacity duration-200",
            trail.is_flagged ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <FlagButton
              trailId={trail.id}
              isFlagged={trail.is_flagged}
              size="xs"
            />
          </div>
        </div>
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
