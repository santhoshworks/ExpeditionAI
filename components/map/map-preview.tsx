"use client"

import { TrailWithCounts } from "@/types/database"
import { cn } from "@/lib/utils"

interface MapPreviewProps {
    trails: TrailWithCounts[]
    className?: string
}

/**
 * Lightweight map preview that shows before the full ReactFlow map loads
 * This gives users immediate visual feedback while the heavy components load
 */
export function MapPreview({ trails, className }: MapPreviewProps) {
    if (trails.length === 0) {
        return (
            <div className={cn("w-full h-full flex items-center justify-center bg-muted/20 rounded-lg", className)}>
                <div className="text-center text-muted-foreground">
                    <div className="text-2xl mb-2">🗺️</div>
                    <p className="text-sm">No trails yet</p>
                </div>
            </div>
        )
    }

    // Create a simple visual representation
    const baseCamp = trails.find(t => t.is_base_camp) || trails[0]
    const children = trails.filter(t => t.parent_trail_id === baseCamp.id)

    return (
        <div className={cn("w-full h-full bg-muted/10 rounded-lg p-4 flex items-center justify-center", className)}>
            <div className="relative">
                {/* Base camp */}
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40 mb-4">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                </div>

                {/* Children trails */}
                {children.slice(0, 3).map((trail, index) => (
                    <div
                        key={trail.id}
                        className="absolute w-8 h-8 bg-muted rounded-full border border-border flex items-center justify-center"
                        style={{
                            top: `${60 + index * 20}px`,
                            left: `${-10 + index * 15}px`,
                        }}
                    >
                        <div className="w-2 h-2 bg-muted-foreground/60 rounded-full" />
                    </div>
                ))}

                {trails.length > 4 && (
                    <div className="absolute top-20 right-0 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        +{trails.length - 4} more
                    </div>
                )}
            </div>
        </div>
    )
}