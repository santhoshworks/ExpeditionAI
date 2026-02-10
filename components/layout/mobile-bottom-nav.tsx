"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Settings,
} from "lucide-react"
import { useMobileNav } from "./mobile-nav-provider"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Expedition", href: "/expedition", icon: Compass, isExpedition: true },
  { name: "Wishlist", href: "/wishlist", icon: BookOpen },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { currentExpeditionId } = useMobileNav()

  const isActive = (item: typeof navItems[0]) => {
    if (item.isExpedition) {
      return pathname.includes("/expedition/")
    }
    return pathname === item.href
  }

  const getHref = (item: typeof navItems[0]) => {
    if (item.isExpedition && currentExpeditionId) {
      return `/expedition/${currentExpeditionId}`
    }
    if (item.isExpedition) {
      // If no expedition, go to dashboard
      return "/dashboard"
    }
    return item.href
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 mobile-safe-area"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item)
          const href = getHref(item)

          // Don't show expedition tab if no expedition and we're not on expedition page
          if (item.isExpedition && !currentExpeditionId && !pathname.includes("/expedition/")) {
            return null
          }

          return (
            <Link
              key={item.name}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 transition-colors touch-target",
                active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 active:text-slate-700 dark:active:text-slate-300"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-2xl transition-all",
                active && "bg-indigo-100 dark:bg-indigo-950"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  active && "scale-110"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-semibold mt-0.5 truncate max-w-full",
                active && "font-bold"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
