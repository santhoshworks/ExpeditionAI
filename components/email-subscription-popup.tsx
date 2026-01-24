"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Mail, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface EmailSubscriptionPopupProps {
    isLoggedIn: boolean
}

export function EmailSubscriptionPopup({ isLoggedIn }: EmailSubscriptionPopupProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Don't show popup if user is logged in
        if (isLoggedIn) return

        // Check if user has already dismissed the popup
        const dismissed = localStorage.getItem('email-popup-dismissed')
        if (dismissed) {
            setIsDismissed(true)
            return
        }

        // Show popup after 5 seconds
        const timer = setTimeout(() => {
            setIsOpen(true)
        }, 5000)

        return () => clearTimeout(timer)
    }, [isLoggedIn])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !email.includes('@')) {
            toast.error("Please enter a valid email address.")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message || "You've been subscribed to our newsletter!")
                setIsOpen(false)
                localStorage.setItem('email-popup-dismissed', 'true')
            } else {
                toast.error(data.error || "Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error('Subscription error:', error)
            toast.error("Failed to subscribe. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        localStorage.setItem('email-popup-dismissed', 'true')
    }

    // Don't render if user is logged in or has dismissed
    if (isLoggedIn || isDismissed) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
                >
                    <X className="h-4 w-4 text-white" />
                    <span className="sr-only">Close</span>
                </button>

                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl translate-y-12 -translate-x-12" />

                <div className="relative z-10 p-6 space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo-500/30">
                            <Mail className="w-8 h-8 text-indigo-400" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-3">
                        <h3 className="text-2xl font-bold tracking-tight">
                            Stay ahead of the curve
                        </h3>
                        <p className="text-slate-300 leading-relaxed">
                            Get exclusive tips, AI learning strategies, and early access to new features that help you learn 3x faster.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20 h-12 pr-4"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Subscribing...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Get Learning Tips
                                </div>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-xs text-slate-400 text-center">
                        No spam, ever. Unsubscribe anytime with one click.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}