import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TIER_CONFIGS } from '@/lib/constants'

// Dodo payment configuration
const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodo.dev'
const DODO_SECRET_KEY = process.env.DODO_SECRET_KEY

export async function POST(request: NextRequest) {
    try {
        const { tier } = await request.json()

        if (!tier || !['basic', 'pro'].includes(tier)) {
            return NextResponse.json(
                { error: 'Invalid tier specified' },
                { status: 400 }
            )
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const tierConfig = TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS]

        // Create checkout session with Dodo
        const checkoutData = {
            amount: tierConfig.price * 100, // Convert to cents
            currency: 'USD',
            customer_email: user.email,
            customer_id: user.id,
            product_name: `ExplorerAI ${tierConfig.name} Plan`,
            product_description: `${tierConfig.credits} credits + ${tierConfig.bonusCredits} bonus credits`,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?tier=${tier}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            metadata: {
                tier,
                user_id: user.id,
                credits: tierConfig.credits,
                bonus_credits: tierConfig.bonusCredits,
            },
        }

        const response = await fetch(`${DODO_API_URL}/v1/checkout/sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DODO_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Dodo API error:', errorData)
            return NextResponse.json(
                { error: 'Failed to create checkout session' },
                { status: 500 }
            )
        }

        const session = await response.json()

        return NextResponse.json({
            checkout_url: session.checkout_url,
            session_id: session.id,
        })

    } catch (error) {
        console.error('Checkout creation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}