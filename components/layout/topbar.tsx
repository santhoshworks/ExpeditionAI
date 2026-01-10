"use client"

import { usePathname, useRouter } from "next/navigation"
import { useExpeditions } from "@/lib/queries"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Bell, Search } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

export function Topbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { data: expeditions, isLoading } = useExpeditions()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    // Find current expedition title if we're on an expedition page
    const expeditionId = pathname.split("/expedition/")[1]?.split("/")[0]
    const currentExpedition = expeditions?.find(e => e.id === expeditionId)

    const getPageTitle = () => {
        if (pathname === "/dashboard") return "Your Dashboard"
        if (pathname.includes("/expedition/")) {
            return currentExpedition?.title || "Loading Expedition..."
        }
        if (pathname === "/settings") return "Settings"
        return "ExplorerAI"
    }

    return (
        <header className="h-16 border-b bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 z-20">
            <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight leading-none">
                    {getPageTitle()}
                </h1>
                {pathname === "/dashboard" && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Track and manage your learning journeys
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-accent/50 border rounded-full px-3 py-1.5 w-64 group focus-within:ring-2 ring-primary/20 transition-all">
                    <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search journeys..."
                        className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-muted-foreground/50"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button type="button" title="User menu" aria-label="User menu" className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border p-0.5 ml-2 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20">
                                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
