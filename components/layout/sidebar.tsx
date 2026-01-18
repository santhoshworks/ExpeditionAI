"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Settings,
    Compass,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    BookOpen,
    ArrowLeft,
    Search,
    User,
    Moon,
    Sun,
    Monitor,
    Network
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { SITE_CONFIG } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useExploreStore } from "@/lib/store"
import { useExpeditions } from "@/lib/queries"
import { useTheme } from "@/components/theme-provider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Wishlist", href: "/wishlist", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const queryClient = useQueryClient()
    const { data: expeditions } = useExpeditions()
    const { setTheme, theme } = useTheme()

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

    const getThemeIcon = () => {
        switch (theme) {
            case "light":
                return <Sun className="w-5 h-5" />
            case "dark":
                return <Moon className="w-5 h-5" />
            default:
                return <Monitor className="w-5 h-5" />
        }
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
                    "h-screen border-r bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl flex flex-col transition-all duration-300 relative z-50",
                    // Desktop styles
                    "hidden md:flex",
                    collapsed ? "w-16" : "w-60",
                    // Mobile styles - overlay
                    "md:relative fixed left-0 top-0",
                    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Mobile close button */}
                <div className="md:hidden absolute top-6 right-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-500 rounded-full hover:bg-slate-100"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 mb-2 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20">
                        <Network className="w-6 h-6" />
                    </div>
                    {!collapsed && (
                        <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                            {SITE_CONFIG.name}
                        </span>
                    )}
                </div>

                {/* Search Bar */}
                <div className="px-5 pb-6">
                    {collapsed ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-full h-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900"
                            title="Quick Search"
                        >
                            <Search className="w-5 h-5 text-slate-400" />
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 group focus-within:ring-2 ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all">
                            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors shrink-0" />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-slate-400 font-medium"
                            />
                        </div>
                    )}
                </div>

                <div className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                    {!collapsed && <p className="px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Main Menu</p>}
                    {sidebarItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                            <div
                                className={cn(
                                    "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 group relative",
                                    pathname === item.href
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform group-hover:scale-110 shrink-0",
                                    pathname === item.href ? "" : "opacity-70"
                                )} />
                                {!collapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                                {!collapsed && pathname === item.href && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Theme Toggle and Profile Section */}
                <div className="p-4 mt-auto space-y-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Theme Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3.5 h-12 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors",
                                    collapsed && "px-0 justify-center"
                                )}
                            >
                                {getThemeIcon()}
                                {!collapsed && <span className="capitalize font-bold text-sm tracking-tight">{theme || "System Mode"}</span>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={collapsed ? "center" : "start"} side="right" className="rounded-xl border-slate-200 dark:border-slate-800">
                            <DropdownMenuItem onClick={() => setTheme("light")} className="py-2 rounded-lg cursor-pointer">
                                <Sun className="mr-2 h-4 w-4" />
                                <span className="font-medium">Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")} className="py-2 rounded-lg cursor-pointer">
                                <Moon className="mr-2 h-4 w-4" />
                                <span className="font-medium">Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")} className="py-2 rounded-lg cursor-pointer">
                                <Monitor className="mr-2 h-4 w-4" />
                                <span className="font-medium">System</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3.5 h-14 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2",
                                    collapsed && "px-0 justify-center"
                                )}
                            >
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 font-bold to-violet-600 shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center text-white shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                {!collapsed && (
                                    <div className="text-left overflow-hidden">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate tracking-tight">User Account</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Premium Plan</p>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={collapsed ? "center" : "start"} side="right" className="rounded-xl border-slate-200 dark:border-slate-800 w-56">
                            <DropdownMenuItem onClick={() => router.push("/settings")} className="py-3 rounded-lg cursor-pointer">
                                <Settings className="mr-3 h-4 w-4" />
                                <span className="font-bold text-sm">Account Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                            <DropdownMenuItem onClick={handleLogout} className="py-3 rounded-lg cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-50">
                                <LogOut className="mr-3 h-4 w-4" />
                                <span className="font-bold text-sm">Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Desktop collapse button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3.5 top-12 w-7 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hidden md:flex z-50 group"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" /> : <ChevronLeft className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />}
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
