'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

interface SubscriptionMetricsData {
    subscriptionBreakdown: {
        free: number
        basic: number
        pro: number
    }
    conversionFunnel: {
        signups: number
        trialUsers: number
        basicConversions: number
        proUpgrades: number
    }
    churnAnalysis: {
        monthlyChurnRate: number
        averageLifetimeValue: number
        reactivationRate: number
    }
    revenueMetrics: {
        mrr: number
        arr: number
        averageRevenuePerUser: number
    }
}

export function SubscriptionMetrics() {
    const [metrics, setMetrics] = useState<SubscriptionMetricsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/admin/metrics/subscription-metrics')
                if (!response.ok) {
                    throw new Error('Failed to fetch subscription metrics')
                }
                const data = await response.json()
                setMetrics(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchMetrics()
    }, [])

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-sm text-gray-500">Loading metrics...</div>
                </CardContent>
            </Card>
        )
    }

    if (error || !metrics) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-sm text-red-500">{error || 'Failed to load metrics'}</div>
                </CardContent>
            </Card>
        )
    }

    const totalUsers = Object.values(metrics.subscriptionBreakdown).reduce((sum, count) => sum + count, 0)
    const paidUsers = metrics.subscriptionBreakdown.basic + metrics.subscriptionBreakdown.pro
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers * 100).toFixed(1) : '0'

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-3">Tier Distribution</h4>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                    Free <Badge variant="secondary">Free</Badge>
                                </span>
                                <span className="font-medium">{metrics.subscriptionBreakdown.free.toLocaleString()}</span>
                            </div>
                            <Progress value={(metrics.subscriptionBreakdown.free / totalUsers) * 100} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                    Basic <Badge variant="default">$5/mo</Badge>
                                </span>
                                <span className="font-medium">{metrics.subscriptionBreakdown.basic.toLocaleString()}</span>
                            </div>
                            <Progress value={(metrics.subscriptionBreakdown.basic / totalUsers) * 100} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="flex items-center gap-2">
                                    Pro <Badge variant="destructive">$15/mo</Badge>
                                </span>
                                <span className="font-medium">{metrics.subscriptionBreakdown.pro.toLocaleString()}</span>
                            </div>
                            <Progress value={(metrics.subscriptionBreakdown.pro / totalUsers) * 100} className="h-2" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Conversion Rate</span>
                            <span className="text-green-600">{conversionRate}%</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-3">Conversion Funnel</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>New Signups</span>
                            <span className="font-medium">{metrics.conversionFunnel.signups.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Trial Users</span>
                            <span className="font-medium">{metrics.conversionFunnel.trialUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Basic Conversions</span>
                            <span className="font-medium">{metrics.conversionFunnel.basicConversions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Pro Upgrades</span>
                            <span className="font-medium">{metrics.conversionFunnel.proUpgrades.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-3">Revenue Metrics</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Monthly Recurring Revenue</span>
                            <span className="font-medium">${metrics.revenueMetrics.mrr.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Annual Recurring Revenue</span>
                            <span className="font-medium">${metrics.revenueMetrics.arr.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Average Revenue Per User</span>
                            <span className="font-medium">${metrics.revenueMetrics.averageRevenuePerUser}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Monthly Churn Rate</span>
                            <span className="font-medium text-red-600">{metrics.churnAnalysis.monthlyChurnRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Avg Lifetime Value</span>
                            <span className="font-medium">${metrics.churnAnalysis.averageLifetimeValue}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}