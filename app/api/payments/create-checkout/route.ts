import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TIER_CONFIGS } from '@/lib/constants'

// Dodo payment configuration
const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodopayments.com'
const DODO_SECRET_KEY = process.env.DODO_SECRET_KEY
// This should be the product ID from your Dodo dashboard for the Pro subscription
const DODO_PRO_PRODUCT_ID = process.env.DODO_PRO_PRODUCT_ID

export async function POST(request: NextRequest) {
    try {
        const { tier } = await request.json()

        // Only Pro tier requires payment (Free tier is free)
        if (tier !== 'pro') {
            return NextResponse.json(
                { error: 'Invalid tier specified. Only Pro tier requires payment.' },
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

        // Check if user already has an active subscription
        const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

        if (existingSub) {
            return NextResponse.json(
                { error: 'You already have an active Pro subscription.' },
                { status: 400 }
            )
        }

        // Create checkout session with Dodo for subscription
        // Using Dodo's checkout session API with product_cart for subscriptions
        const checkoutData = {
            customer: {
                email: user.email,
                external_id: user.id,
            },
            product_cart: [
                {
                    product_id: DODO_PRO_PRODUCT_ID,
                    quantity: 1,
                }
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
            metadata: {
                tier: 'pro',
                user_id: user.id,
            },
        }

        const response = await fetch(`${DODO_API_URL}/checkout-sessions`, {
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
            checkout_url: session.url,
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