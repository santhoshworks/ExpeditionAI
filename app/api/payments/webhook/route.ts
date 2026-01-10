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
        const { metadata } = sessionData
        const { user_id, tier, credits, bonus_credits } = metadata

        if (!user_id || !tier) {
            console.error('Missing required metadata in payment success webhook')
            return
        }

        const totalCredits = parseInt(credits) + parseInt(bonus_credits || 0)

        // Upgrade user tier and add credits
        const result = await upgradeTier(user_id, tier, totalCredits)

        if (!result.success) {
            console.error('Failed to upgrade user tier:', result.error)
            // You might want to implement retry logic or manual intervention here
            return
        }

        console.log(`Successfully upgraded user ${user_id} to ${tier} tier with ${totalCredits} credits`)

        // Optional: Send confirmation email or notification
        // await sendPaymentConfirmationEmail(user_id, tier, totalCredits)

    } catch (error) {
        console.error('Error handling payment success:', error)
    }
}

async function handlePaymentFailed(sessionData: any) {
    try {
        const { metadata } = sessionData
        const { user_id, tier } = metadata

        console.log(`Payment failed for user ${user_id}, tier ${tier}`)

        // Optional: Send payment failure notification
        // await sendPaymentFailureEmail(user_id, tier)

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