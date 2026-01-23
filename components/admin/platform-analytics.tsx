'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface AnalyticsData {
    userGrowth: Record<string, number>
    subscriptionTrends: Record<string, { count: number, revenue: number }>
    activityTrends: Record<string, { messages: number, trails: number, expeditions: number, tokens: number }>
    modelUsage: Record<string, number>
    retentionMetrics: {
        totalUsers: number
        totalActiveUsers: number
        averageStreak: number
        averageLongestStreak: number
        averageActiveDays: number
        inactive: number
        lowActivity: number
        mediumActivity: number
        highActivity: number
    }
    tierDistribution: Record<string, number>
    summary: {
        totalNewUsers: number
        totalRevenue: number
        totalActivity: number
        retentionRate: number
    }
}

export function PlatformAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState('30')

    useEffect(() => {
        fetchAnalytics()
    }, [timeframe])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`)
            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Loading analytics...</div>
    }

    if (!data) {
        return <div>Failed to load analytics data</div>
    }

    // Process data for charts
    const userGrowthData = Object.entries(data.userGrowth).slice(-7) // Last 7 days
    const revenueData = Object.entries(data.subscriptionTrends).slice(-7)
    const topModels = Object.entries(data.modelUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Time Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Analytics Timeframe</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">New Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalNewUsers}</div>
                        <p className="text-xs text-muted-foreground">Last {timeframe} days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.summary.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Last {timeframe} days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.totalActivity.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last {timeframe} days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.summary.retentionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Active users</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily User Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {userGrowthData.map(([date, count]) => (
                                <div key={date} className="flex items-center justify-between">
                                    <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${Math.min(100, (count / Math.max(...userGrowthData.map(([, c]) => c))) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-medium text-sm w-8">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {revenueData.map(([date, data]) => (
                                <div key={date} className="flex items-center justify-between">
                                    <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                                    <div className="text-right">
                                        <div className="font-medium text-sm">${data.revenue.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">{data.count} purchases</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Models */}
                <Card>
                    <CardHeader>
                        <CardTitle>Most Used Models</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topModels.map(([model, usage], index) => (
                                <div key={model} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-500 w-4">#{index + 1}</span>
                                        <span className="font-medium text-sm">{model.split('/').pop()}</span>
                                    </div>
                                    <span className="font-medium">{usage.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* User Activity Levels */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Activity Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>High Activity (10+ days)</span>
                                    <span className="font-medium">{data.retentionMetrics.highActivity}</span>
                                </div>
                                <Progress value={(data.retentionMetrics.highActivity / data.retentionMetrics.totalUsers) * 100} className="h-2" />
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Medium Activity (4-10 days)</span>
                                    <span className="font-medium">{data.retentionMetrics.mediumActivity}</span>
                                </div>
                                <Progress value={(data.retentionMetrics.mediumActivity / data.retentionMetrics.totalUsers) * 100} className="h-2" />
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Low Activity (1-3 days)</span>
                                    <span className="font-medium">{data.retentionMetrics.lowActivity}</span>
                                </div>
                                <Progress value={(data.retentionMetrics.lowActivity / data.retentionMetrics.totalUsers) * 100} className="h-2" />
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Inactive (0 days)</span>
                                    <span className="font-medium">{data.retentionMetrics.inactive}</span>
                                </div>
                                <Progress value={(data.retentionMetrics.inactive / data.retentionMetrics.totalUsers) * 100} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Retention Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.retentionMetrics.averageStreak.toFixed(1)}</div>
                            <div className="text-sm text-gray-500">Average Current Streak</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.retentionMetrics.averageLongestStreak.toFixed(1)}</div>
                            <div className="text-sm text-gray-500">Average Longest Streak</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.retentionMetrics.averageActiveDays.toFixed(1)}</div>
                            <div className="text-sm text-gray-500">Average Active Days</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{((data.retentionMetrics.totalActiveUsers / data.retentionMetrics.totalUsers) * 100).toFixed(1)}%</div>
                            <div className="text-sm text-gray-500">Currently Active</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}