'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'

interface UserMetricsData {
    userEngagement: {
        dailyActiveUsers: number
        weeklyActiveUsers: number
        monthlyActiveUsers: number
        averageSessionTime: string
    }
    learningMetrics: {
        averageStreakLength: number
        completionRate: number
        topicsExplored: number
        averageTrailsPerUser: string
    }
    retentionRates: {
        day1: number
        day7: number
        day30: number
        day90: number
    }
}

export function UserMetrics() {
    const [metrics, setMetrics] = useState<UserMetricsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/admin/metrics/user-metrics')
                if (!response.ok) {
                    throw new Error('Failed to fetch user metrics')
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
                    <CardTitle>User Engagement Metrics</CardTitle>
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
                    <CardTitle>User Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-sm text-red-500">{error || 'Failed to load metrics'}</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-medium mb-3">Active Users</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Daily Active</span>
                            <span className="font-medium">{metrics.userEngagement.dailyActiveUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Weekly Active</span>
                            <span className="font-medium">{metrics.userEngagement.weeklyActiveUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Monthly Active</span>
                            <span className="font-medium">{metrics.userEngagement.monthlyActiveUsers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Avg Session Time</span>
                            <span className="font-medium">{metrics.userEngagement.averageSessionTime}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-3">Learning Metrics</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Avg Streak Length</span>
                            <span className="font-medium">{metrics.learningMetrics.averageStreakLength} days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Completion Rate</span>
                            <span className="font-medium">{metrics.learningMetrics.completionRate}%</span>
                        </div>
                        <Progress value={metrics.learningMetrics.completionRate} className="h-2" />
                        <div className="flex justify-between text-sm">
                            <span>Topics Explored</span>
                            <span className="font-medium">{metrics.learningMetrics.topicsExplored}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Avg Trails/User</span>
                            <span className="font-medium">{metrics.learningMetrics.averageTrailsPerUser}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-3">Retention Rates</h4>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Day 1</span>
                                <span className="font-medium">{metrics.retentionRates.day1}%</span>
                            </div>
                            <Progress value={metrics.retentionRates.day1} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Day 7</span>
                                <span className="font-medium">{metrics.retentionRates.day7}%</span>
                            </div>
                            <Progress value={metrics.retentionRates.day7} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Day 30</span>
                                <span className="font-medium">{metrics.retentionRates.day30}%</span>
                            </div>
                            <Progress value={metrics.retentionRates.day30} className="h-2" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Day 90</span>
                                <span className="font-medium">{metrics.retentionRates.day90}%</span>
                            </div>
                            <Progress value={metrics.retentionRates.day90} className="h-2" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}