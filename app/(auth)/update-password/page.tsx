"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Lock, Eye, EyeOff } from "lucide-react"

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push("/dashboard?message=Password updated successfully")
        }
    }

    return (
        <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold">Set new password</CardTitle>
                <CardDescription>
                    Choose a strong password for your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            New password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-10"
                                required
                                minLength={6}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Confirm new password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 h-10"
                                required
                                disabled={loading}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Must be at least 6 characters long
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-md text-sm bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-10" disabled={loading}>
                        {loading ? "Updating password..." : "Update password"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
