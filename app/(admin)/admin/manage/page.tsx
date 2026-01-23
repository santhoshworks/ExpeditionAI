import { AdminManagement } from '@/components/admin/admin-management'

export default function AdminManagePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage admin users and permissions (Super Admin only)
                </p>
            </div>

            <AdminManagement />
        </div>
    )
}