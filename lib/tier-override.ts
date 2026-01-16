/**
 * Local tier override for testing
 * Allows changing tier via query params or localStorage without touching the database
 * 
 * Usage:
 * 1. Query param: ?tier=pro or ?tier=basic or ?tier=free
 * 2. Console: window.setTestTier('pro')
 * 3. Console: window.clearTestTier()
 */

import type { UserTier } from './constants'
import { TIER_CONFIGS } from './constants'

const TIER_OVERRIDE_KEY = 'test_tier_override'
const TIER_OVERRIDE_HEADER = 'x-test-tier'

export interface TierOverride {
    tier: UserTier
    credits: number
    trailsToday: number
}

/**
 * Get tier override from localStorage or query params
 */
export function getTierOverride(): TierOverride | null {
    // Check if we're in browser
    if (typeof window === 'undefined') return null

    // First check query params (takes precedence)
    const params = new URLSearchParams(window.location.search)
    const tierParam = params.get('tier') as UserTier | null

    if (tierParam && ['free', 'basic', 'pro'].includes(tierParam)) {
        const config = TIER_CONFIGS[tierParam]
        return {
            tier: tierParam,
            credits: config.credits + config.bonusCredits,
            trailsToday: 0,
        }
    }

    // Then check localStorage
    try {
        const stored = localStorage.getItem(TIER_OVERRIDE_KEY)
        if (stored) {
            const override = JSON.parse(stored) as TierOverride
            if (['free', 'basic', 'pro'].includes(override.tier)) {
                return override
            }
        }
    } catch (e) {
        console.error('Failed to parse tier override:', e)
    }

    return null
}

/**
 * Get tier override from request headers (server-side)
 */
export function getTierOverrideFromHeaders(headers: Headers): TierOverride | null {
    const tierHeader = headers.get(TIER_OVERRIDE_HEADER)

    if (tierHeader && ['free', 'basic', 'pro'].includes(tierHeader)) {
        const tier = tierHeader as UserTier
        const config = TIER_CONFIGS[tier]
        return {
            tier,
            credits: config.credits + config.bonusCredits,
            trailsToday: 0,
        }
    }

    return null
}

/**
 * Set tier override in localStorage
 */
export function setTierOverride(tier: UserTier): void {
    if (typeof window === 'undefined') return

    const config = TIER_CONFIGS[tier]
    const override: TierOverride = {
        tier,
        credits: config.credits + config.bonusCredits,
        trailsToday: 0,
    }

    localStorage.setItem(TIER_OVERRIDE_KEY, JSON.stringify(override))

    // Show helpful message
    console.log(`✅ Test tier set to: ${tier}`)
    console.log(`💰 Credits: ${override.credits}`)
    console.log(`🔄 Refresh the page to see changes`)
}

/**
 * Clear tier override
 */
export function clearTierOverride(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(TIER_OVERRIDE_KEY)
    console.log('✅ Test tier override cleared')
    console.log('🔄 Refresh the page to use real tier from database')
}

/**
 * Check if tier override is active
 */
export function hasTierOverride(): boolean {
    return getTierOverride() !== null
}

/**
 * Apply tier override to query data
 */
export function applyTierOverride(data: {
    credits: number
    tier: UserTier
    trails_today: number
}): {
    credits: number
    tier: UserTier
    trails_today: number
} {
    const override = getTierOverride()

    if (!override) return data

    // Show indicator in console
    if (typeof window !== 'undefined' && !window.__tierOverrideLogged) {
        console.log('🧪 TEST MODE: Using tier override')
        console.log(`   Tier: ${override.tier}`)
        console.log(`   Credits: ${override.credits}`)
        console.log('   Clear with: window.clearTestTier()')
        window.__tierOverrideLogged = true
    }

    return {
        credits: override.credits,
        tier: override.tier,
        trails_today: override.trailsToday,
    }
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
    (window as any).setTestTier = setTierOverride;
    (window as any).clearTestTier = clearTierOverride;
    (window as any).getTestTier = getTierOverride;
    (window as any).__tierOverrideLogged = false
}

// Type augmentation for window
declare global {
    interface Window {
        setTestTier: (tier: UserTier) => void
        clearTestTier: () => void
        getTestTier: () => TierOverride | null
        __tierOverrideLogged: boolean
    }
}
