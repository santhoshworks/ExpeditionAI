'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function UserMetrics() {
    // This would typically fetch real data from your API
    const metrics = {
        userEngagement: {
            dailyActiveUsers: 1250,
            weeklyActiveUsers: 3400,
            monthlyActiveUsers: 8900,
            averageSessionTime: '12.5 min'
        },
        learningMetrics: {
            averageStreakLength: 4.2,
            completionRate: 78,
            topicsExplored: 156,
            averageTrailsPerUser: 8.3
        },
        retentionRates: {
            day1: 85,
            day7: 62,
            day30: 34,
            day90: 18
        }
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