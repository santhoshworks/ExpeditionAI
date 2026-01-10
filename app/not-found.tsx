import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Compass } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
            <div className="space-y-6 max-w-md">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <Compass className="h-24 w-24 text-primary mx-auto relative animate-bounce-slow" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Expedition Lost</h1>
                    <p className="text-muted-foreground text-lg">
                        We couldn&apos;t find the trail you&apos;re looking for. It might have been moved or never existed.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="rounded-full">
                        <Link href="/dashboard">Back to Base Camp</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full">
                        <Link href="/">Return Home</Link>
                    </Button>
                </div>
            </div>

            <div className="mt-20 text-sm text-muted-foreground animate-pulse">
                Error Code: 404_TRAIL_NOT_FOUND
            </div>
        </div>
    )
}
