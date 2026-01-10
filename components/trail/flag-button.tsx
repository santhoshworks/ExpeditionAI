"use client"

import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { useToggleFlag } from "@/lib/queries"
import { cn } from "@/lib/utils"

interface FlagButtonProps {
  trailId: string
  isFlagged: boolean
  size?: "default" | "sm" | "icon" | "xs"
  className?: string
}

export function FlagButton({ trailId, isFlagged, size = "icon", className }: FlagButtonProps) {
  const toggleFlag = useToggleFlag()

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleFlag.mutateAsync({
        trailId,
        isFlagged: !isFlagged,
      })
    } catch (error) {
      console.error("Failed to toggle flag:", error)
    }
  }

  const sizeClasses = {
    default: "h-10 w-10",
    sm: "h-8 w-8",
    icon: "h-9 w-9",
    xs: "h-6 w-6",
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={toggleFlag.isPending}
      className={cn(
        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.icon,
        isFlagged ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground/50 hover:text-foreground",
        className
      )}
      title={isFlagged ? "Unflag this trail" : "Flag for later"}
    >
      <Flag className={cn(
        size === "xs" ? "h-3 w-3" : "h-4 w-4",
        isFlagged && "fill-current"
      )} />
    </Button>
  )
}
