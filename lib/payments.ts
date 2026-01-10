import { TIER_CONFIGS } from './constants'

export interface CheckoutSession {
    checkout_url: string
    session_id: string
}

export interface PaymentMetadata {
    tier: string
    user_id: string
    credits: number
    bonus_credits: number
}

/**
 * Create a checkout session for a specific tier
 */
export async function createCheckoutSession(tier: 'basic' | 'pro'): Promise<CheckoutSession> {
    const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
    }

    return response.json()
}

/**
 * Get tier configuration for display
 */
export function getTierInfo(tier: 'basic' | 'pro') {
    const config = TIER_CONFIGS[tier]
    return {
        ...config,
        totalCredits: config.credits + config.bonusCredits,
        displayPrice: `$${config.price}`,
    }
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
    if (credits >= 1000) {
        return `${(credits / 1000).toFixed(1)}k`
    }
    return credits.toString()
}

/**
 * Calculate estimated trails for a tier
 */
export function getEstimatedTrails(tier: 'basic' | 'pro'): Record<string, number> {
    const config = TIER_CONFIGS[tier]
    const totalCredits = config.credits + config.bonusCredits

    if (tier === 'basic') {
        return {
            'Gemini Flash 8B': Math.floor(totalCredits / 0.25),
            'Gemini 2.0 Flash': Math.floor(totalCredits / 0.5),
            'GPT-4o Mini': Math.floor(totalCredits / 1),
        }
    } else {
        return {
            'Claude Haiku': Math.floor(totalCredits / 2),
            'Gemini Pro': Math.floor(totalCredits / 3),
            'GPT-4o': Math.floor(totalCredits / 5),
        }
    }
}