'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ActivityMetrics() {
    // This would typically fetch real data from your API
    const metrics = {
        topModels: [
            { name: 'Mistral Devstral 2512', usage: 3450, tier: 'Free' },
            { name: 'Gemini 2.0 Flash', usage: 2100, tier: 'Basic' },
            { name: 'GPT-4o Mini', usage: 1800, tier: 'Basic' },
            { name: 'Claude 3.5 Haiku', usage: 950, tier: 'Basic' },
            { name: 'GPT-4o', usage: 420, tier: 'Pro' }
        ],
        topTopics: [
            { topic: 'JavaScript Programming', count: 1250 },
            { topic: 'Machine Learning', count: 980 },
            { topic: 'React Development', count: 850 },
            { topic: 'Python Basics', count: 720 },
            { topic: 'Data Science', count: 650 },
            { topic: 'Web Development', count: 580 },
            { topic: 'API Design', count: 420 },
            { topic: 'Database Design', count: 380 }
        ],
        peakHours: [
            { hour: '9 AM', activity: 85 },
            { hour: '10 AM', activity: 92 },
            { hour: '2 PM', activity: 88 },
            { hour: '3 PM', activity: 95 },
            { hour: '7 PM', activity: 78 },
            { hour: '8 PM', activity: 82 }
        ],
        weeklyTrends: {
            messages: { current: 12450, previous: 11200, change: 11.2 },
            trails: { current: 3200, previous: 2950, change: 8.5 },
            expeditions: { current: 890, previous: 820, change: 8.5 },
            newUsers: { current: 245, previous: 220, change: 11.4 }
        }
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
                            <span className="text-sm font-medium">Expeditions</span>
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