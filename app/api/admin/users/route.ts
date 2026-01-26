import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
    try {
        // Check admin access
        await requireAdmin()

        const supabase = await createClient()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const tier = searchParams.get('tier') || ''

        const offset = (page - 1) * limit

        // Build the main query
        let baseQuery = supabase
            .from('profiles')
            .select('id, email, full_name, created_at')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        // Apply search filter
        if (search) {
            baseQuery = baseQuery.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
        }

        const { data: baseUsers, error: baseError } = await baseQuery

        if (baseError) {
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
        }

        // Enrich with related data
        const enrichedUsers = []

        for (const user of baseUsers || []) {
            // Get user credits
            const { data: userCredits } = await supabase
                .from('user_credits')
                .select('credits, tier, trails_today, last_trail_date')
                .eq('user_id', user.id)
                .single()

            // Get user streaks
            const { data: userStreaks } = await supabase
                .from('user_learning_streaks')
                .select('current_streak, longest_streak, total_active_days')
                .eq('user_id', user.id)
                .single()

            // Get admin status
            const { data: adminData } = await supabase
                .from('admin_users')
                .select('role, is_active')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .single()

            enrichedUsers.push({
                ...user,
                user_credits: userCredits ? [userCredits] : [],
                user_learning_streaks: userStreaks ? [userStreaks] : [],
                admin_users: adminData ? [adminData] : []
            })
        }

        // Apply tier filter after enrichment
        let filteredUsers = enrichedUsers
        if (tier && tier !== 'all') {
            filteredUsers = enrichedUsers.filter(user =>
                user.user_credits.length > 0 && user.user_credits[0].tier === tier
            )
        }

        // Get total count for pagination
        const { count: totalCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        return NextResponse.json({
            users: filteredUsers || [],
            pagination: {
                page,
                limit,
                total: totalCount || 0,
                pages: Math.ceil((totalCount || 0) / limit)
            }
        })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // Check admin access
        await requireAdmin()

        const supabase = await createClient()
        const { userId, action, value } = await request.json()

        switch (action) {
            case 'updateTier':
                const { error: tierError } = await supabase
                    .from('user_credits')
                    .update({ tier: value })
                    .eq('user_id', userId)

                if (tierError) {
                    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 })
                }
                break

            case 'addCredits':
                const { data: currentCredits } = await supabase
                    .from('user_credits')
                    .select('credits')
                    .eq('user_id', userId)
                    .single()

                if (currentCredits) {
                    const newCredits = parseFloat(currentCredits.credits.toString()) + parseFloat(value)

                    const { error: creditsError } = await supabase
                        .from('user_credits')
                        .update({ credits: newCredits })
                        .eq('user_id', userId)

                    if (creditsError) {
                        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
                    }

                    // Log transaction
                    await supabase
                        .from('credit_transactions')
                        .insert({
                            user_id: userId,
                            amount: parseFloat(value),
                            type: 'add',
                            description: 'Admin credit adjustment',
                            balance_after: newCredits
                        })
                }
                break

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Check admin access
        await requireAdmin()

        const supabase = await createClient()
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Get current admin user to prevent self-deletion
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser?.id === userId) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // Check if target user is an admin (optional safety check)
        const { data: targetAdminCheck } = await supabase
            .from('admin_users')
            .select('role, is_active')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single()

        if (targetAdminCheck) {
            // Only super_admin can delete other admins
            const { data: currentAdminCheck } = await supabase
                .from('admin_users')
                .select('role')
                .eq('user_id', currentUser?.id)
                .eq('is_active', true)
                .single()

            if (!currentAdminCheck || currentAdminCheck.role !== 'super_admin') {
                return NextResponse.json({
                    error: 'Only super admins can delete admin users'
                }, { status: 403 })
            }
        }

        // Delete user from auth.users (this will cascade delete all related data due to foreign key constraints)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

        if (deleteError) {
            console.error('Failed to delete user:', deleteError)
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'User deleted successfully' })

    } catch (error) {
        console.error('Delete user error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}