"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div
      className={cn(
        "fixed z-50",
        "bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto",
        "bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800",
        "text-amber-800 dark:text-amber-200",
        "px-4 py-2.5 rounded-xl shadow-lg",
        "flex items-center gap-2",
        "animate-in slide-in-from-bottom-2 fade-in duration-200"
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">
        You&apos;re offline. Some features may be limited.
      </span>
    </div>
  )
}
