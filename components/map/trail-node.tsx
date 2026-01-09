"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { TrailWithCounts } from "@/types/database"
import { cn } from "@/lib/utils"
import { Flag, MessageSquare } from "lucide-react"

interface TrailNodeData {
  trail: TrailWithCounts
  isActive: boolean
  isFlagged: boolean
  messageCount: number
  onClick?: () => void
}

export const TrailNode = memo(({ data }: NodeProps<TrailNodeData>) => {
  const { trail, isActive, isFlagged, messageCount, onClick } = data

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg border-2 shadow-md cursor-pointer transition-all min-w-[200px] max-w-[250px]",
        isActive
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-card-foreground border-border hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <Handle type="target" position={Position.Top} />
      
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-sm truncate flex-1">
          {trail.title}
        </h3>
        {isFlagged && (
          <Flag className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs opacity-75">
        <MessageSquare className="h-3 w-3" />
        <span>{messageCount} messages</span>
      </div>

      {trail.is_base_camp && (
        <div className="mt-2 text-xs font-medium opacity-75">
          🏕️ Base Camp
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

TrailNode.displayName = "TrailNode"
