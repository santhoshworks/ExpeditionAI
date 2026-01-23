"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Mail } from "lucide-react"

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        })

        if (error) {
            setMessage({ type: "error", text: error.message })
        } else {
            setMessage({ type: "success", text: "Password reset link sent to your email." })
        }
        setLoading(false)
    }

    return (
        <Card className="shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/login" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Back to Login</span>
                </div>
                <CardTitle className="text-2xl font-semibold text-center">Reset your password</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and we'll send you a link to reset your password
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-10"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === "success"
                            ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-10" disabled={loading}>
                        {loading ? "Sending link..." : "Send reset link"}
                    </Button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Remember your password? </span>
                    <Link href="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium">
                        Sign in
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
