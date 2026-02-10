"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X, Share, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as any).standalone === true)
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }

    // Already installed as PWA
    if (isInStandaloneMode()) {
      setIsInstalled(true)
      return
    }

    // Check if dismissed recently
    const wasDismissed = localStorage.getItem("pwa-prompt-dismissed")
    const dismissedTime = wasDismissed ? parseInt(wasDismissed, 10) : 0
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (dismissedTime > oneWeekAgo) return

    // iOS: show custom instructions (no beforeinstallprompt support)
    if (isIOS()) {
      setTimeout(() => setShowIOSPrompt(true), 3000)
      return
    }

    // Android/Desktop Chrome: use beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

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
    setShowIOSPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString())
  }

  if (isInstalled) return null

  // iOS install instructions
  if (showIOSPrompt) {
    return (
      <div
        className={cn(
          "fixed z-50",
          "bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80",
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
          "rounded-2xl shadow-xl p-4",
          "animate-in slide-in-from-bottom-4 fade-in duration-300"
        )}
      >
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
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
              Install ThoughtMap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add to your home screen for the best experience:
            </p>
            <ol className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">1.</span>
                Tap the
                <Share className="h-3.5 w-3.5 inline text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">Share</span> button
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">2.</span>
                Scroll and tap
                <Plus className="h-3.5 w-3.5 inline text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">Add to Home Screen</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  // Android/Desktop install prompt
  if (!showPrompt) return null

  return (
    <div
      className={cn(
        "fixed z-50",
        "bottom-24 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80",
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
        "rounded-2xl shadow-xl p-4",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
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
            Install ThoughtMap
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
