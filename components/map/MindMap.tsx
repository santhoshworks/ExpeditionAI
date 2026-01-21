"use client"

import { useMemo, useState, useEffect } from "react"
import { hierarchy, tree } from "d3-hierarchy"
import { motion, AnimatePresence } from "framer-motion"
import { MapNode, type NodeStatus } from "./MapNode"

// Define the data structure expected by the map
export interface MapData {
    id: string
    label: string
    status: NodeStatus
    children?: MapData[]
}

interface MindMapProps {
    data: MapData
    onNodeClick?: (id: string) => void
    width?: number
    height?: number
}

export function MindMap({ data, onNodeClick, width = 800, height = 600 }: MindMapProps) {
    // Use d3 to calculate the layout
    // We memorize this calculation so it only runs when data or dimensions change
    const root = useMemo(() => {
        const treeLayout = tree<MapData>().size([width - 100, height - 100]) // Add padding
        const rootNode = hierarchy(data)
        return treeLayout(rootNode)
    }, [data, width, height])

    return (
        <div
            className="relative overflow-hidden bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner"
            style={{ width, height }}
        >
            {/* 1. Connection Lines (SVG Layer) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <AnimatePresence>
                    {root.links().map((link, i) => {
                        // Create smooth bezier curves
                        const startX = link.source.x + 50 // Offset for padding
                        const startY = link.source.y + 50
                        const endX = link.target.x + 50
                        const endY = link.target.y + 50

                        // Vertical Tree Curve
                        const pathData = `M${startX},${startY} C${startX},${(startY + endY) / 2} ${endX},${(startY + endY) / 2} ${endX},${endY}`

                        return (
                            <motion.path
                                key={`${link.source.data.id}-${link.target.data.id}`}
                                d={pathData}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.4 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                fill="none"
                                stroke="#6366f1" // Indigo-500
                                strokeWidth="2"
                                strokeLinecap="round"
                                className={link.target.data.status === 'locked' ? "stroke-slate-300 stroke-dashed" : ""}
                            />
                        )
                    })}
                </AnimatePresence>
            </svg>

            {/* 2. Nodes (HTML/Framer Layer) */}
            <div className="absolute inset-0 w-full h-full">
                {root.descendants().map((node, i) => (
                    <MapNode
                        key={node.data.id}
                        id={node.data.id}
                        label={node.data.label}
                        status={node.data.status}
                        // Add padding offset
                        x={node.x + 50}
                        y={node.y + 50}
                        isRoot={node.depth === 0}
                        onClick={onNodeClick}
                    />
                ))}
            </div>

            {/* Decorative Grid Background */}
            <div className="absolute inset-0 -z-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
        </div>
    )
}
