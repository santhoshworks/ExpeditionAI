"use client"

import { lazy, Suspense } from "react"
import { TrailWithCounts } from "@/types/database"

// Lazy load the heavy ReactFlow component
const ExpeditionMapComponent = lazy(() =>
    import("./expedition-map").then(module => ({ default: module.ExpeditionMap }))
)

interface LazyExpeditionMapProps {
    trails: TrailWithCounts[]
    currentTrailId?: string
    onTrailSelect?: (trailId: string) => void
    mini?: boolean
}

function MapLoadingFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-background">
            <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div className="text-muted-foreground">
                    <p className="text-sm font-medium">Loading map...</p>
                    <p className="text-xs">Preparing your exploration journey</p>
                </div>
            </div>
        </div>
    )
}

export function LazyExpeditionMap(props: LazyExpeditionMapProps) {
    return (
        <Suspense fallback={<MapLoadingFallback />}>
            <ExpeditionMapComponent {...props} />
        </Suspense>
    )
}