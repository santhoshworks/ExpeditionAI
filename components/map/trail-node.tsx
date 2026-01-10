"use client"

import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import { TrailWithCounts } from "@/types/database"
import { cn } from "@/lib/utils"
import { MessageSquare } from "lucide-react"
import { FlagButton } from "@/components/trail/flag-button"

interface TrailNodeData {
  trail: TrailWithCounts
  isActive: boolean
  isFlagged: boolean
  messageCount: number
  onClick?: () => void
  isMobile?: boolean
}

interface TrailNodeProps {
  data: TrailNodeData
}

export const TrailNode = memo(({ data }: TrailNodeProps) => {
  const { trail, isActive, isFlagged, messageCount, onClick, isMobile = false } = data

  // Format last activity time
  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const lastActivity = formatLastActivity(trail.last_message_at)

  return (
    <div
      className={cn(
        "px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 shadow-lg cursor-pointer transition-all",
        "hover:shadow-xl hover:scale-105 active:scale-95",
        // Mobile-optimized sizing
        isMobile ? "min-w-[180px] max-w-[240px]" : "min-w-[220px] max-w-[280px]",
        // Touch-friendly minimum height
        isMobile && "min-h-[60px]",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-primary/20"
          : "bg-card text-card-foreground border-border hover:border-primary/50"
      )}
      onClick={onClick}
      // Better touch interaction
      style={{
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <Handle type="target" position={Position.Top} />

      <div className="space-y-1.5 md:space-y-2">
        {/* Title and Flag */}
        <div className="flex items-start justify-between gap-1 -mr-1 md:-mr-2 -mt-0.5 md:-mt-1">
          <h3 className={cn(
            "font-semibold leading-tight flex-1 line-clamp-2 mt-0.5 md:mt-1 px-0.5",
            isMobile ? "text-xs" : "text-sm"
          )}>
            {trail.title}
          </h3>
          <FlagButton
            trailId={trail.id}
            isFlagged={trail.is_flagged}
            size="sm"
            className={cn(
              "flex-shrink-0",
              isMobile && "scale-110", // Larger touch target on mobile
              isActive ? "text-primary-foreground hover:text-primary-foreground/80" : "text-muted-foreground"
            )}
          />
        </div>

        {/* Source text preview if available */}
        {trail.source_text && (
          <p className={cn(
            "opacity-70 line-clamp-2 italic",
            isMobile ? "text-[10px]" : "text-xs"
          )}>
            &quot;{trail.source_text}&quot;
          </p>
        )}

        {/* Stats */}
        <div className={cn(
          "flex items-center justify-between gap-2 md:gap-3 pt-1 border-t border-current/10",
          isMobile ? "text-[10px]" : "text-xs"
        )}>
          <div className="flex items-center gap-1 md:gap-1.5 opacity-75">
            <MessageSquare className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
            <span>{messageCount} {messageCount === 1 ? 'msg' : 'msgs'}</span>
          </div>
          {lastActivity && (
            <span className={cn(
              "opacity-60",
              isMobile ? "text-[9px]" : "text-xs"
            )}>
              {lastActivity}
            </span>
          )}
        </div>

        {/* Base Camp Badge */}
        {trail.is_base_camp && (
          <div className="pt-1 mt-1 border-t border-current/10">
            <div className={cn(
              "font-medium opacity-75 flex items-center gap-1",
              isMobile ? "text-[10px]" : "text-xs"
            )}>
              🏕️ <span>Base Camp</span>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})

TrailNode.displayName = "TrailNode"
