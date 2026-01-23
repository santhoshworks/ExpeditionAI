import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
    try {
        // Check admin access
        await requireAdmin()

        const supabase = await createClient()

        const { searchParams } = new URL(request.url)
        const timeframe = searchParams.get('timeframe') || '30' // days

        const startDate = new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0]

        // Get comprehensive analytics
        const [
            userGrowthResult,
            subscriptionTrendsResult,
            activityTrendsResult,
            topModelsResult,
            churnAnalysisResult,
            revenueAnalysisResult
        ] = await Promise.all([
            // User growth over time
            supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', startDate)
                .order('created_at'),

            // Subscription trends
            supabase
                .from('credit_transactions')
                .select('created_at, type, amount')
                .eq('type', 'purchase')
                .gte('created_at', startDate)
                .order('created_at'),

            // Activity trends
            supabase
                .from('daily_learning_activity')
                .select('activity_date, message_count, trail_count, expedition_count, total_tokens')
                .gte('activity_date', startDate)
                .order('activity_date'),

            // Most used models
            supabase
                .from('messages')
                .select('model')
                .not('model', 'is', null)
                .gte('created_at', startDate),

            // User retention analysis
            supabase
                .from('user_learning_streaks')
                .select('current_streak, longest_streak, total_active_days, last_activity_date'),

            // Revenue by tier
            supabase
                .from('user_credits')
                .select('tier, credits, created_at')
                .gte('created_at', startDate)
        ])

        // Process user growth data
        const userGrowthByDay = userGrowthResult.data?.reduce((acc, user) => {
            const date = user.created_at.split('T')[0]
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {} as Record<string, number>) || {}

        // Process subscription trends
        const subscriptionsByDay = subscriptionTrendsResult.data?.reduce((acc, transaction) => {
            const date = transaction.created_at.split('T')[0]
            if (!acc[date]) acc[date] = { count: 0, revenue: 0 }
            acc[date].count += 1
            acc[date].revenue += parseFloat(transaction.amount.toString()) * 0.01
            return acc
        }, {} as Record<string, { count: number, revenue: number }>) || {}

        // Process activity trends
        const activityByDay = activityTrendsResult.data?.reduce((acc, activity) => {
            const date = activity.activity_date
            acc[date] = {
                messages: (acc[date]?.messages || 0) + (activity.message_count || 0),
                trails: (acc[date]?.trails || 0) + (activity.trail_count || 0),
                expeditions: (acc[date]?.expeditions || 0) + (activity.expedition_count || 0),
                tokens: (acc[date]?.tokens || 0) + (activity.total_tokens || 0)
            }
            return acc
        }, {} as Record<string, { messages: number, trails: number, expeditions: number, tokens: number }>) || {}

        // Process model usage
        const modelUsage = topModelsResult.data?.reduce((acc, message) => {
            if (message.model) {
                acc[message.model] = (acc[message.model] || 0) + 1
            }
            return acc
        }, {} as Record<string, number>) || {}

        // Process retention data
        const retentionMetrics = churnAnalysisResult.data?.reduce((acc, streak) => {
            acc.totalUsers += 1
            acc.totalActiveUsers += streak.current_streak > 0 ? 1 : 0
            acc.averageStreak += streak.current_streak
            acc.averageLongestStreak += streak.longest_streak
            acc.averageActiveDays += streak.total_active_days

            // Categorize users by activity level
            if (streak.total_active_days === 0) acc.inactive += 1
            else if (streak.total_active_days <= 3) acc.lowActivity += 1
            else if (streak.total_active_days <= 10) acc.mediumActivity += 1
            else acc.highActivity += 1

            return acc
        }, {
            totalUsers: 0,
            totalActiveUsers: 0,
            averageStreak: 0,
            averageLongestStreak: 0,
            averageActiveDays: 0,
            inactive: 0,
            lowActivity: 0,
            mediumActivity: 0,
            highActivity: 0
        }) || {}

        // Calculate averages
        if (retentionMetrics.totalUsers > 0) {
            retentionMetrics.averageStreak /= retentionMetrics.totalUsers
            retentionMetrics.averageLongestStreak /= retentionMetrics.totalUsers
            retentionMetrics.averageActiveDays /= retentionMetrics.totalUsers
        }

        // Process tier distribution
        const tierDistribution = revenueAnalysisResult.data?.reduce((acc, user) => {
            acc[user.tier] = (acc[user.tier] || 0) + 1
            return acc
        }, {} as Record<string, number>) || {}

        return NextResponse.json({
            userGrowth: userGrowthByDay,
            subscriptionTrends: subscriptionsByDay,
            activityTrends: activityByDay,
            modelUsage,
            retentionMetrics,
            tierDistribution,
            summary: {
                totalNewUsers: Object.values(userGrowthByDay).reduce((sum, count) => sum + count, 0),
                totalRevenue: Object.values(subscriptionsByDay).reduce((sum, day) => sum + day.revenue, 0),
                totalActivity: Object.values(activityByDay).reduce((sum, day) => sum + day.messages, 0),
                retentionRate: retentionMetrics.totalUsers > 0 ? (retentionMetrics.totalActiveUsers / retentionMetrics.totalUsers * 100) : 0
            }
        })

    } catch (error) {
        console.error('Admin analytics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}