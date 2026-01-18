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
            return currentExpedition?.title || "Loading Expedition..."
        }
        if (pathname === "/settings") return "Settings"
        return SITE_CONFIG.name
    }

    return (
        <header className="h-12 border-b bg-background/50 backdrop-blur-xl flex items-center px-4 md:px-6 z-20 shrink-0">
            {/* Page Title */}
            {!pathname.includes("/expedition/") && (
                <div className="min-w-0">
                    <h1 className="text-base font-medium truncate">
                        {getPageTitle()}
                    </h1>
                </div>
            )}
        </header>
    )
}
