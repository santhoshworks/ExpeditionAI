"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check, Lock, Sparkles, ChevronRight, GitCommit } from "lucide-react"

// Reuse the MapData interface for compatibility
export interface MapData {
    id: string
    label: string
    status: "locked" | "active" | "completed"
    children?: MapData[]
}

interface MetroMapProps {
    data: MapData
    onNodeClick?: (id: string) => void
}

export function MetroMap({ data, onNodeClick }: MetroMapProps) {
    return (
        <div className="w-full max-w-2xl mx-auto p-10 select-none">
            <div className="relative">
                <MetroNode node={data} depth={0} isLast={true} onNodeClick={onNodeClick} />
            </div>
        </div>
    )
}

interface MetroNodeProps {
    node: MapData
    depth: number
    isLast: boolean
    onNodeClick?: (id: string) => void
}

function MetroNode({ node, depth, isLast, onNodeClick }: MetroNodeProps) {
    const hasChildren = node.children && node.children.length > 0

    return (
        <div className="relative group">
            {/* Node Row */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: depth * 0.1 }}
                className="flex items-start gap-4 mb-2 relative z-10"
            >

                {/* 1. Track/Line Marker */}
                <div className="flex flex-col items-center">
                    <motion.div
                        className={cn(
                            "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer",
                            node.status === 'locked' && "bg-slate-100 border-slate-200 text-slate-300",
                            node.status === 'active' && "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110",
                            node.status === 'completed' && "bg-white border-emerald-500 text-emerald-500",
                        )}
                        whileHover={node.status !== 'locked' ? { scale: 1.15 } : {}}
                        onClick={() => node.status !== 'locked' && onNodeClick?.(node.id)}
                    >
                        {node.status === 'locked' && <Lock className="w-4 h-4" />}
                        {node.status === 'active' && <Sparkles className="w-5 h-5 animate-pulse" />}
                        {node.status === 'completed' && <Check className="w-5 h-5" />}
                    </motion.div>

                    {/* Vertical Connecting Line */}
                    {!isLast && (
                        <div className="w-0.5 min-h-[40px] bg-slate-200 group-hover:bg-slate-300 transition-colors -my-1" />
                    )}
                    {/* If it has children, the line needs to extend to cover them? 
                Actually, usually the children sit mainly below. 
                For a simple timeline, children follow the parent.
            */}
                </div>

                {/* 2. Content Card */}
                <div
                    className={cn(
                        "flex-1 pt-1 pb-8 cursor-pointer",
                        node.status === 'locked' && "opacity-50 pointer-events-none"
                    )}
                    onClick={() => node.status !== 'locked' && onNodeClick?.(node.id)}
                >
                    <div className={cn(
                        "p-4 rounded-2xl border transition-all duration-300",
                        node.status === 'active'
                            ? "bg-white border-indigo-100 shadow-xl shadow-indigo-50 ring-1 ring-indigo-50"
                            : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md"
                    )}>
                        <h4 className={cn(
                            "font-bold text-lg",
                            node.status === 'active' ? "text-indigo-700" : "text-slate-700"
                        )}>
                            {node.label}
                        </h4>
                        {node.status === 'active' && (
                            <p className="text-xs font-semibold text-indigo-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Current Expedition
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* 3. Recursive Children (Branches) */}
            {hasChildren && (
                <div className="pl-5 border-l-2 border-dashed border-slate-200 ml-5 pt-2">
                    {node.children!.map((child, i) => (
                        <MetroNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            isLast={i === node.children!.length - 1}
                            onNodeClick={onNodeClick}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
