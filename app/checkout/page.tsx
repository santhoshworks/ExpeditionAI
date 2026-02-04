'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { TIER_CONFIGS } from '@/lib/constants'
import { CTAButton } from '@/components/ui/cta-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Loader2,
    Shield,
    Lock,
    Check,
    CreditCard,
    Sparkles,
    ArrowLeft,
} from 'lucide-react'

// ISO 3166-1 alpha-2 country codes for billing
const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'IE', name: 'Ireland' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'SG', name: 'Singapore' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'PT', name: 'Portugal' },
    { code: 'PL', name: 'Poland' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'IL', name: 'Israel' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'PH', name: 'Philippines' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'RO', name: 'Romania' },
    { code: 'HU', name: 'Hungary' },
    { code: 'GR', name: 'Greece' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
].sort((a, b) => a.name.localeCompare(b.name))

/**
 * Checkout page with order summary, billing info, and terms acceptance
 * Follows industry best practices for payment pages
 */
export default function CheckoutPage() {
    const { user, isLoggedIn, loading: authLoading } = useAuth()
    const router = useRouter()
    const hasRedirected = useRef(false)

    const [billingCountry, setBillingCountry] = useState('')
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const proConfig = TIER_CONFIGS.pro

    // Redirect to signup if not authenticated
    useEffect(() => {
        if (authLoading) return

        if (!isLoggedIn && !hasRedirected.current) {
            hasRedirected.current = true
            router.push('/signup?redirect=/checkout')
        }
    }, [isLoggedIn, authLoading, router])

    const handleCheckout = async () => {
        if (!billingCountry) {
            setError('Please select your billing country')
            return
        }

        if (!termsAccepted) {
            setError('Please accept the terms and conditions')
            return
        }

        setError(null)
        setIsLoading(true)

        try {
            const response = await fetch('/api/payments/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tier: 'pro',
                    billingCountry,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 400 && data.error?.includes('already have')) {
                    router.push('/settings?message=already_subscribed')
                    return
                }
                throw new Error(data.error || 'Failed to create checkout session')
            }

            // Redirect to Dodo checkout
            window.location.href = data.checkout_url

        } catch (err) {
            console.error('Checkout error:', err)
            setError(err instanceof Error ? err.message : 'Failed to start checkout')
            setIsLoading(false)
        }
    }

    // Show loading while checking auth
    if (authLoading || !isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-lg mx-auto space-y-6">
                {/* Back link */}
                <Link
                    href="/pricing"
                    className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to pricing
                </Link>

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Complete your purchase
                    </h1>
                    <p className="text-slate-500">
                        You&apos;re one step away from unlocking Pro features
                    </p>
                </div>

                {/* Order Summary Card */}
                <Card className="border-indigo-100 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            Order Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Product info */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    ThoughtMap Pro
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Monthly subscription
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-slate-900">
                                        ${proConfig.price}
                                    </span>
                                    {proConfig.originalPrice && (
                                        <span className="text-sm text-slate-400 line-through">
                                            ${proConfig.originalPrice}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500">/month</p>
                            </div>
                        </div>

                        {/* Features list */}
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm font-medium text-slate-700 mb-3">
                                What&apos;s included:
                            </p>
                            <ul className="space-y-2">
                                {proConfig.features.slice(1).map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Total */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-900">
                                    Total today
                                </span>
                                <span className="text-xl font-bold text-slate-900">
                                    ${proConfig.price}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Tax calculated at checkout. Cancel anytime.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Info Card */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="h-5 w-5 text-slate-600" />
                            Billing Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Email (read-only from auth) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-600 text-sm">
                                {user?.email}
                            </div>
                            <p className="text-xs text-slate-500">
                                Receipt will be sent to this email
                            </p>
                        </div>

                        {/* Billing Country */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                Billing Country <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={billingCountry}
                                onValueChange={setBillingCountry}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {COUNTRIES.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                Required for tax calculation
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Terms acceptance */}
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200">
                    <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                        className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                        I agree to the{' '}
                        <Link href="/terms" className="text-indigo-600 hover:underline" target="_blank">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-indigo-600 hover:underline" target="_blank">
                            Privacy Policy
                        </Link>
                        . I understand this is a recurring subscription that I can cancel anytime.
                    </label>
                </div>

                {/* Error message */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Checkout button */}
                <CTAButton
                    onClick={handleCheckout}
                    disabled={isLoading || !billingCountry || !termsAccepted}
                    variant="primary"
                    size="lg"
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Lock className="mr-2 h-5 w-5" />
                            Pay ${proConfig.price}/month
                        </>
                    )}
                </CTAButton>

                {/* Security badges */}
                <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>Secure checkout</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Lock className="h-4 w-4 text-green-600" />
                        <span>SSL encrypted</span>
                    </div>
                </div>

                {/* Payment provider info */}
                <p className="text-center text-xs text-slate-400">
                    Payments securely processed by Dodo Payments.
                    <br />
                    Dodo handles tax collection and compliance in 150+ countries.
                </p>

                {/* Refund policy */}
                <div className="text-center text-xs text-slate-500 pt-2">
                    <p>
                        Not satisfied? Contact us within 7 days for a full refund.
                        <br />
                        <Link href="/faq" className="text-indigo-600 hover:underline">
                            View our refund policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
