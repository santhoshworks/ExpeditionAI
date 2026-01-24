import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email address is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get current user if authenticated
        const { data: { user } } = await supabase.auth.getUser()

        // Check if email already exists
        const { data: existingSubscription } = await supabase
            .from('email_subscriptions')
            .select('id, is_active')
            .eq('email', email.toLowerCase())
            .single()

        if (existingSubscription) {
            if (existingSubscription.is_active) {
                return NextResponse.json(
                    { error: 'Email is already subscribed' },
                    { status: 409 }
                )
            } else {
                // Reactivate subscription
                const { error } = await supabase
                    .from('email_subscriptions')
                    .update({
                        is_active: true,
                        user_id: user?.id || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingSubscription.id)

                if (error) {
                    console.error('Error reactivating subscription:', error)
                    return NextResponse.json(
                        { error: 'Failed to subscribe' },
                        { status: 500 }
                    )
                }

                return NextResponse.json({
                    success: true,
                    message: 'Successfully reactivated subscription!'
                })
            }
        }

        // Create new subscription
        const { error } = await supabase
            .from('email_subscriptions')
            .insert({
                email: email.toLowerCase(),
                user_id: user?.id || null,
                source: 'landing_page'
            })

        if (error) {
            console.error('Error creating subscription:', error)
            return NextResponse.json(
                { error: 'Failed to subscribe' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed!'
        })

    } catch (error) {
        console.error('Subscription error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('email_subscriptions')
            .update({ is_active: false })
            .eq('email', email.toLowerCase())

        if (error) {
            console.error('Error unsubscribing:', error)
            return NextResponse.json(
                { error: 'Failed to unsubscribe' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed!'
        })

    } catch (error) {
        console.error('Unsubscribe error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}