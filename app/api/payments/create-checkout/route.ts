import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { TIER_CONFIGS } from '@/lib/constants'

// Dodo payment configuration
const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodopayments.com'
const DODO_SECRET_KEY = process.env.DODO_SECRET_KEY
// This should be the product ID from your Dodo dashboard for the Pro subscription
const DODO_PRO_PRODUCT_ID = process.env.DODO_PRO_PRODUCT_ID

// Valid ISO 3166-1 alpha-2 country codes
const VALID_COUNTRY_CODES = new Set([
    'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'FI', 'IE',
    'NZ', 'SG', 'JP', 'KR', 'IN', 'BR', 'MX', 'ES', 'IT', 'PT', 'PL', 'CH',
    'AT', 'BE', 'IL', 'AE', 'ZA', 'PH', 'MY', 'TH', 'ID', 'VN', 'CZ', 'RO',
    'HU', 'GR', 'AR', 'CL', 'CO'
])

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    let userId: string | null = null

    try {
        const { tier, billingCountry } = await request.json()

        // Only Pro tier requires payment (Free tier is free)
        if (tier !== 'pro') {
            return NextResponse.json(
                { error: 'Invalid tier specified. Only Pro tier requires payment.' },
                { status: 400 }
            )
        }

        // Validate billing country
        if (!billingCountry || !VALID_COUNTRY_CODES.has(billingCountry)) {
            return NextResponse.json(
                { error: 'Valid billing country is required.' },
                { status: 400 }
            )
        }

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        userId = user.id

        // Get request metadata for audit logging
        const headersList = await headers()
        const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                         headersList.get('x-real-ip') ||
                         'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        // Check if user already has an active subscription
        const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

        if (existingSub) {
            // Log blocked attempt
            await logCheckoutAttempt(supabase, {
                userId: user.id,
                email: user.email || '',
                billingCountry,
                ipAddress,
                userAgent,
                status: 'blocked',
                errorMessage: 'User already has active subscription',
            })

            return NextResponse.json(
                { error: 'You already have an active Pro subscription.' },
                { status: 400 }
            )
        }

        // Get user's name from metadata if available
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''

        // Create checkout session with Dodo for subscription
        // Including billing address for tax calculation (Dodo as MoR handles taxes)
        const checkoutData = {
            customer: {
                email: user.email,
                name: userName,
                external_id: user.id,
            },
            billing_address: {
                country: billingCountry,
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
                billing_country: billingCountry,
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

            // Log failed attempt
            await logCheckoutAttempt(supabase, {
                userId: user.id,
                email: user.email || '',
                billingCountry,
                ipAddress,
                userAgent,
                status: 'failed',
                errorMessage: `Dodo API error: ${JSON.stringify(errorData)}`,
            })

            return NextResponse.json(
                { error: 'Failed to create checkout session' },
                { status: 500 }
            )
        }

        const session = await response.json()

        // Log successful checkout initiation
        await logCheckoutAttempt(supabase, {
            userId: user.id,
            email: user.email || '',
            billingCountry,
            ipAddress,
            userAgent,
            status: 'initiated',
            sessionId: session.id,
            amount: TIER_CONFIGS.pro.price,
        })

        return NextResponse.json({
            checkout_url: session.url,
            session_id: session.id,
        })

    } catch (error) {
        console.error('Checkout creation error:', error)

        // Log error if we have user context
        if (userId) {
            const headersList = await headers()
            await logCheckoutAttempt(supabase, {
                userId,
                email: '',
                billingCountry: 'unknown',
                ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
                userAgent: headersList.get('user-agent') || 'unknown',
                status: 'error',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * Log checkout attempt for auditing purposes
 * Falls back to console.log if table doesn't exist
 */
async function logCheckoutAttempt(
    supabase: Awaited<ReturnType<typeof createClient>>,
    data: {
        userId: string
        email: string
        billingCountry: string
        ipAddress: string
        userAgent: string
        status: 'initiated' | 'blocked' | 'failed' | 'error'
        sessionId?: string
        amount?: number
        errorMessage?: string
    }
) {
    try {
        const { error } = await supabase.from('checkout_audit_logs').insert({
            user_id: data.userId,
            email: data.email,
            billing_country: data.billingCountry,
            ip_address: data.ipAddress,
            user_agent: data.userAgent.substring(0, 500), // Truncate long user agents
            status: data.status,
            session_id: data.sessionId || null,
            amount: data.amount || null,
            error_message: data.errorMessage || null,
            created_at: new Date().toISOString(),
        })

        if (error) {
            // Table might not exist yet, log to console as fallback
            console.log('Checkout audit log:', {
                ...data,
                timestamp: new Date().toISOString(),
            })
        }
    } catch (err) {
        // Fallback to console logging
        console.log('Checkout audit log:', {
            ...data,
            timestamp: new Date().toISOString(),
        })
    }
}