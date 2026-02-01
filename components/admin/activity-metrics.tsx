'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

interface Model {
    name: string
    usage: number
    tier: string
}

interface Topic {
    topic: string
    count: number
}

interface PeakHour {
    hour: string
    activity: number
}

interface TrendData {
    current: number
    previous: number
    change: number
}

interface ActivityMetricsData {
    topModels: Model[]
    topTopics: Topic[]
    peakHours: PeakHour[]
    weeklyTrends: {
        messages: TrendData
        trails: TrendData
        expeditions: TrendData
        newUsers: TrendData
    }
}

export function ActivityMetrics() {
    const [metrics, setMetrics] = useState<ActivityMetricsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch('/api/admin/metrics/activity-metrics')
                if (!response.ok) {
                    throw new Error('Failed to fetch activity metrics')
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card><CardContent className="pt-6"><div className="text-center text-sm text-gray-500">Loading...</div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center text-sm text-gray-500">Loading...</div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center text-sm text-gray-500">Loading...</div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="text-center text-sm text-gray-500">Loading...</div></CardContent></Card>
            </div>
        )
    }

    if (error || !metrics) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-sm text-red-500">{error || 'Failed to load metrics'}</div>
                </CardContent>
            </Card>
        )
    }

    const getTierBadgeVariant = (tier: string) => {
        switch (tier) {
            case 'Free': return 'secondary'
            case 'Basic': return 'default'
            case 'Pro': return 'destructive'
            default: return 'secondary'
        }
    }

    const getChangeColor = (change: number) => {
        return change >= 0 ? 'text-green-600' : 'text-red-600'
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Most Popular Models</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics.topModels.map((model, index) => (
                            <div key={model.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-500 w-4">
                                        #{index + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium text-sm">{model.name}</div>
                                        <Badge variant={getTierBadgeVariant(model.tier)} className="text-xs">
                                            {model.tier}
                                        </Badge>
                                    </div>
                                </div>
                                <span className="font-medium">{model.usage.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Popular Learning Topics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics.topTopics.map((topic, index) => (
                            <div key={topic.topic} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-500 w-4">
                                        #{index + 1}
                                    </span>
                                    <span className="font-medium text-sm">{topic.topic}</span>
                                </div>
                                <span className="font-medium">{topic.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Peak Activity Hours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {metrics.peakHours.map((hour) => (
                            <div key={hour.hour} className="flex items-center justify-between">
                                <span className="font-medium text-sm">{hour.hour}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${hour.activity}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-medium text-sm w-8">{hour.activity}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Weekly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Messages</span>
                            <div className="text-right">
                                <div className="font-bold">{metrics.weeklyTrends.messages.current.toLocaleString()}</div>
                                <div className={`text-xs ${getChangeColor(metrics.weeklyTrends.messages.change)}`}>
                                    {metrics.weeklyTrends.messages.change >= 0 ? '+' : ''}{metrics.weeklyTrends.messages.change}%
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Trails Created</span>
                            <div className="text-right">
                                <div className="font-bold">{metrics.weeklyTrends.trails.current.toLocaleString()}</div>
                                <div className={`text-xs ${getChangeColor(metrics.weeklyTrends.trails.change)}`}>
                                    {metrics.weeklyTrends.trails.change >= 0 ? '+' : ''}{metrics.weeklyTrends.trails.change}%
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Explorations</span>
                            <div className="text-right">
                                <div className="font-bold">{metrics.weeklyTrends.expeditions.current.toLocaleString()}</div>
                                <div className={`text-xs ${getChangeColor(metrics.weeklyTrends.expeditions.change)}`}>
                                    {metrics.weeklyTrends.expeditions.change >= 0 ? '+' : ''}{metrics.weeklyTrends.expeditions.change}%
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">New Users</span>
                            <div className="text-right">
                                <div className="font-bold">{metrics.weeklyTrends.newUsers.current.toLocaleString()}</div>
                                <div className={`text-xs ${getChangeColor(metrics.weeklyTrends.newUsers.change)}`}>
                                    {metrics.weeklyTrends.newUsers.change >= 0 ? '+' : ''}{metrics.weeklyTrends.newUsers.change}%
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}