"use client"

import { useExploreStore } from "@/lib/store"

export function CinemaModeOverlay() {
  const { learningMode } = useExploreStore()

  if (!learningMode) return null

  return (
    <>
      {/* Top overlay - covers the top navigation bar */}
      <div
        className="fixed top-0 left-0 right-0 h-16 bg-black/70 z-[100] pointer-events-none transition-opacity duration-300"
        aria-hidden="true"
      />
      {/* Left overlay - covers the sidebar area (below top nav) */}
      <div
        className="fixed top-16 left-0 w-80 bottom-0 bg-black/70 z-[100] pointer-events-none transition-opacity duration-300 hidden md:block"
        aria-hidden="true"
      />
      {/* Sub-header overlay - covers the expedition sub-header (Current Trail bar) */}
      <div
        className="fixed top-16 left-0 md:left-80 right-0 h-[49px] bg-black/70 z-[100] pointer-events-none transition-opacity duration-300"
        aria-hidden="true"
      />
    </>
  )
}
