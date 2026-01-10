'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Zap, Sparkles } from 'lucide-react'
import { TIER_CONFIGS } from '@/lib/constants'
import { CheckoutButton } from './checkout-button'
import type { UserTier } from '@/lib/constants'

interface PaymentStatusProps {
    userTier: UserTier
    credits: number
    className?: string
}

export function PaymentStatus({ userTier, credits, className }: PaymentStatusProps) {
    const tierConfig = TIER_CONFIGS[userTier]

    const getTierIcon = (tier: UserTier) => {
        switch (tier) {
            case 'basic':
                return <Zap className="h-4 w-4 text-yellow-500" />
            case 'pro':
                return <Sparkles className="h-4 w-4 text-orange-500" />
            default:
                return <CreditCard className="h-4 w-4 text-gray-500" />
        }
    }

    const getTierColor = (tier: UserTier) => {
        switch (tier) {
            case 'basic':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'pro':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        {getTierIcon(userTier)}
                        Current Plan
                    </CardTitle>
                    <Badge className={getTierColor(userTier)}>
                        {tierConfig.name}
                    </Badge>
                </div>
                <CardDescription>
                    {credits} credits remaining
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {userTier === 'free' && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Upgrade to unlock premium models and remove daily limits.
                        </p>
                        <div className="flex gap-2">
                            <CheckoutButton
                                tier="basic"
                                price={TIER_CONFIGS.basic.price}
                                variant="outline"
                                className="flex-1"
                            >
                                Basic - $5
                            </CheckoutButton>
                            <CheckoutButton
                                tier="pro"
                                price={TIER_CONFIGS.pro.price}
                                className="flex-1"
                            >
                                Pro - $15
                            </CheckoutButton>
                        </div>
                    </div>
                )}

                {userTier === 'basic' && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Upgrade to Pro for access to GPT-4o and Claude models.
                        </p>
                        <CheckoutButton
                            tier="pro"
                            price={TIER_CONFIGS.pro.price}
                            className="w-full"
                        >
                            Upgrade to Pro - $15
                        </CheckoutButton>
                    </div>
                )}

                {userTier === 'pro' && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            You have access to all premium models and features.
                        </p>
                        {credits < 50 && (
                            <p className="text-sm text-orange-600 dark:text-orange-400">
                                Running low on credits. Consider purchasing more to continue using premium models.
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}