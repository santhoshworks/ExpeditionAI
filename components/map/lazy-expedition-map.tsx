"use client"

import { lazy, Suspense, memo } from "react"
import { TrailWithCounts } from "@/types/database"
import { MapPreview } from "./map-preview"

// Lazy load with better caching - this will be cached after first load
const ExpeditionMapComponent = lazy(() =>
    import("./expedition-map").then(module => ({ default: module.ExpeditionMap }))
)

interface LazyExpeditionMapProps {
    trails: TrailWithCounts[]
    currentTrailId?: string
    onTrailSelect?: (trailId: string) => void
    mini?: boolean
}

const MapLoadingFallback = memo(function MapLoadingFallback({
    trails,
    mini
}: {
    trails: TrailWithCounts[]
    mini?: boolean
}) {
    return (
        <div className="w-full h-full relative">
            {/* Show preview while loading for better UX */}
            <MapPreview trails={trails} className="opacity-50" />

            {/* Loading overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <div className="text-muted-foreground">
                        <p className="text-sm font-medium">Loading interactive map...</p>
                        {!mini && <p className="text-xs">This may take a moment</p>}
                    </div>
                </div>
            </div>
        </div>
    )
})

// Memoize the entire component to prevent unnecessary re-renders
export const LazyExpeditionMap = memo(function LazyExpeditionMap(props: LazyExpeditionMapProps) {
    return (
        <Suspense fallback={<MapLoadingFallback trails={props.trails} mini={props.mini} />}>
            <ExpeditionMapComponent {...props} />
        </Suspense>
    )
})