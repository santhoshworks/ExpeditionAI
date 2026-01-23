import { AdminOverview } from '@/components/admin/admin-overview'
import { UserMetrics } from '@/components/admin/user-metrics'
import { SubscriptionMetrics } from '@/components/admin/subscription-metrics'
import { ActivityMetrics } from '@/components/admin/activity-metrics'

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Monitor user activity, subscriptions, and platform metrics
                </p>
            </div>

            <AdminOverview />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UserMetrics />
                <SubscriptionMetrics />
            </div>

            <ActivityMetrics />
        </div>
    )
}