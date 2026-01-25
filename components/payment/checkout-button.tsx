'use client'

import { useState } from 'react'
import { CTAButton } from '@/components/ui/cta-button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CheckoutButtonProps {
    tier: 'basic' | 'pro'
    price: number
    children: React.ReactNode
    className?: string
    variant?: 'primary' | 'secondary'
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function CheckoutButton({
    tier,
    price,
    children,
    className,
    variant = 'primary',
    size = 'lg'
}: CheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleCheckout = async () => {
        try {
            setIsLoading(true)

            const response = await fetch('/api/payments/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tier }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session')
            }

            // Redirect to Dodo checkout
            window.location.href = data.checkout_url

        } catch (error) {
            console.error('Checkout error:', error)
            toast({
                title: 'Payment Error',
                description: error instanceof Error ? error.message : 'Failed to start checkout process',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <CTAButton
            onClick={handleCheckout}
            disabled={isLoading}
            className={className}
            variant={variant}
            size={size}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                children
            )}
        </CTAButton>
    )
}