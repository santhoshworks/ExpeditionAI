import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                        <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
                    <CardDescription>
                        Your payment was cancelled. No charges were made to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            You can try again anytime or continue using the free tier.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Link href="/pricing" className="block">
                            <Button className="w-full">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </Link>
                        <Link href="/dashboard" className="block">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Continue with Free
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}