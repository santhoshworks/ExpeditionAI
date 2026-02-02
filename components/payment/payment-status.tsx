'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Sparkles } from 'lucide-react'
import { TIER_CONFIGS } from '@/lib/constants'
import { CheckoutButton } from './checkout-button'
import type { UserTier } from '@/lib/constants'

interface PaymentStatusProps {
    userTier: UserTier
    className?: string
}

export function PaymentStatus({ userTier, className }: PaymentStatusProps) {
    const tierConfig = TIER_CONFIGS[userTier]

    const getTierIcon = (tier: UserTier) => {
        switch (tier) {
            case 'pro':
                return <Sparkles className="h-4 w-4 text-indigo-500" />
            default:
                return <CreditCard className="h-4 w-4 text-gray-500" />
        }
    }

    const getTierColor = (tier: UserTier) => {
        switch (tier) {
            case 'pro':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
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
                    {userTier === 'pro' ? 'All 8 AI models' : '4 fast AI models'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {userTier === 'free' && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Upgrade to Pro to unlock GPT-4o, Claude Sonnet, and other premium models.
                        </p>
                        <CheckoutButton className="w-full">
                            Upgrade to Pro - ${TIER_CONFIGS.pro.price}/mo
                        </CheckoutButton>
                    </div>
                )}

                {userTier === 'pro' && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            You have access to all 8 AI models and premium features.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}