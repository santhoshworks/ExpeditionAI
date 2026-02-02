import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upgradeTier } from '@/lib/credits'
import { headers } from 'next/headers'
import type { UserTier } from '@/lib/constants'

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const signature = headersList.get('dodo-signature') || headersList.get('x-dodo-signature')

        // Verify webhook signature
        if (!signature || !DODO_WEBHOOK_SECRET) {
            console.error('Missing webhook signature or secret')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify the signature
        const isValidSignature = await verifyDodoSignature(body, signature, DODO_WEBHOOK_SECRET)

        if (!isValidSignature) {
            console.error('Invalid webhook signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        const event = JSON.parse(body)
        console.log('Received Dodo webhook:', event.type)

        // Handle different webhook events
        switch (event.type) {
            // Subscription lifecycle events
            case 'subscription.created':
                await handleSubscriptionCreated(event.data)
                break

            case 'subscription.active':
            case 'subscription.renewed':
                await handleSubscriptionActive(event.data)
                break

            case 'subscription.on_hold':
                await handleSubscriptionOnHold(event.data)
                break

            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event.data)
                break

            case 'subscription.expired':
                await handleSubscriptionExpired(event.data)
                break

            // Payment events
            case 'payment.succeeded':
                await handlePaymentSuccess(event.data)
                break

            case 'payment.failed':
                await handlePaymentFailed(event.data)
                break

            // Checkout events (for initial subscription)
            case 'checkout.completed':
                await handleCheckoutCompleted(event.data)
                break

            default:
                console.log(`Unhandled webhook event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })

    } catch (error) {
        console.error('Webhook processing error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}

async function handleSubscriptionCreated(data: any) {
    try {
        const { subscription, customer } = data
        const userId = customer?.external_id || subscription?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in subscription.created webhook')
            return
        }

        const supabase = await createClient()

        // Create/update subscription record
        await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        // Upgrade user to Pro if subscription is active
        if (subscription.status === 'active') {
            await upgradeTier(userId, 'pro')
        }

        console.log(`Subscription created for user ${userId}: ${subscription.id}`)
    } catch (error) {
        console.error('Error handling subscription.created:', error)
    }
}

async function handleSubscriptionActive(data: any) {
    try {
        const { subscription, customer } = data
        const userId = customer?.external_id || subscription?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in subscription.active webhook')
            return
        }

        const supabase = await createClient()

        // Update subscription record
        await supabase.from('user_subscriptions')
            .update({
                status: 'active',
                current_period_start: subscription.current_period_start,
                current_period_end: subscription.current_period_end,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

        // Ensure user is on Pro tier
        await upgradeTier(userId, 'pro')

        console.log(`Subscription renewed/active for user ${userId}`)
    } catch (error) {
        console.error('Error handling subscription.active:', error)
    }
}

async function handleSubscriptionOnHold(data: any) {
    try {
        const { subscription, customer } = data
        const userId = customer?.external_id || subscription?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in subscription.on_hold webhook')
            return
        }

        const supabase = await createClient()

        // Update subscription status to on_hold
        await supabase.from('user_subscriptions')
            .update({
                status: 'on_hold',
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

        // Keep user on Pro for a grace period (don't downgrade immediately)
        console.log(`Subscription on hold for user ${userId} - payment failed`)
    } catch (error) {
        console.error('Error handling subscription.on_hold:', error)
    }
}

async function handleSubscriptionCancelled(data: any) {
    try {
        const { subscription, customer } = data
        const userId = customer?.external_id || subscription?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in subscription.cancelled webhook')
            return
        }

        const supabase = await createClient()

        // Update subscription status
        await supabase.from('user_subscriptions')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

        // Downgrade user to free tier
        await upgradeTier(userId, 'free')

        console.log(`Subscription cancelled for user ${userId}`)
    } catch (error) {
        console.error('Error handling subscription.cancelled:', error)
    }
}

async function handleSubscriptionExpired(data: any) {
    try {
        const { subscription, customer } = data
        const userId = customer?.external_id || subscription?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in subscription.expired webhook')
            return
        }

        const supabase = await createClient()

        // Update subscription status
        await supabase.from('user_subscriptions')
            .update({
                status: 'expired',
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)

        // Downgrade user to free tier
        await upgradeTier(userId, 'free')

        console.log(`Subscription expired for user ${userId}`)
    } catch (error) {
        console.error('Error handling subscription.expired:', error)
    }
}

async function handleCheckoutCompleted(data: any) {
    try {
        const { checkout_session, customer, subscription } = data
        const userId = customer?.external_id || checkout_session?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in checkout.completed webhook')
            return
        }

        const supabase = await createClient()

        // Store payment event
        await supabase.from('payment_events').insert({
            event_type: 'checkout.completed',
            session_id: checkout_session?.id,
            user_id: userId,
            amount: checkout_session?.amount_total / 100,
            status: 'completed',
            tier: 'pro',
            metadata: data,
            processed_at: new Date().toISOString()
        })

        // If there's a subscription, it will be handled by subscription.created
        // If it's a one-time payment (fallback), upgrade tier directly
        if (!subscription) {
            await upgradeTier(userId, 'pro')
        }

        console.log(`Checkout completed for user ${userId}`)
    } catch (error) {
        console.error('Error handling checkout.completed:', error)
    }
}

async function handlePaymentSuccess(data: any) {
    try {
        const { payment, customer, subscription } = data
        const userId = customer?.external_id || payment?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in payment.succeeded webhook')
            return
        }

        const supabase = await createClient()

        // Store payment event
        await supabase.from('payment_events').insert({
            event_type: 'payment.succeeded',
            session_id: payment?.id,
            user_id: userId,
            amount: payment?.amount / 100,
            status: 'completed',
            payment_method: payment?.payment_method || 'card',
            tier: 'pro',
            metadata: data,
            processed_at: new Date().toISOString()
        })

        console.log(`Payment succeeded for user ${userId}`)
    } catch (error) {
        console.error('Error handling payment.succeeded:', error)
    }
}

async function handlePaymentFailed(data: any) {
    try {
        const { payment, customer, failure_reason } = data
        const userId = customer?.external_id || payment?.metadata?.user_id

        if (!userId) {
            console.error('Missing user_id in payment.failed webhook')
            return
        }

        const supabase = await createClient()

        // Store failed payment event
        await supabase.from('payment_events').insert({
            event_type: 'payment.failed',
            session_id: payment?.id,
            user_id: userId,
            amount: payment?.amount / 100,
            status: 'failed',
            tier: 'pro',
            failure_reason: failure_reason || 'Payment processing failed',
            metadata: data,
            processed_at: new Date().toISOString()
        })

        console.log(`Payment failed for user ${userId}`)
    } catch (error) {
        console.error('Error handling payment.failed:', error)
    }
}

async function verifyDodoSignature(
    payload: string,
    signature: string,
    secret: string
): Promise<boolean> {
    try {
        const crypto = require('crypto')
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex')

        // Dodo may use different signature formats
        return signature === expectedSignature ||
               signature === `sha256=${expectedSignature}` ||
               signature === `v1=${expectedSignature}`
    } catch (error) {
        console.error('Signature verification error:', error)
        return false
    }
}