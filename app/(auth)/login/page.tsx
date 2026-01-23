"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Provider } from "@supabase/supabase-js"
import { Github } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<Provider | null>(null)

  const handleSocialLogin = async (provider: Provider) => {
    setError(null)
    setSocialLoading(provider)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/api/auth/callback`
      const redirect = searchParams.get("redirect")

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirect ? `${redirectTo}?redirect=${encodeURIComponent(redirect)}` : redirectTo,
        },
      })

      if (signInError) {
        setError(signInError.message)
        setSocialLoading(null)
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setSocialLoading(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      const redirect = searchParams.get("redirect") || "/dashboard"
      router.push(redirect)
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="h-10"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10"
            disabled={loading || socialLoading !== null}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            disabled={loading || socialLoading !== null}
            className="h-10"
          >
            {socialLoading === "google" ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSocialLogin("github")}
            disabled={loading || socialLoading !== null}
            className="h-10"
          >
            {socialLoading === "github" ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Github className="w-4 h-4" />
            )}
            GitHub
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
          <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
