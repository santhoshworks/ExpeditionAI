import { PlatformAnalytics } from '@/components/admin/platform-analytics'

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Platform Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Detailed analytics and insights for subscription optimization
                </p>
            </div>

            <PlatformAnalytics />
        </div>
    )
}