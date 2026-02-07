"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      if (isStandalone) {
        setIsInstalled(true)
        return
      }
    }

    // Check if already dismissed
    const wasDismissed = localStorage.getItem("pwa-prompt-dismissed")
    const dismissedTime = wasDismissed ? parseInt(wasDismissed, 10) : 0
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

    // Show prompt again after a week
    if (dismissedTime > oneWeekAgo) {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Delay showing prompt for better UX
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Check if app was installed
    const installedHandler = () => {
      setIsInstalled(true)
      setShowPrompt(false)
    }
    window.addEventListener("appinstalled", installedHandler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString())
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div
      className={cn(
        "fixed z-50 md:hidden",
        "bottom-24 left-4 right-4",
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
        "rounded-2xl shadow-xl p-4",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl shrink-0">
          <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Install ExpeditionAI
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Get quick access from your home screen
          </p>
          <Button
            size="sm"
            className="mt-3 w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold"
            onClick={handleInstall}
          >
            Install App
          </Button>
        </div>
      </div>
    </div>
  )
}
