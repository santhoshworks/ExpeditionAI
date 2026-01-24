'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Mail, Search, Download, UserX, Calendar, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface EmailSubscription {
    id: string
    email: string
    subscribed_at: string
    is_active: boolean
    source: string
    user_id: string | null
    created_at: string
}

export function EmailSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('/api/admin/email-subscriptions')
            if (response.ok) {
                const data = await response.json()
                setSubscriptions(data.subscriptions || [])
            } else {
                toast.error('Failed to fetch email subscriptions')
            }
        } catch (error) {
            toast.error('Error loading subscriptions')
        } finally {
            setLoading(false)
        }
    }

    const handleUnsubscribe = async (email: string) => {
        try {
            const response = await fetch('/api/admin/email-subscriptions', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, action: 'deactivate' }),
            })

            if (response.ok) {
                toast.success('User unsubscribed successfully')
                fetchSubscriptions()
            } else {
                toast.error('Failed to unsubscribe user')
            }
        } catch (error) {
            toast.error('Error unsubscribing user')
        }
    }

    const exportSubscriptions = () => {
        const activeSubscriptions = subscriptions.filter(sub => sub.is_active)
        const csvContent = [
            ['Email', 'Subscribed Date', 'Source', 'Has Account'].join(','),
            ...activeSubscriptions.map(sub => [
                sub.email,
                new Date(sub.subscribed_at).toLocaleDateString(),
                sub.source,
                sub.user_id ? 'Yes' : 'No'
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `email-subscriptions-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && sub.is_active) ||
            (filter === 'inactive' && !sub.is_active)
        return matchesSearch && matchesFilter
    })

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(sub => sub.is_active).length,
        inactive: subscriptions.filter(sub => !sub.is_active).length,
        withAccounts: subscriptions.filter(sub => sub.user_id).length
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
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
                <Card className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Mail className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.inactive.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Accounts</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.withAccounts.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Email Subscriptions</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex gap-2">
                                <Button
                                    variant={filter === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    variant={filter === 'active' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('active')}
                                >
                                    Active
                                </Button>
                                <Button
                                    variant={filter === 'inactive' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter('inactive')}
                                >
                                    Inactive
                                </Button>
                            </div>
                            <Button onClick={exportSubscriptions} size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Subscribed</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubscriptions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No subscriptions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubscriptions.map((subscription) => (
                                        <TableRow key={subscription.id}>
                                            <TableCell className="font-medium">
                                                {subscription.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={subscription.is_active ? 'default' : 'secondary'}>
                                                    {subscription.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {subscription.source.replace('_', ' ')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={subscription.user_id ? 'default' : 'outline'}>
                                                    {subscription.user_id ? 'Yes' : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(subscription.subscribed_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {subscription.is_active && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUnsubscribe(subscription.email)}
                                                    >
                                                        <UserX className="h-4 w-4 mr-1" />
                                                        Unsubscribe
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}