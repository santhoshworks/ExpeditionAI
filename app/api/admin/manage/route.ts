import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRole, addAdminUser, removeAdminUser } from '@/lib/admin'

export async function GET() {
    try {
        // Check super admin access
        await requireAdminRole('super_admin')

        const supabase = await createClient()

        // Get all admin users
        const { data: adminUsers, error } = await supabase
            .from('admin_users')
            .select(`
        id,
        user_id,
        role,
        permissions,
        is_active,
        created_at,
        profiles!inner(email, full_name)
      `)
            .eq('is_active', true)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 })
        }

        return NextResponse.json({ adminUsers })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { action, userId, role, permissions } = await request.json()

        switch (action) {
            case 'add':
                const addResult = await addAdminUser(userId, role, permissions)
                if (!addResult.success) {
                    return NextResponse.json({ error: addResult.error }, { status: 400 })
                }
                return NextResponse.json({ success: true })

            case 'remove':
                const removeResult = await removeAdminUser(userId)
                if (!removeResult.success) {
                    return NextResponse.json({ error: removeResult.error }, { status: 400 })
                }
                return NextResponse.json({ success: true })

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}