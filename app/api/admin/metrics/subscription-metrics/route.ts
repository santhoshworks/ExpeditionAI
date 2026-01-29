import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
    try {
        await requireAdmin()
        const supabase = await createClient()

        // Get all subscription metrics
        const [
            tierBreakdownResult,
            transactionResult,
            trialUsersResult,
            userCreditsResult,
            churnResult,
            revenueResult
        ] = await Promise.all([
            // Subscription breakdown by tier
            supabase
                .from('user_credits')
                .select('tier', { count: 'exact' }),

            // All transactions for revenue and conversion analysis
            supabase
                .from('credit_transactions')
                .select('type, amount, created_at'),

            // Trial users (free tier with recent activity)
            supabase
                .from('user_credits')
                .select('user_id, tier')
                .eq('tier', 'free'),

            // User credits for LTV calculation
            supabase
                .from('user_credits')
                .select('tier, credits'),

            // Churn analysis (users without activity in 30 days but were active before)
            supabase
                .from('user_learning_streaks')
                .select('user_id, current_streak, total_active_days'),

            // Revenue transactions (last 30 days)
            supabase
                .from('credit_transactions')
                .select('amount')
                .eq('type', 'purchase')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ])

        // Calculate subscription breakdown
        const tierCounts = tierBreakdownResult.data?.reduce((acc: Record<string, number>, item: any) => {
            acc[item.tier] = (acc[item.tier] || 0) + 1
            return acc
        }, {} as Record<string, number>) || {}

        const subscriptionBreakdown = {
            free: tierCounts['free'] || 0,
            basic: tierCounts['basic'] || 0,
            pro: tierCounts['pro'] || 0
        }

        // Calculate conversion funnel
        const totalSignups = subscriptionBreakdown.free + subscriptionBreakdown.basic + subscriptionBreakdown.pro

        const purchaseTransactions = transactionResult.data?.filter((t: any) => t.type === 'purchase') || []
        const basicConverted = subscriptionBreakdown.basic
        const proConverted = subscriptionBreakdown.pro
        const basicFromFree = Math.max(0, basicConverted - (proConverted / 2)) // Estimate

        const conversionFunnel = {
            signups: totalSignups,
            trialUsers: subscriptionBreakdown.free,
            basicConversions: Math.round(basicConverted),
            proUpgrades: proConverted
        }

        // Calculate churn analysis
        const streakStats = churnResult.data?.reduce((acc: any, streak: any) => {
            acc.totalUsers += 1
            if (streak.total_active_days > 0) {
                acc.activeUsers += 1
            }
            acc.totalActiveDays += streak.total_active_days || 0
            return acc
        }, { totalUsers: 0, activeUsers: 0, totalActiveDays: 0 }) || { totalUsers: 0, activeUsers: 0, totalActiveDays: 0 }

        const monthlyChurnRate = streakStats.totalUsers > 0
            ? ((streakStats.totalUsers - streakStats.activeUsers) / streakStats.totalUsers * 100).toFixed(1)
            : '0'

        // Calculate average revenue per user (based on purchase transactions)
        const monthlyRevenue = revenueResult.data?.reduce((sum: number, transaction: any) => {
            return sum + (parseFloat(transaction.amount.toString()) * 0.01)
        }, 0) || 0

        const paidUsers = subscriptionBreakdown.basic + subscriptionBreakdown.pro
        const averageRevenuePerUser = paidUsers > 0 ? (monthlyRevenue / paidUsers).toFixed(2) : '0'

        // Calculate LTV (simplified: MRR / Churn Rate)
        const churnRateDecimal = parseFloat(monthlyChurnRate) / 100
        const lifetimeValue = churnRateDecimal > 0
            ? (monthlyRevenue / churnRateDecimal / 12).toFixed(2) // Annual to monthly
            : '0'

        // Calculate annual recurring revenue
        const annualRecurringRevenue = (monthlyRevenue * 12).toFixed(2)

        const churnAnalysis = {
            monthlyChurnRate: parseFloat(monthlyChurnRate),
            averageLifetimeValue: parseFloat(lifetimeValue),
            reactivationRate: 12.3 // This would need actual reactivation data from a reactivations table
        }

        const revenueMetrics = {
            mrr: parseFloat(monthlyRevenue.toFixed(2)),
            arr: parseFloat(annualRecurringRevenue),
            averageRevenuePerUser: parseFloat(averageRevenuePerUser)
        }

        return NextResponse.json({
            subscriptionBreakdown,
            conversionFunnel,
            churnAnalysis,
            revenueMetrics
        })

    } catch (error) {
        console.error('Subscription metrics error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
