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
import { Crown, Sparkles } from "lucide-react"
import type { UserTier } from "@/lib/constants"

export default function SettingsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { userTier, setUserTier } = useExploreStore()
  const [loading, setLoading] = useState(false)
  const [tierLoading, setTierLoading] = useState(true)

  // Fetch user tier on mount
  useEffect(() => {
    async function fetchUserTier() {
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
            // Map old 'basic' tier to 'free' for backward compatibility
            let tier: UserTier = data.tier as UserTier
            if (tier === 'basic' as any) {
              tier = 'free'
            }
            setUserTier(tier)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user tier:', error)
      } finally {
        setTierLoading(false)
      }
    }

    fetchUserTier()
  }, [setUserTier])

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
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {userTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                      </span>
                      {userTier === 'pro' && (
                        <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {userTier === 'pro'
                        ? 'Access to all 8 AI models including GPT-4o and Claude Sonnet'
                        : 'Access to 4 fast AI models'}
                    </p>
                  </div>
                  {userTier !== 'pro' && (
                    <Link href="/pricing">
                      <Button variant="default" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                </div>
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
