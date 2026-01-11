"use client"

import { useEffect, useRef } from "react"

/**
 * Hook to preload map components and dependencies
 * Call this on pages where users might navigate to map views
 */
export function useMapPreloader(delay: number = 2000) {
    const preloadedRef = useRef(false)

    useEffect(() => {
        if (preloadedRef.current) return

        const timer = setTimeout(async () => {
            try {
                // Preload in order of importance
                await Promise.all([
                    // Core map component
                    import("@/components/map/lazy-expedition-map"),
                    // ReactFlow library (heaviest dependency)
                    import("@xyflow/react"),
                ])

                // Then preload the actual map component
                await import("@/components/map/expedition-map")

                preloadedRef.current = true
                console.log("Map components preloaded successfully")
            } catch (error) {
                console.warn("Failed to preload map components:", error)
            }
        }, delay)

        return () => clearTimeout(timer)
    }, [delay])

    return preloadedRef.current
}

/**
 * Preload map components immediately (for hover states, etc.)
 */
export function preloadMapComponents() {
    return Promise.all([
        import("@/components/map/lazy-expedition-map"),
        import("@xyflow/react"),
        import("@/components/map/expedition-map"),
    ])
}