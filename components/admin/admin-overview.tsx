'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, CreditCard, TrendingUp, MessageSquare, Map, Compass, Mail } from 'lucide-react'

interface OverviewData {
    totalUsers: number
    activeUsers: number
    subscriptionBreakdown: Record<string, number>
    emailSubscriptions: {
        total: number
        recent: number
    }
    monthlyRevenue: number
    weeklyActivity: {
        messages: number
        trails: number
        expeditions: number
    }
    conversionRate: number
}

export function AdminOverview() {
    const [data, setData] = useState<OverviewData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOverviewData()
    }, [])

    const fetchOverviewData = async () => {
        try {
            const response = await fetch('/api/admin/overview')
            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (error) {
            // Error handling
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(9)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (!data) {
        return <div>Failed to load overview data</div>
    }

    const totalSubscribers = (data.subscriptionBreakdown.basic || 0) + (data.subscriptionBreakdown.pro || 0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Registered users
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Active in last 7 days
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Email Subscribers</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.emailSubscriptions.total.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        +{data.emailSubscriptions.recent} this week
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Paid Subscribers</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Basic: {data.subscriptionBreakdown.basic || 0} | Pro: {data.subscriptionBreakdown.pro || 0}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.conversionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                        Free to paid conversion
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${data.monthlyRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                        Last 30 days
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.weeklyActivity.messages.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Last 7 days
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Trails</CardTitle>
                    <Map className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.weeklyActivity.trails.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Last 7 days
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expeditions</CardTitle>
                    <Compass className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.weeklyActivity.expeditions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                        Last 7 days
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}