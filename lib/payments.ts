import { TIER_CONFIGS, type UserTier } from './constants'

export interface CheckoutSession {
    checkout_url: string
    session_id: string
}

export interface PaymentMetadata {
    tier: 'pro'
    user_id: string
    plan_type: 'monthly'
}

/**
 * Create a checkout session for Pro tier subscription
 * Only Pro tier requires payment - Free tier is free
 */
export async function createCheckoutSession(): Promise<CheckoutSession> {
    const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: 'pro' }),
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
export function getTierInfo(tier: UserTier) {
    const config = TIER_CONFIGS[tier]
    return {
        ...config,
        displayPrice: tier === 'free' ? 'Free' : `$${config.price}/mo`,
        originalDisplayPrice: config.originalPrice ? `$${config.originalPrice}/mo` : undefined,
    }
}

/**
 * Get Pro tier pricing info for checkout
 */
export function getProPricingInfo() {
    const config = TIER_CONFIGS.pro
    return {
        price: config.price,
        originalPrice: config.originalPrice,
        displayPrice: `$${config.price}`,
        displayOriginalPrice: config.originalPrice ? `$${config.originalPrice}` : undefined,
        discount: config.originalPrice
            ? Math.round((1 - config.price / config.originalPrice) * 100)
            : 0,
    }
}