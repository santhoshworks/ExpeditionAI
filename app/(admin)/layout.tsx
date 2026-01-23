import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { isAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is authenticated
    if (!user) {
        redirect('/login')
    }

    // Debug: Log user info
    console.log('Current user ID:', user.id)
    console.log('Current user email:', user.email)

    // Check if user is an admin
    try {
        const userIsAdmin = await isAdmin()
        console.log('Is admin check result:', userIsAdmin)

        // Debug: Check admin_users table directly
        const { data: adminCheck, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single()

        console.log('Direct admin check:', adminCheck, error)

        if (!userIsAdmin) {
            console.log('Admin check failed, redirecting to dashboard')
            redirect('/dashboard')
        }
    } catch (error) {
        console.error('Admin check error:', error)
        redirect('/dashboard')
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}