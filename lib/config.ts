import type { UserTier } from './constants'

export const SITE_CONFIG = {
    name: "ThoughtMap",
    description: "A space for structured thinking.",
    url: "https://thoughtmap.space",
} as const;

// Default tier configuration for new users
export const DEFAULT_TIER_CONFIG = {
    // Default tier for new signups - can be overridden by environment variable
    defaultTier: (process.env.DEFAULT_USER_TIER as UserTier) || 'pro',

    // Credits to give new users based on their default tier
    getDefaultCredits: (tier: UserTier): number => {
        switch (tier) {
            case 'free':
                return 0
            case 'basic':
                return 50 // Give some starter credits for basic tier
            case 'pro':
                return 150 // Give generous starter credits for pro tier
            default:
                return 0
        }
    },

    // Whether to enable configurable default tier (for admin control)
    enableAdminConfig: process.env.ENABLE_ADMIN_TIER_CONFIG === 'true',
} as const;
