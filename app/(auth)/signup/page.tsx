"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Provider } from "@supabase/supabase-js"
import { SITE_CONFIG } from "@/lib/config"
import { Network, ArrowRight, Github } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<Provider | null>(null)

  const handleSocialSignup = async (provider: Provider) => {
    setError(null)
    setSocialLoading(provider)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/api/auth/callback`

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-50 dark:bg-violet-900/10 rounded-full blur-3xl opacity-50" />

      <div className="relative w-full max-w-[440px] px-6">
        <div className="flex flex-col items-center mb-10 text-center">
          <Link href="/" className="flex flex-col items-center gap-4 group">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {SITE_CONFIG.name}
              </h1>
              <p className="text-slate-500 font-medium">Embark on your learning journey</p>
            </div>
          </Link>
        </div>

        <Card className="border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 px-10 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-500 font-medium">Join thousands of students mapping their minds</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4 space-y-8">
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}
              <div className="space-y-2.5">
                <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 px-5 text-base font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 px-5 text-base font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2.5">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 px-5 text-base font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-bold text-lg shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-98"
                disabled={loading || socialLoading !== null}
              >
                {loading ? "Creating..." : "Start Expedition"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-slate-400 font-bold tracking-widest">Or connect with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("google")}
                disabled={loading || socialLoading !== null}
                className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold gap-3"
              >
                {socialLoading === "google" ? (
                  <span className="animate-spin text-indigo-600">...</span>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignup("github")}
                disabled={loading || socialLoading !== null}
                className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold gap-3"
              >
                {socialLoading === "github" ? (
                  <span className="animate-spin text-indigo-600">...</span>
                ) : (
                  <Github className="h-5 w-5" />
                )}
                GitHub
              </Button>
            </div>

            <div className="text-center pt-2">
              <span className="text-slate-500 font-medium">Already have an account? </span>
              <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-slate-400 text-sm font-medium">
          By signing up, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
