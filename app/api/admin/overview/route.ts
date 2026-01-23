import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
    try {
        // Check admin access
        await requireAdmin()

        const supabase = await createClient()

        // Get overview metrics
        const [
            totalUsersResult,
            activeUsersResult,
            subscriptionsResult,
            revenueResult,
            activityResult
        ] = await Promise.all([
            // Total users
            supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true }),

            // Active users (last 7 days) - get unique user_ids
            supabase
                .from('daily_learning_activity')
                .select('user_id')
                .gte('activity_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

            // Subscription breakdown
            supabase
                .from('user_credits')
                .select('tier')
                .neq('tier', 'free'),

            // Revenue calculation (approximate)
            supabase
                .from('credit_transactions')
                .select('amount')
                .eq('type', 'purchase')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

            // Recent activity
            supabase
                .from('daily_learning_activity')
                .select('message_count, trail_count, expedition_count')
                .gte('activity_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ])

        // Calculate metrics
        const totalUsers = totalUsersResult.count || 0

        // Get unique active users
        const uniqueActiveUsers = new Set(activeUsersResult.data?.map((row: any) => row.user_id) || [])
        const activeUsers = uniqueActiveUsers.size

        const subscriptionBreakdown = subscriptionsResult.data?.reduce((acc: Record<string, number>, sub: any) => {
            acc[sub.tier] = (acc[sub.tier] || 0) + 1
            return acc
        }, {} as Record<string, number>) || {}

        const monthlyRevenue = revenueResult.data?.reduce((sum: number, transaction: any) => {
            return sum + (parseFloat(transaction.amount.toString()) * 0.01) // Convert credits to USD
        }, 0) || 0

        const weeklyActivity = activityResult.data?.reduce((acc: any, activity: any) => {
            acc.messages += activity.message_count || 0
            acc.trails += activity.trail_count || 0
            acc.expeditions += activity.expedition_count || 0
            return acc
        }, { messages: 0, trails: 0, expeditions: 0 }) || { messages: 0, trails: 0, expeditions: 0 }

        return NextResponse.json({
            totalUsers,
            activeUsers,
            subscriptionBreakdown,
            monthlyRevenue,
            weeklyActivity,
            conversionRate: totalUsers > 0 ? ((subscriptionBreakdown.basic || 0) + (subscriptionBreakdown.pro || 0)) / totalUsers * 100 : 0
        })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}