import { PaymentDashboard } from '@/components/admin/payment-dashboard'

export default function PaymentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Payment Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Monitor transactions, revenue, and payment analytics
                </p>
            </div>

            <PaymentDashboard />
        </div>
    )
}