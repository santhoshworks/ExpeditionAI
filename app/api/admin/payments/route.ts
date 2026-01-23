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
            .toISOString()

        // Get payment analytics
        const [
            revenueOverviewResult,
            transactionHistoryResult,
            dailyRevenueResult,
            tierBreakdownResult,
            failedPaymentsResult
        ] = await Promise.all([
            // Revenue overview
            supabase
                .from('credit_transactions')
                .select('amount, type, created_at')
                .eq('type', 'purchase')
                .gte('created_at', startDate),

            // Recent transactions with user info
            supabase
                .from('credit_transactions')
                .select(`
          id,
          amount,
          type,
          description,
          balance_after,
          created_at,
          profiles!inner(email, full_name)
        `)
                .eq('type', 'purchase')
                .gte('created_at', startDate)
                .order('created_at', { ascending: false })
                .limit(50),

            // Daily revenue for chart
            supabase
                .from('credit_transactions')
                .select('amount, created_at')
                .eq('type', 'purchase')
                .gte('created_at', startDate)
                .order('created_at'),

            // Revenue by tier (approximate based on credit amounts)
            supabase
                .from('credit_transactions')
                .select('amount')
                .eq('type', 'purchase')
                .gte('created_at', startDate),

            // Failed payments (we'll simulate this since Dodo webhook data might not be stored)
            supabase
                .from('credit_transactions')
                .select('*')
                .eq('type', 'purchase')
                .gte('created_at', startDate)
                .limit(10) // We'll use this as a placeholder
        ])

        // Process revenue overview
        const totalRevenue = revenueOverviewResult.data?.reduce((sum: number, transaction: any) => {
            return sum + (parseFloat(transaction.amount.toString()) * 0.01) // Convert credits to USD
        }, 0) || 0

        const totalTransactions = revenueOverviewResult.data?.length || 0

        // Process daily revenue
        const dailyRevenue = dailyRevenueResult.data?.reduce((acc: Record<string, number>, transaction: any) => {
            const date = transaction.created_at.split('T')[0]
            const amount = parseFloat(transaction.amount.toString()) * 0.01
            acc[date] = (acc[date] || 0) + amount
            return acc
        }, {}) || {}

        // Estimate tier breakdown based on common credit amounts
        const tierBreakdown = tierBreakdownResult.data?.reduce((acc: Record<string, number>, transaction: any) => {
            const credits = parseFloat(transaction.amount.toString())
            let tier = 'unknown'

            // Based on your tier configs: Basic = 200 credits, Pro = 600 credits
            if (credits >= 200 && credits < 400) tier = 'basic'
            else if (credits >= 600) tier = 'pro'
            else tier = 'other'

            acc[tier] = (acc[tier] || 0) + (credits * 0.01)
            return acc
        }, {}) || {}

        // Calculate success rate (assuming all stored transactions are successful)
        const successRate = 100 // Since failed payments might not be in credit_transactions

        // Process recent transactions
        const recentTransactions = transactionHistoryResult.data?.map((transaction: any) => ({
            id: transaction.id,
            amount: parseFloat(transaction.amount.toString()) * 0.01,
            user: {
                email: transaction.profiles.email,
                name: transaction.profiles.full_name
            },
            status: 'completed', // All stored transactions are successful
            created_at: transaction.created_at,
            description: transaction.description
        })) || []

        return NextResponse.json({
            overview: {
                totalRevenue,
                totalTransactions,
                successRate,
                averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
            },
            dailyRevenue,
            tierBreakdown,
            recentTransactions,
            failedPayments: [], // Placeholder - would need webhook data storage
            summary: {
                thisMonth: totalRevenue,
                lastMonth: 0, // Would need to calculate previous period
                growth: 0 // Would need to calculate growth percentage
            }
        })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}