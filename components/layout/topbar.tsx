"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useExpeditions } from "@/lib/queries"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Bell, Search, Menu, LayoutDashboard, Settings, LogOut, Compass, BookOpen } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ThemeToggle, SimpleThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

export function Topbar() {
    const pathname = usePathname()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: expeditions, isLoading } = useExpeditions()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            queryClient.clear()
            router.push("/login")
            router.refresh()
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

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
        return "ExplorerAI"
    }

    return (
        <header className="h-12 border-b bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
            {/* Left side - Minimal context for non-expedition pages only */}
            <div className="flex items-center gap-4 min-w-0">
                {!pathname.includes("/expedition/") && (
                    <div className="min-w-0">
                        <h1 className="text-base font-medium truncate">
                            {getPageTitle()}
                        </h1>
                    </div>
                )}
            </div>

            {/* Right side - Search and User Menu */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-auto">
                {/* Search - hidden on small mobile */}
                <div className="hidden lg:flex items-center gap-2 bg-accent/50 border rounded-full px-3 py-1.5 w-64 group focus-within:ring-2 ring-primary/20 transition-all">
                    <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search journeys..."
                        className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-muted-foreground/50"
                    />
                </div>

                {/* Mobile search button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                >
                    <Search className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 md:gap-2">
                    {/* Theme toggle */}
                    <ThemeToggle />

                    <button className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors relative">
                        <Bell className="w-4 h-4 md:w-5 md:h-5" />
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" title="User menu" aria-label="User menu" className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border p-0.5 ml-1 md:ml-2 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                    <User className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut} className="cursor-pointer text-destructive focus:text-destructive">
                                {isLoggingOut ? "Signing out..." : "Sign out"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
