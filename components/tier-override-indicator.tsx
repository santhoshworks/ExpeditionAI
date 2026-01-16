"use client"

import { useEffect, useState } from 'react'
import { getTierOverride, clearTierOverride } from '@/lib/tier-override'
import { X } from 'lucide-react'

/**
 * Shows a visual indicator when tier override is active
 * Only visible in development or when override is active
 */
export function TierOverrideIndicator() {
    const [override, setOverride] = useState<ReturnType<typeof getTierOverride>>(null)

    useEffect(() => {
        // Check for override on mount and when URL changes
        const checkOverride = () => {
            setOverride(getTierOverride())
        }

        checkOverride()

        // Listen for storage changes (when override is set in another tab)
        window.addEventListener('storage', checkOverride)

        // Listen for URL changes
        window.addEventListener('popstate', checkOverride)

        return () => {
            window.removeEventListener('storage', checkOverride)
            window.removeEventListener('popstate', checkOverride)
        }
    }, [])

    if (!override) return null

    const handleClear = () => {
        clearTierOverride()
        window.location.reload()
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-yellow-500/90 text-yellow-950 px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium">
            <span className="text-lg">🧪</span>
            <div>
                <div className="font-bold">TEST MODE</div>
                <div className="text-xs">
                    Tier: {override.tier} • Credits: {override.credits}
                </div>
            </div>
            <button
                onClick={handleClear}
                className="ml-2 hover:bg-yellow-600/20 rounded p-1 transition-colors"
                title="Clear tier override"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    )
}
