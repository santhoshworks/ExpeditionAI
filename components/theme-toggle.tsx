"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Simple toggle version for inline use
export function SimpleThemeToggle() {
    const { setTheme, theme } = useTheme()

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("system")
        } else {
            setTheme("light")
        }
    }

    const getIcon = () => {
        switch (theme) {
            case "light":
                return <Sun className="h-4 w-4" />
            case "dark":
                return <Moon className="h-4 w-4" />
            default:
                return <Monitor className="h-4 w-4" />
        }
    }

    const getLabel = () => {
        switch (theme) {
            case "light":
                return "Light"
            case "dark":
                return "Dark"
            default:
                return "System"
        }
    }

    return (
        <Button variant="outline" onClick={toggleTheme} className="gap-2">
            {getIcon()}
            {getLabel()}
        </Button>
    )
}