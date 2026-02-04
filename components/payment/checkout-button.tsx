'use client'

import { useRouter } from 'next/navigation'
import { CTAButton } from '@/components/ui/cta-button'
import { useAuth } from '@/hooks/use-auth'

interface CheckoutButtonProps {
    children: React.ReactNode
    /** Text to show when user is not authenticated (defaults to children) */
    unauthenticatedChildren?: React.ReactNode
    className?: string
    variant?: 'primary' | 'secondary'
    size?: 'sm' | 'default' | 'lg' | 'xl'
}

/**
 * Button to initiate Pro tier checkout
 * Always redirects to /checkout page which handles:
 * - Authentication (redirects to signup if needed)
 * - Billing country collection (required for tax compliance)
 * - Terms acceptance
 * - Payment initiation
 */
export function CheckoutButton({
    children,
    unauthenticatedChildren,
    className,
    variant = 'primary',
    size = 'lg'
}: CheckoutButtonProps) {
    const { isLoggedIn } = useAuth()
    const router = useRouter()

    const handleCheckout = () => {
        // Always redirect to /checkout page for proper billing info collection
        router.push('/checkout')
    }

    // Determine which text to show
    const buttonContent = !isLoggedIn && unauthenticatedChildren
        ? unauthenticatedChildren
        : children

    return (
        <CTAButton
            onClick={handleCheckout}
            className={className}
            variant={variant}
            size={size}
        >
            {buttonContent}
        </CTAButton>
    )
}