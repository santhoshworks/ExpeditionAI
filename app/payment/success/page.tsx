import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

function PaymentSuccessContent() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to Pro!</CardTitle>
                    <CardDescription>
                        Your subscription is now active.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-full text-sm text-indigo-700 dark:text-indigo-300">
                            <Sparkles className="h-4 w-4" />
                            Pro Member
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You now have access to all 8 AI models including GPT-4o, Claude Sonnet, and more.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Link href="/dashboard" className="block">
                            <Button className="w-full">
                                Start Exploring
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/settings" className="block">
                            <Button variant="outline" className="w-full">
                                Manage Subscription
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