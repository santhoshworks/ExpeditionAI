import { Compass } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="relative">
                {/* Pulsing glow background */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />

                {/* Animated Compass */}
                <div className="relative animate-spin-slow">
                    <Compass className="h-16 w-16 text-primary" />
                </div>
            </div>

            <div className="mt-8 space-y-2 text-center">
                <h2 className="text-xl font-medium animate-pulse">Mapping your path...</h2>
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                    Preparing your learning expedition for the next discovery.
                </p>
            </div>
        </div>
    )
}
