import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DODO_API_URL = process.env.DODO_API_URL || 'https://api.dodopayments.com'
const DODO_SECRET_KEY = process.env.DODO_SECRET_KEY

type SubscriptionAction = 'cancel' | 'resume'

// GET: Fetch user's subscription status
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Get subscription from our database
        const { data: subscriptionData, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // PGRST116 = no rows found, which is fine (user has no subscription)
        const subscription = error?.code === 'PGRST116' ? null : subscriptionData

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching subscription:', error)
            return NextResponse.json(
                { error: 'Failed to fetch subscription' },
                { status: 500 }
            )
        }

        // Get user tier
        const { data: userCredits } = await supabase
            .from('user_credits')
            .select('tier')
            .eq('user_id', user.id)
            .single()

        const hasActiveSubscription = (subscription as any)?.status === 'active'

        // If subscription is active, tier should be 'pro'
        // This handles cases where the webhook failed to update user_credits
        let tier = (userCredits as any)?.tier || 'free'
        if (hasActiveSubscription && tier !== 'pro') {
            tier = 'pro'
            // Fix the inconsistency in the database
            await supabase
                .from('user_credits')
                .upsert({
                    user_id: user.id,
                    tier: 'pro',
                    credits: 0,
                    trails_today: 0,
                    last_trail_date: null,
                } as any, { onConflict: 'user_id' })
        }

        return NextResponse.json({
            subscription: subscription || null,
            tier,
            hasActiveSubscription,
        })

    } catch (error) {
        console.error('Subscription fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH: Cancel or resume subscription
export async function PATCH(request: NextRequest) {
    try {
        const { action } = await request.json() as { action: SubscriptionAction }

        if (!action || !['cancel', 'resume'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Use "cancel" or "resume".' },
                { status: 400 }
            )
        }

        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        // Get current subscription
        const { data: subscription, error: subError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (subError || !subscription) {
            return NextResponse.json(
                { error: 'No subscription found' },
                { status: 404 }
            )
        }

        // Validate action based on current status
        if (action === 'cancel' && subscription.status !== 'active') {
            return NextResponse.json(
                { error: 'Can only cancel active subscriptions' },
                { status: 400 }
            )
        }

        if (action === 'resume' && subscription.status !== 'cancelled') {
            return NextResponse.json(
                { error: 'Can only resume cancelled subscriptions' },
                { status: 400 }
            )
        }

        // Call Dodo API to update subscription
        const dodoEndpoint = action === 'cancel'
            ? `${DODO_API_URL}/subscriptions/${subscription.dodo_subscription_id}/cancel`
            : `${DODO_API_URL}/subscriptions/${subscription.dodo_subscription_id}/resume`

        const response = await fetch(dodoEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DODO_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Dodo API error:', errorData)
            return NextResponse.json(
                { error: `Failed to ${action} subscription` },
                { status: 500 }
            )
        }

        // Update local subscription status
        const newStatus = action === 'cancel' ? 'cancelled' : 'active'
        const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString(),
                ...(action === 'cancel' ? { cancelled_at: new Date().toISOString() } : {}),
            })
            .eq('user_id', user.id)

        if (updateError) {
            console.error('Error updating subscription:', updateError)
        }

        // If cancelling, downgrade tier immediately or at period end based on your preference
        // Here we keep pro access until period ends (Dodo handles this)
        // The webhook will downgrade when subscription actually expires

        return NextResponse.json({
            success: true,
            action,
            message: action === 'cancel'
                ? 'Subscription cancelled. You will retain access until the end of your billing period.'
                : 'Subscription resumed successfully.',
        })

    } catch (error) {
        console.error('Subscription update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
