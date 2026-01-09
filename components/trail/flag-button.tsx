"use client"

import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { useToggleFlag } from "@/lib/queries"
import { cn } from "@/lib/utils"

interface FlagButtonProps {
  trailId: string
  isFlagged: boolean
}

export function FlagButton({ trailId, isFlagged }: FlagButtonProps) {
  const toggleFlag = useToggleFlag()

  const handleToggle = async () => {
    try {
      await toggleFlag.mutateAsync({
        trailId,
        isFlagged: !isFlagged,
      })
    } catch (error) {
      console.error("Failed to toggle flag:", error)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={toggleFlag.isPending}
      className={cn(isFlagged && "text-yellow-500")}
      title={isFlagged ? "Unflag this trail" : "Flag for later"}
    >
      <Flag className={cn("h-4 w-4", isFlagged && "fill-current")} />
    </Button>
  )
}
