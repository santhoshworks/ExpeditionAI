"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelSelector } from "@/components/chat/model-selector"
import { SimpleThemeToggle } from "@/components/theme-toggle"
import { useExploreStore } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Crown, Sparkles, Loader2, Calendar, AlertCircle } from "lucide-react"
import type { UserTier } from "@/lib/constants"

interface Subscription {
  id: string
  status: 'active' | 'cancelled' | 'on_hold' | 'expired' | 'pending'
  current_period_end: string | null
  cancelled_at: string | null
}

interface SubscriptionData {
  subscription: Subscription | null
  tier: UserTier
  hasActiveSubscription: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { userTier, setUserTier } = useExploreStore()
  const [loading, setLoading] = useState(false)
  const [tierLoading, setTierLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch subscription status on mount
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscriptionData(data)
          // Map old 'basic' tier to 'free' for backward compatibility
          let tier: UserTier = data.tier as UserTier
          if (tier === 'basic' as any) {
            tier = 'free'
          }
          setUserTier(tier)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
        // Fallback to fetching tier from user_credits
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase
              .from('user_credits')
              .select('tier')
              .eq('user_id', user.id)
              .single()
            if (data) {
              let tier: UserTier = data.tier as UserTier
              if (tier === 'basic' as any) {
                tier = 'free'
              }
              setUserTier(tier)
            }
          }
        } catch {
          console.error('Failed to fetch user tier')
        }
      } finally {
        setTierLoading(false)
      }
    }

    fetchSubscription()
  }, [setUserTier])

  const handleSubscriptionAction = async (action: 'cancel' | 'resume') => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} subscription`)
      }

      toast({
        title: action === 'cancel' ? 'Subscription Cancelled' : 'Subscription Resumed',
        description: data.message,
      })

      // Refresh subscription data
      const subResponse = await fetch('/api/subscription')
      if (subResponse.ok) {
        const subData = await subResponse.json()
        setSubscriptionData(subData)
        setUserTier(subData.tier)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    queryClient.clear()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tierLoading ? (
                <div className="animate-pulse h-20 bg-muted rounded-lg" />
              ) : (
                <>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {userTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                          </span>
                          {subscriptionData?.subscription && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              subscriptionData.subscription.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : subscriptionData.subscription.status === 'cancelled'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                            }`}>
                              {subscriptionData.subscription.status === 'active' ? 'Active' :
                               subscriptionData.subscription.status === 'cancelled' ? 'Cancelled' :
                               subscriptionData.subscription.status.charAt(0).toUpperCase() + subscriptionData.subscription.status.slice(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {userTier === 'pro'
                            ? 'Access to all 8 AI models including GPT-4o and Claude Sonnet'
                            : 'Access to 4 fast AI models'}
                        </p>
                      </div>
                      {userTier === 'pro' && subscriptionData?.subscription && (
                        <span className="text-lg font-semibold">$4.99/mo</span>
                      )}
                    </div>

                    {/* Subscription details for Pro users */}
                    {subscriptionData?.subscription && (
                      <div className="pt-3 border-t space-y-2">
                        {subscriptionData.subscription.current_period_end && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {subscriptionData.subscription.status === 'cancelled' ? (
                              <span>Access until {new Date(subscriptionData.subscription.current_period_end).toLocaleDateString()}</span>
                            ) : (
                              <span>Renews on {new Date(subscriptionData.subscription.current_period_end).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                        {subscriptionData.subscription.status === 'cancelled' && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                            <AlertCircle className="h-4 w-4" />
                            <span>Your subscription will not renew</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {userTier !== 'pro' && (
                      <Link href="/pricing" className="flex-1">
                        <Button variant="default" className="w-full">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </Link>
                    )}
                    {subscriptionData?.subscription?.status === 'active' && (
                      <Button
                        variant="outline"
                        onClick={() => handleSubscriptionAction('cancel')}
                        disabled={actionLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Cancel Subscription'
                        )}
                      </Button>
                    )}
                    {subscriptionData?.subscription?.status === 'cancelled' && (
                      <Button
                        variant="default"
                        onClick={() => handleSubscriptionAction('resume')}
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Resume Subscription'
                        )}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Model Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Default Model</CardTitle>
              <CardDescription>
                Choose your preferred AI model for conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">AI Model</label>
                  <p className="text-sm text-muted-foreground">
                    This model will be used for new conversations
                  </p>
                </div>
                <ModelSelector userTier={userTier} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Theme</label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light, dark, or system theme
                  </p>
                </div>
                <SimpleThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
