"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FlagType, FLAG_CONFIG } from "@/types/flags"
import { useUpdateTrailFlag } from "@/lib/queries"
import { cn } from "@/lib/utils"

interface MultiFlagButtonProps {
    trailId: string
    currentFlag: FlagType
    size?: "default" | "sm" | "icon" | "xs"
    className?: string
}

export function MultiFlagButton({
    trailId,
    currentFlag,
    size = "icon",
    className
}: MultiFlagButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const updateFlag = useUpdateTrailFlag()

    const handleFlagChange = async (newFlag: FlagType) => {
        try {
            await updateFlag.mutateAsync({
                trailId,
                flagType: newFlag,
            })
            setIsOpen(false)
        } catch (error) {
            console.error("Failed to update flag:", error)
        }
    }

    const currentConfig = FLAG_CONFIG[currentFlag]
    const isDefault = currentFlag === FlagType.NOT_EXPLORED

    const sizeClasses = {
        default: "h-10 w-10",
        sm: "h-8 w-8",
        icon: "h-9 w-9",
        xs: "h-6 w-6",
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={updateFlag.isPending}
                    className={cn(
                        sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.icon,
                        isDefault ? "text-muted-foreground/50 hover:text-foreground" : currentConfig.color,
                        className
                    )}
                    title={`${currentConfig.label}: ${currentConfig.description}`}
                >
                    <span className={size === "xs" ? "text-xs" : "text-sm"}>
                        {currentConfig.emoji}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {Object.entries(FLAG_CONFIG).map(([flagType, config]) => (
                    <DropdownMenuItem
                        key={flagType}
                        onClick={() => handleFlagChange(flagType as FlagType)}
                        className={cn(
                            "flex items-center gap-3 cursor-pointer",
                            currentFlag === flagType && "bg-accent"
                        )}
                    >
                        <span className="text-base">{config.emoji}</span>
                        <div className="flex flex-col">
                            <span className="font-medium">{config.label}</span>
                            <span className="text-xs text-muted-foreground">
                                {config.description}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}