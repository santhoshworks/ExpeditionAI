import { createClient } from '@/lib/supabase/server'
import { DEFAULT_TIER_CONFIG } from './config'
import type { UserTier } from './constants'

export interface DefaultTierSettings {
    defaultTier: UserTier
    defaultCredits: Record<UserTier, number>
    source: 'database' | 'environment' | 'fallback'
}

/**
 * Get the current default tier configuration
 * Priority: Database (if admin config enabled) > Environment > Fallback
 */
export async function getDefaultTierSettings(): Promise<DefaultTierSettings> {
    // If admin config is disabled, use environment/fallback only
    if (!DEFAULT_TIER_CONFIG.enableAdminConfig) {
        return {
            defaultTier: DEFAULT_TIER_CONFIG.defaultTier,
            defaultCredits: {
                free: DEFAULT_TIER_CONFIG.getDefaultCredits('free'),
                basic: DEFAULT_TIER_CONFIG.getDefaultCredits('basic'),
                pro: DEFAULT_TIER_CONFIG.getDefaultCredits('pro'),
            },
            source: 'environment'
        }
    }

    try {
        const supabase = await createClient()

        // Get configuration from database
        const { data: configs, error } = await supabase
            .from('system_config')
            .select('key, value')
            .in('key', ['default_user_tier', 'default_tier_credits'])

        if (error || !configs || configs.length === 0) {
            console.warn('Failed to fetch default tier from database, using environment fallback:', error)
            return {
                defaultTier: DEFAULT_TIER_CONFIG.defaultTier,
                defaultCredits: {
                    free: DEFAULT_TIER_CONFIG.getDefaultCredits('free'),
                    basic: DEFAULT_TIER_CONFIG.getDefaultCredits('basic'),
                    pro: DEFAULT_TIER_CONFIG.getDefaultCredits('pro'),
                },
                source: 'fallback'
            }
        }

        // Parse database configuration
        const configMap = configs.reduce((acc, config) => {
            acc[config.key] = config.value
            return acc
        }, {} as Record<string, any>)

        const defaultTier = configMap.default_user_tier as UserTier || DEFAULT_TIER_CONFIG.defaultTier
        const defaultCredits = configMap.default_tier_credits || {
            free: DEFAULT_TIER_CONFIG.getDefaultCredits('free'),
            basic: DEFAULT_TIER_CONFIG.getDefaultCredits('basic'),
            pro: DEFAULT_TIER_CONFIG.getDefaultCredits('pro'),
        }

        return {
            defaultTier,
            defaultCredits,
            source: 'database'
        }

    } catch (error) {
        console.error('Error fetching default tier settings:', error)
        return {
            defaultTier: DEFAULT_TIER_CONFIG.defaultTier,
            defaultCredits: {
                free: DEFAULT_TIER_CONFIG.getDefaultCredits('free'),
                basic: DEFAULT_TIER_CONFIG.getDefaultCredits('basic'),
                pro: DEFAULT_TIER_CONFIG.getDefaultCredits('pro'),
            },
            source: 'fallback'
        }
    }
}

/**
 * Get just the default tier (for quick access)
 */
export async function getDefaultTier(): Promise<UserTier> {
    const settings = await getDefaultTierSettings()
    return settings.defaultTier
}

/**
 * Get default credits for a specific tier
 */
export async function getDefaultCreditsForTier(tier: UserTier): Promise<number> {
    const settings = await getDefaultTierSettings()
    return settings.defaultCredits[tier] || 0
}