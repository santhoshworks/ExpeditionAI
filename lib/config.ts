import type { UserTier } from './constants'

export const SITE_CONFIG = {
    name: "ThoughtMap",
    description: "A space for structured thinking.",
    url: "https://thoughtmap.space",
} as const;

// Default tier configuration for new users
export const DEFAULT_TIER_CONFIG = {
    // Default tier for new signups - can be overridden by environment variable
    defaultTier: (process.env.DEFAULT_USER_TIER as UserTier) || 'pro', // Changed from 'pro' to ensure pro tier

    // Credits to give new users based on their default tier
    getDefaultCredits: (tier: UserTier): number => {
        switch (tier) {
            case 'free':
                return 0
            case 'basic':
                return 200 // Increased for better experience
            case 'pro':
                return 700 // Increased: 600 + 100 bonus credits
            default:
                return 0
        }
    },

    // Whether to enable configurable default tier (for admin control)
    enableAdminConfig: process.env.ENABLE_ADMIN_TIER_CONFIG === 'true',
} as const;
