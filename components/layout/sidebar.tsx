"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Settings,
    PlusCircle,
    Map as MapIcon,
    Compass,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    BookOpen,
    ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useExpeditions } from "@/lib/queries"

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Wishlist", href: "/wishlist", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: expeditions } = useExpeditions()

    // Check if we're on an expedition page
    const expeditionId = pathname.split("/expedition/")[1]?.split("/")[0]
    const currentExpedition = expeditions?.find(e => e.id === expeditionId)
    const isExpeditionPage = pathname.includes("/expedition/")

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        queryClient.clear()
        router.push("/login")
    }

    // Mobile menu toggle button (rendered in topbar)
    const MobileMenuButton = () => (
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
        >
            <Menu className="h-4 w-4" />
        </Button>
    )

    return (
        <>
            {/* Mobile Menu Button - exported for use in topbar */}
            <div className="md:hidden">
                <MobileMenuButton />
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "h-screen border-r bg-card/50 backdrop-blur-xl flex flex-col transition-all duration-300 relative z-50",
                    // Desktop styles
                    "hidden md:flex",
                    collapsed ? "w-16" : "w-64",
                    // Mobile styles - overlay
                    "md:relative fixed left-0 top-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Mobile close button */}
                <div className="md:hidden absolute top-4 right-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
                        <Compass className="w-5 h-5 animate-pulse-slow" />
                    </div>
                    {!collapsed && (
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                            ExplorerAI
                        </span>
                    )}
                </div>

                {/* Expedition Context - Show when on expedition pages */}
                {isExpeditionPage && currentExpedition && !collapsed && (
                    <div className="px-4 pb-4 border-b border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <ArrowLeft className="h-3 w-3" />
                                </Button>
                            </Link>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Current Expedition
                            </span>
                        </div>
                        <h2 className="text-sm font-semibold text-foreground truncate">
                            {currentExpedition.title}
                        </h2>
                        {currentExpedition.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {currentExpedition.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex-1 px-3 py-4 space-y-1">
                    {sidebarItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(var(--primary),0.05)]"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform group-hover:scale-110",
                                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                                )} />
                                {!collapsed && <span className="font-medium">{item.name}</span>}
                                {!collapsed && pathname === item.href && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="p-3 border-t">
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors",
                            collapsed && "px-2"
                        )}
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span>Logout</span>}
                    </Button>
                </div>

                {/* Desktop collapse button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background border rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform hidden md:flex"
                >
                    {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>
            </div>
        </>
    )
}

// Export mobile menu button for use in topbar
export function MobileMenuButton() {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
        >
            <Menu className="h-4 w-4" />
        </Button>
    )
}
