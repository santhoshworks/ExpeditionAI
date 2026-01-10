import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { TIER_CONFIGS } from '@/lib/constants'

function PaymentSuccessContent() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                    <CardDescription>
                        Your account has been upgraded and credits have been added.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            You can now access premium models and features.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Your credits have been added to your account and are ready to use.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Link href="/dashboard" className="block">
                            <Button className="w-full">
                                Start Exploring
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/pricing" className="block">
                            <Button variant="outline" className="w-full">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}