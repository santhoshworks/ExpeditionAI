import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upgradeTier } from '@/lib/credits'
import { headers } from 'next/headers'

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const headersList = await headers()
        const signature = headersList.get('dodo-signature')

        // Verify webhook signature
        if (!signature || !DODO_WEBHOOK_SECRET) {
            console.error('Missing webhook signature or secret')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify the signature (implement based on Dodo's signature verification)
        const isValidSignature = await verifyDodoSignature(body, signature, DODO_WEBHOOK_SECRET)

        if (!isValidSignature) {
            console.error('Invalid webhook signature')
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            )
        }

        const event = JSON.parse(body)

        // Handle different webhook events
        switch (event.type) {
            case 'checkout.session.completed':
                await handlePaymentSuccess(event.data)
                break

            case 'checkout.session.failed':
                await handlePaymentFailed(event.data)
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

async function handlePaymentSuccess(sessionData: any) {
    try {
        const { metadata, amount, payment_method, session_id } = sessionData
        const { user_id, tier, credits, bonus_credits } = metadata

        if (!user_id || !tier) {
            console.error('Missing required metadata in payment success webhook')
            return
        }

        const totalCredits = parseInt(credits) + parseInt(bonus_credits || 0)

        // Store payment event
        const supabase = await createClient()
        await supabase.from('payment_events').insert({
            event_type: 'checkout.session.completed',
            session_id: session_id,
            user_id: user_id,
            amount: amount / 100, // Convert cents to dollars
            status: 'completed',
            payment_method: payment_method || 'card',
            tier: tier,
            credits: parseInt(credits),
            bonus_credits: parseInt(bonus_credits || 0),
            metadata: sessionData,
            processed_at: new Date().toISOString()
        })

        // Upgrade user tier and add credits
        const result = await upgradeTier(user_id, tier, totalCredits)

        if (!result.success) {
            console.error('Failed to upgrade user tier:', result.error)
            // Update payment event with error
            await supabase.from('payment_events')
                .update({
                    failure_reason: result.error,
                    status: 'processing_failed'
                })
                .eq('session_id', session_id)
            return
        }

        console.log(`Successfully processed payment for user ${user_id} - ${tier} tier with ${totalCredits} credits`)

        // Update daily analytics
        await supabase.rpc('update_payment_analytics')

    } catch (error) {
        console.error('Error handling payment success:', error)
    }
}

async function handlePaymentFailed(sessionData: any) {
    try {
        const { metadata, amount, failure_reason, session_id } = sessionData
        const { user_id, tier } = metadata

        console.log(`Payment failed for user ${user_id} - ${tier} tier`)

        // Store failed payment event
        const supabase = await createClient()
        await supabase.from('payment_events').insert({
            event_type: 'checkout.session.failed',
            session_id: session_id,
            user_id: user_id,
            amount: amount / 100, // Convert cents to dollars
            status: 'failed',
            tier: tier,
            credits: parseInt(metadata.credits || 0),
            bonus_credits: parseInt(metadata.bonus_credits || 0),
            failure_reason: failure_reason || 'Payment processing failed',
            metadata: sessionData,
            processed_at: new Date().toISOString()
        })

        // Update daily analytics
        await supabase.rpc('update_payment_analytics')

    } catch (error) {
        console.error('Error handling payment failure:', error)
    }
}

async function verifyDodoSignature(
    payload: string,
    signature: string,
    secret: string
): Promise<boolean> {
    try {
        // Implement Dodo's signature verification algorithm
        // This is a placeholder - replace with actual Dodo signature verification
        const crypto = require('crypto')
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex')

        return signature === `sha256=${expectedSignature}`
    } catch (error) {
        console.error('Signature verification error:', error)
        return false
    }
}