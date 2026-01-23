import { createClient } from '@/lib/supabase/server'
import { createClient as createClientClient } from '@/lib/supabase/client'

export type AdminRole = 'admin' | 'super_admin'

export interface AdminUser {
    user_id: string
    role: AdminRole
    permissions: string[]
    is_active: boolean
}

/**
 * Check if the current user is an admin (server-side)
 */
export async function isAdmin(userId?: string): Promise<boolean> {
    try {
        const supabase = await createClient()

        // If userId is provided, check that user, otherwise check current user
        if (userId) {
            const { data, error } = await supabase.rpc('is_admin', { p_user_id: userId })
            return !error && data === true
        }

        // Check current authenticated user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data, error } = await supabase.rpc('is_admin', { p_user_id: user.id })
        return !error && data === true
    } catch (error) {
        console.error('Error checking admin status:', error)
        return false
    }
}

/**
 * Check if the current user has a specific admin role (server-side)
 */
export async function hasAdminRole(role: AdminRole, userId?: string): Promise<boolean> {
    try {
        const supabase = await createClient()

        if (userId) {
            const { data, error } = await supabase.rpc('has_admin_role', {
                p_role: role,
                p_user_id: userId
            })
            return !error && data === true
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data, error } = await supabase.rpc('has_admin_role', {
            p_role: role,
            p_user_id: user.id
        })
        return !error && data === true
    } catch (error) {
        console.error('Error checking admin role:', error)
        return false
    }
}

/**
 * Get admin user details (server-side)
 */
export async function getAdminUser(userId?: string): Promise<AdminUser | null> {
    try {
        const supabase = await createClient()

        if (userId) {
            const { data, error } = await supabase.rpc('get_admin_user', { p_user_id: userId })
            return !error && data && data.length > 0 ? data[0] : null
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase.rpc('get_admin_user', { p_user_id: user.id })
        return !error && data && data.length > 0 ? data[0] : null
    } catch (error) {
        console.error('Error getting admin user:', error)
        return null
    }
}

/**
 * Client-side admin check hook
 */
export function useIsAdmin() {
    const supabase = createClientClient()

    const checkAdmin = async (): Promise<boolean> => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return false

            const { data, error } = await supabase.rpc('is_admin', { p_user_id: user.id })
            return !error && data === true
        } catch (error) {
            console.error('Error checking admin status:', error)
            return false
        }
    }

    return { checkAdmin }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin(): Promise<void> {
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
        throw new Error('Admin access required')
    }
}

/**
 * Require specific admin role - throws error if doesn't have role
 */
export async function requireAdminRole(role: AdminRole): Promise<void> {
    const hasRole = await hasAdminRole(role)
    if (!hasRole) {
        throw new Error(`Admin role '${role}' required`)
    }
}

/**
 * Add a new admin user (requires super_admin role)
 */
export async function addAdminUser(
    targetUserId: string,
    role: AdminRole = 'admin',
    permissions: string[] = []
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if current user is super admin
        await requireAdminRole('super_admin')

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { error } = await supabase
            .from('admin_users')
            .insert({
                user_id: targetUserId,
                role,
                permissions,
                created_by: user.id
            })

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Remove admin access (requires super_admin role)
 */
export async function removeAdminUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await requireAdminRole('super_admin')

        const supabase = await createClient()

        const { error } = await supabase
            .from('admin_users')
            .update({ is_active: false })
            .eq('user_id', targetUserId)

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}