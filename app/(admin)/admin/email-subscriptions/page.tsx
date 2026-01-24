import { EmailSubscriptions } from '@/components/admin/email-subscriptions'

export default function EmailSubscriptionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Email Subscriptions
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage newsletter subscriptions and email marketing lists
                </p>
            </div>

            <EmailSubscriptions />
        </div>
    )
}