'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function SubscriptionMetrics() {
    // This would typically fetch real data from your API
    const metrics = {
        subscriptionBreakdown: {
            free: 7500,
            basic: 1200,
            pro: 300
        },
        conversionFunnel: {
            signups: 1000,
            trialUsers: 450,
            basicConversions: 120,
            proUpgrades: 30
        },
        churnAnalysis: {
            monthlyChurnRate: 5.2,
            averageLifetimeValue: 45.60,
            reactivationRate: 12.3
        },
        revenueMetrics: {
            mrr: 8400, // Monthly Recurring Revenue
            arr: 100800, // Annual Recurring Revenue
            averageRevenuePerUser: 9.33
        }
    }

    const totalUsers = Object.values(metrics.subscriptionBreakdown).reduce((sum, count) => sum + count, 0)
    const paidUsers = metrics.subscriptionBreakdown.basic + metrics.subscriptionBreakdown.pro
    const conversionRate = (paidUsers / totalUsers * 100).toFixed(1)

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