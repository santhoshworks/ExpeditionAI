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

    // Check if user is an admin
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
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