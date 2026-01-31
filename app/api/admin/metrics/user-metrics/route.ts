import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
    try {
        await requireAdmin()
        const supabase = await createClient()

        // Get all user engagement metrics
        const [
            dailyActiveResult,
            weeklyActiveResult,
            monthlyActiveResult,
            streakResult,
            completionResult,
            retentionResult
        ] = await Promise.all([
            // Daily active users (last 1 day)
            supabase
                .from('daily_learning_activity')
                .select('user_id')
                .gte('activity_date', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

            // Weekly active users (last 7 days)
            supabase
                .from('daily_learning_activity')
                .select('user_id')
                .gte('activity_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

            // Monthly active users (last 30 days)
            supabase
                .from('daily_learning_activity')
                .select('user_id')
                .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

            // User streaks for learning metrics
            supabase
                .from('user_learning_streaks')
                .select('current_streak, total_active_days'),

            // Daily learning activity for completion/topics
            supabase
                .from('daily_learning_activity')
                .select('message_count, trail_count, topics_explored')
                .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

            // Retention by cohort (users created in last 90 days and their recent activity)
            supabase
                .from('profiles')
                .select('id, created_at')
                .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        ])

        // Calculate unique active users
        const dailyActiveUsers = new Set(dailyActiveResult.data?.map((row: any) => row.user_id) || []).size
        const weeklyActiveUsers = new Set(weeklyActiveResult.data?.map((row: any) => row.user_id) || []).size
        const monthlyActiveUsers = new Set(monthlyActiveResult.data?.map((row: any) => row.user_id) || []).size

        // Calculate average session time (minutes per trail)
        const completionStats = completionResult.data?.reduce((acc: any, activity: any) => {
            acc.totalMessages += activity.message_count || 0
            acc.totalTrails += activity.trail_count || 0
            acc.topicsSet.add(...(activity.topics_explored || []))
            return acc
        }, { totalMessages: 0, totalTrails: 0, topicsSet: new Set() }) || { totalMessages: 0, totalTrails: 0, topicsSet: new Set() }

        const averageSessionTime = completionStats.totalTrails > 0
            ? (completionStats.totalMessages / completionStats.totalTrails * 1.5).toFixed(1) // ~1.5 min per message
            : '0'

        // Calculate learning metrics from streaks
        const streakStats = streakResult.data?.reduce((acc: any, streak: any) => {
            acc.totalUsers += 1
            acc.totalStreakDays += streak.current_streak || 0
            acc.totalActiveDays += streak.total_active_days || 0
            return acc
        }, { totalUsers: 0, totalStreakDays: 0, totalActiveDays: 0 }) || { totalUsers: 0, totalStreakDays: 0, totalActiveDays: 0 }

        const averageStreakLength = streakStats.totalUsers > 0
            ? (streakStats.totalStreakDays / streakStats.totalUsers).toFixed(1)
            : '0'

        // Calculate completion rate (users with activity / total users in cohort)
        const cohortUsers = retentionResult.data || []
        const completionRate = cohortUsers.length > 0
            ? Math.round(monthlyActiveUsers / cohortUsers.length * 100)
            : 0

        // Calculate retention rates (users who were active N days ago and are still active)
        const day1Retention = await calculateRetention(supabase, 1)
        const day7Retention = await calculateRetention(supabase, 7)
        const day30Retention = await calculateRetention(supabase, 30)
        const day90Retention = await calculateRetention(supabase, 90)

        return NextResponse.json({
            userEngagement: {
                dailyActiveUsers,
                weeklyActiveUsers,
                monthlyActiveUsers,
                averageSessionTime: `${averageSessionTime} min`
            },
            learningMetrics: {
                averageStreakLength: parseFloat(averageStreakLength),
                completionRate,
                topicsExplored: completionStats.topicsSet.size,
                averageTrailsPerUser: monthlyActiveUsers > 0
                    ? (completionStats.totalTrails / monthlyActiveUsers).toFixed(1)
                    : '0'
            },
            retentionRates: {
                day1: day1Retention,
                day7: day7Retention,
                day30: day30Retention,
                day90: day90Retention
            }
        })

    } catch (error) {
        console.error('User metrics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function calculateRetention(supabase: any, daysAgo: number) {
    try {
        const targetDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        // Get users active N days ago
        const { data: usersActiveThenResult } = await supabase
            .from('daily_learning_activity')
            .select('user_id')
            .gte('activity_date', targetDate)
            .lte('activity_date', targetDate)

        if (!usersActiveThenResult || usersActiveThenResult.length === 0) return 0

        const usersThen = new Set(usersActiveThenResult.map((row: any) => row.user_id))

        // Get users active since then
        const { data: usersActiveSinceResult } = await supabase
            .from('daily_learning_activity')
            .select('user_id')
            .gte('activity_date', targetDate)

        const usersActiveSince = new Set(usersActiveSinceResult?.map((row: any) => row.user_id) || [])

        // Calculate retention as percentage
        if (usersThen.size === 0) return 0
        const retainedCount = Array.from(usersThen).filter(userId => usersActiveSince.has(userId)).length
        return Math.round((retainedCount / usersThen.size) * 100)
    } catch (error) {
        console.error(`Error calculating ${daysAgo}-day retention:`, error)
        return 0
    }
}
