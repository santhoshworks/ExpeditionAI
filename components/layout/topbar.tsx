"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useExpeditions } from "@/lib/queries"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Bell, Search, Menu, LayoutDashboard, Settings, LogOut, Compass } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Topbar() {
    const pathname = usePathname()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: expeditions, isLoading } = useExpeditions()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        if (pathname.includes("/expedition/")) {
            return currentExpedition?.title || "Loading Expedition..."
        }
        if (pathname === "/settings") return "Settings"
        return "ExplorerAI"
    }

    return (
        <>
            <header className="h-16 border-b bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-20">
                {/* Left side - Logo and Navigation */}
                <div className="flex items-center gap-6">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden h-8 w-8"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="h-4 w-4" />
                    </Button>

                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
                            <Compass className="w-5 h-5 animate-pulse-slow" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 hidden sm:block">
                            ExplorerAI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navigationItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group relative",
                                        pathname === item.href
                                            ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(var(--primary),0.05)]"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-4 h-4 transition-transform group-hover:scale-110",
                                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                                    )} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                    {pathname === item.href && (
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                    )}
                                </div>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right side - Search and User Menu */}
                <div className="flex items-center gap-2 md:gap-4">
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

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed left-0 top-0 h-full w-64 bg-card/95 backdrop-blur-xl border-r z-50 md:hidden">
                        <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
                    </div>
                </>
            )}
        </>
    )
}

// Mobile sidebar component
function MobileSidebar({ onClose }: { onClose: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            queryClient.clear()
            router.push("/login")
            onClose()
        } catch (error) {
            console.error("Error signing out:", error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <div className="flex flex-col h-full p-4">
            <Link href="/dashboard" className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity" onClick={onClose}>
                <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
                    <Compass className="w-5 h-5 animate-pulse-slow" />
                </div>
                <span className="text-xl font-bold">ExplorerAI</span>
            </Link>

            <nav className="flex-1 space-y-2">
                {navigationItems.map((item) => (
                    <button
                        key={item.href}
                        onClick={() => {
                            router.push(item.href)
                            onClose()
                        }}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                            pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="border-t pt-4">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LogOut className="w-5 h-5" />
                    <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
                </button>
            </div>
        </div>
    )
}
