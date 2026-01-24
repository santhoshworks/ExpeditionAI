"use client"

import { usePathname } from "next/navigation"
import { useExpeditions } from "@/lib/queries"
import { SITE_CONFIG } from "@/lib/config"

export function Topbar() {
    const pathname = usePathname()
    const { data: expeditions } = useExpeditions()

    // Find current expedition title if we're on an expedition page
    const expeditionId = pathname.split("/expedition/")[1]?.split("/")[0]
    const currentExpedition = expeditions?.find(e => e.id === expeditionId)

    const getPageTitle = () => {
        if (pathname === "/dashboard") return "Your Dashboard"
        if (pathname === "/wishlist") return "Learning Wishlist"
        if (pathname.includes("/expedition/")) {
            return currentExpedition?.title || "Loading Exploration..."
        }
        if (pathname === "/settings") return "Settings"
        return SITE_CONFIG.name
    }

    return (
        <header className="h-12 border-b bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-xl flex items-center px-4 md:px-6 z-20 shrink-0 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-violet-500/5 opacity-50" />
            <div className="absolute inset-0 bg-journal-pattern opacity-30" />

            {/* Page Title */}
            {!pathname.includes("/expedition/") && (
                <div className="min-w-0 relative z-10">
                    <h1 className="text-base font-medium truncate bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/80">
                        {getPageTitle()}
                    </h1>
                </div>
            )}
        </header>
    )
}
