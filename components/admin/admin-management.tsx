'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Shield, ShieldCheck } from 'lucide-react'

interface AdminUser {
    id: string
    user_id: string
    role: string
    permissions: string[]
    is_active: boolean
    created_at: string
    profiles: {
        email: string
        full_name: string | null
    }
}

export function AdminManagement() {
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [newAdminEmail, setNewAdminEmail] = useState('')
    const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin')

    useEffect(() => {
        fetchAdminUsers()
    }, [])

    const fetchAdminUsers = async () => {
        try {
            const response = await fetch('/api/admin/manage')
            if (response.ok) {
                const result = await response.json()
                setAdminUsers(result.adminUsers || [])
            }
        } catch (error) {
            // Error handling
        } finally {
            setLoading(false)
        }
    }

    const addAdmin = async () => {
        if (!newAdminEmail.trim()) return

        try {
            // First, find the user by email
            const userResponse = await fetch(`/api/admin/users?search=${encodeURIComponent(newAdminEmail)}&limit=1`)
            if (!userResponse.ok) {
                alert('Failed to find user')
                return
            }

            const userData = await userResponse.json()
            if (!userData.users || userData.users.length === 0) {
                alert('User not found')
                return
            }

            const userId = userData.users[0].id

            const response = await fetch('/api/admin/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    userId,
                    role: newAdminRole,
                    permissions: []
                })
            })

            if (response.ok) {
                setNewAdminEmail('')
                setNewAdminRole('admin')
                setAddDialogOpen(false)
                fetchAdminUsers()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to add admin')
            }
        } catch (error) {
            alert('Failed to add admin')
        }
    }

    const removeAdmin = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this admin?')) return

        try {
            const response = await fetch('/api/admin/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'remove',
                    userId
                })
            })

            if (response.ok) {
                fetchAdminUsers()
            } else {
                const error = await response.json()
                alert(error.error || 'Failed to remove admin')
            }
        } catch (error) {
            alert('Failed to remove admin')
        }
    }

    const getRoleBadgeVariant = (role: string) => {
        return role === 'super_admin' ? 'destructive' : 'default'
    }

    const getRoleIcon = (role: string) => {
        return role === 'super_admin' ? ShieldCheck : Shield
    }

    if (loading) {
        return <div>Loading admin users...</div>
    }

    return (
        <div className="space-y-6">
            {/* Add Admin */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Admin Users ({adminUsers.length})
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Admin
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Admin</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="email">User Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="user@example.com"
                                            value={newAdminEmail}
                                            onChange={(e) => setNewAdminEmail(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={newAdminRole} onValueChange={(value: 'admin' | 'super_admin') => setNewAdminRole(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={addAdmin} className="flex-1">
                                            Add Admin
                                        </Button>
                                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {adminUsers.map((admin) => {
                            const RoleIcon = getRoleIcon(admin.role)

                            return (
                                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <RoleIcon className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <div className="font-medium">
                                                {admin.profiles.full_name || 'No name'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {admin.profiles.email}
                                            </div>
                                        </div>
                                        <Badge variant={getRoleBadgeVariant(admin.role)}>
                                            {admin.role.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                            Added {new Date(admin.created_at).toLocaleDateString()}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeAdmin(admin.user_id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}

                        {adminUsers.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No admin users found
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Admin Setup Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>Setup Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2">Initial Setup</h4>
                        <p className="text-sm text-gray-600 mb-2">
                            To create your first admin user, run this SQL command in your Supabase SQL editor:
                        </p>
                        <code className="block p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                            INSERT INTO admin_users (user_id, role, created_by) <br />
                            VALUES ('your-user-id-here', 'super_admin', 'your-user-id-here');
                        </code>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Finding Your User ID</h4>
                        <ol className="text-sm text-gray-600 space-y-1">
                            <li>1. Sign up/login to your app</li>
                            <li>2. Go to Supabase Dashboard → Authentication → Users</li>
                            <li>3. Find your user and copy the ID</li>
                            <li>4. Replace 'your-user-id-here' in the SQL above</li>
                        </ol>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Role Permissions</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li><strong>Admin:</strong> Can view analytics, manage users, but cannot add/remove other admins</li>
                            <li><strong>Super Admin:</strong> Full access including admin user management</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}