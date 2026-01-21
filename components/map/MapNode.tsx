"use client"

import { motion } from "framer-motion"
import { Check, Lock, Sparkles, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type NodeStatus = "locked" | "active" | "completed"

interface MapNodeProps {
    id: string
    label: string
    status: NodeStatus
    x: number
    y: number
    isRoot?: boolean
    onClick?: (id: string) => void
}

export function MapNode({ id, label, status, x, y, isRoot = false, onClick }: MapNodeProps) {
    return (
        <motion.div
            className={cn(
                "absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer touch-none",
                "transition-colors duration-300"
            )}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                x,
                y,
                opacity: 1,
                scale: 1,
                // Pulse effect if active
                boxShadow: status === 'active' ? "0 0 20px rgba(99, 102, 241, 0.3)" : "none"
            }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                layout: { duration: 0.3 }
            }}
            onClick={() => status !== 'locked' && onClick?.(id)}
            whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
            whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
        >
            {/* Node Circle */}
            <div className={cn(
                "relative flex items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300",
                // Sizing
                isRoot ? "w-20 h-20" : "w-14 h-14",
                // Visual States
                status === 'locked' && "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
                status === 'active' && "bg-white border-indigo-500 text-indigo-600 shadow-indigo-100",
                status === 'completed' && "bg-emerald-50 border-emerald-500 text-emerald-600",
            )}>
                {/* Icons */}
                {status === 'locked' && <Lock className="w-5 h-5" />}
                {status === 'active' && <Sparkles className="w-6 h-6 animate-pulse" />}
                {status === 'completed' && <Check className="w-6 h-6" />}

                {/* Root Icon Overlay */}
                {isRoot && status !== 'locked' && (
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping opacity-20" />
                )}
            </div>

            {/* Label Badge */}
            <div className={cn(
                "mt-3 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm max-w-[120px] text-center truncate transition-all",
                status === 'locked' ? "bg-slate-100 text-slate-400" : "bg-white text-slate-700 border border-slate-100",
                status === 'active' && "text-indigo-700 border-indigo-100 ring-2 ring-indigo-50",
                isRoot && "text-sm px-4 bg-slate-900 text-white border-transparent"
            )}>
                {label}
            </div>

        </motion.div>
    )
}
