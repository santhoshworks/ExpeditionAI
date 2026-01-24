import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  try {
    // Check admin access
    await requireAdmin()

    const supabase = await createClient()

    // Get all email subscriptions
    const { data: subscriptions, error } = await supabase
      .from('email_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching email subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subscriptions: subscriptions || []
    })

  } catch (error) {
    console.error('Admin email subscriptions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin access
    await requireAdmin()

    const { email, action } = await request.json()

    if (!email || !action) {
      return NextResponse.json(
        { error: 'Email and action are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (action === 'deactivate') {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ is_active: false })
        .eq('email', email.toLowerCase())

      if (error) {
        console.error('Error deactivating subscription:', error)
        return NextResponse.json(
          { error: 'Failed to deactivate subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription deactivated successfully'
      })
    }

    if (action === 'activate') {
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ is_active: true })
        .eq('email', email.toLowerCase())

      if (error) {
        console.error('Error activating subscription:', error)
        return NextResponse.json(
          { error: 'Failed to activate subscription' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Subscription activated successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Admin email subscription update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}