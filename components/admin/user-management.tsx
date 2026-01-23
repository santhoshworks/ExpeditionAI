'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit } from 'lucide-react'

interface User {
    id: string
    email: string
    full_name: string | null
    created_at: string
    user_credits: {
        credits: number
        tier: string
        trails_today: number
        last_trail_date: string | null
    }[]
    user_learning_streaks: {
        current_streak: number
        longest_streak: number
        total_active_days: number
    }[]
}

interface UserManagementData {
    users: User[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

export function UserManagement() {
    const [data, setData] = useState<UserManagementData | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [tierFilter, setTierFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [page, search, tierFilter])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(tierFilter && tierFilter !== 'all' && { tier: tierFilter })
            })

            const response = await fetch(`/api/admin/users?${params}`)

            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (error) {
            // Error handling - could add user-friendly error display here
        } finally {
            setLoading(false)
        }
    }

    const updateUser = async (userId: string, action: string, value: any) => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, action, value })
            })

            if (response.ok) {
                fetchUsers() // Refresh the list
                setEditDialogOpen(false)
            }
        } catch (error) {
            // Error handling - could add user-friendly error display here
        }
    }

    const getTierBadgeVariant = (tier: string) => {
        switch (tier) {
            case 'free': return 'secondary'
            case 'basic': return 'default'
            case 'pro': return 'destructive'
            default: return 'secondary'
        }
    }

    if (loading && !data) {
        return <div>Loading users...</div>
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>User Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by email or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={tierFilter} onValueChange={setTierFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All Tiers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tiers</SelectItem>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="pro">Pro</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={fetchUsers}>
                            Search
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users ({data?.pagination.total || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data?.users.map((user) => {
                            const credits = user.user_credits[0]
                            const streak = user.user_learning_streaks[0]

                            return (
                                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-medium">{user.full_name || 'No name'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                            <Badge variant={getTierBadgeVariant(credits?.tier || 'free')}>
                                                {credits?.tier || 'free'}
                                            </Badge>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            Credits: {credits?.credits || 0} |
                                            Streak: {streak?.current_streak || 0} days |
                                            Total Active: {streak?.total_active_days || 0} days
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Dialog open={editDialogOpen && selectedUser?.id === user.id} onOpenChange={setEditDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit User: {user.email}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label>Tier</Label>
                                                        <Select
                                                            defaultValue={credits?.tier || 'free'}
                                                            onValueChange={(value) => updateUser(user.id, 'updateTier', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="free">Free</SelectItem>
                                                                <SelectItem value="basic">Basic</SelectItem>
                                                                <SelectItem value="pro">Pro</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label>Add Credits</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Amount to add"
                                                                id="creditAmount"
                                                            />
                                                            <Button
                                                                onClick={() => {
                                                                    const input = document.getElementById('creditAmount') as HTMLInputElement
                                                                    const amount = parseFloat(input.value)
                                                                    if (amount > 0) {
                                                                        updateUser(user.id, 'addCredits', amount)
                                                                        input.value = ''
                                                                    }
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination */}
                    {data && data.pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4">
                                Page {page} of {data.pagination.pages}
                            </span>
                            <Button
                                variant="outline"
                                disabled={page === data.pagination.pages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}