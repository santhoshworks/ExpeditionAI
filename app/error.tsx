"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
            <div className="space-y-6 max-w-md p-8 rounded-2xl border border-destructive/20 bg-destructive/5">
                <div className="bg-destructive/10 p-4 rounded-full w-fit mx-auto">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Something went wrong!</h1>
                    <p className="text-muted-foreground">
                        We encountered an unexpected storm on your learning expedition.
                        Don&apos;t worry, your progress is safe.
                    </p>
                    {error.digest && (
                        <p className="text-xs font-mono text-muted-foreground mt-2">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => reset()}
                        size="lg"
                        className="rounded-full gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
