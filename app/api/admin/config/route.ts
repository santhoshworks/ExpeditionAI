import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UserTier } from '@/lib/constants'

// GET - Retrieve system configuration
export async function GET() {
    try {
        const supabase = await createClient()

        // Check if user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('is_active')
            .eq('user_id', user.id)
            .single()

        if (!adminUser?.is_active) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Get system configuration
        const { data: configs, error } = await supabase
            .from('system_config')
            .select('key, value, description')
            .in('key', ['default_user_tier', 'default_tier_credits'])

        if (error) {
            console.error('Error fetching system config:', error)
            return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
        }

        // Transform to more usable format
        const configMap = configs.reduce((acc, config) => {
            acc[config.key] = config.value
            return acc
        }, {} as Record<string, any>)

        return NextResponse.json({
            defaultTier: configMap.default_user_tier,
            defaultCredits: configMap.default_tier_credits,
        })

    } catch (error) {
        console.error('System config GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update system configuration
export async function PUT(request: NextRequest) {
    try {
        const { defaultTier, defaultCredits } = await request.json()

        // Validate input
        if (!defaultTier || !['free', 'basic', 'pro'].includes(defaultTier)) {
            return NextResponse.json({ error: 'Invalid default tier' }, { status: 400 })
        }

        if (!defaultCredits || typeof defaultCredits !== 'object') {
            return NextResponse.json({ error: 'Invalid default credits configuration' }, { status: 400 })
        }

        // Validate credits are numbers
        for (const [tier, credits] of Object.entries(defaultCredits)) {
            if (!['free', 'basic', 'pro'].includes(tier) || typeof credits !== 'number' || credits < 0) {
                return NextResponse.json({
                    error: `Invalid credits for tier ${tier}: must be a non-negative number`
                }, { status: 400 })
            }
        }

        const supabase = await createClient()

        // Check if user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('is_active')
            .eq('user_id', user.id)
            .single()

        if (!adminUser?.is_active) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        // Update system configuration
        const updates = [
            {
                key: 'default_user_tier',
                value: JSON.stringify(defaultTier),
                updated_at: new Date().toISOString()
            },
            {
                key: 'default_tier_credits',
                value: JSON.stringify(defaultCredits),
                updated_at: new Date().toISOString()
            }
        ]

        for (const update of updates) {
            const { error } = await supabase
                .from('system_config')
                .upsert(update, { onConflict: 'key' })

            if (error) {
                console.error(`Error updating ${update.key}:`, error)
                return NextResponse.json({
                    error: `Failed to update ${update.key}`
                }, { status: 500 })
            }
        }

        return NextResponse.json({
            success: true,
            message: 'System configuration updated successfully',
            defaultTier,
            defaultCredits
        })

    } catch (error) {
        console.error('System config PUT error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}