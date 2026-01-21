"use client"

import { useMemo } from "react"
import { stratify } from "d3-hierarchy"
import { MetroMap, type MapData } from "./MetroMap"
import { type Trail } from "@/types/database"

interface ExpeditionMapContainerProps {
    trails: Trail[]
    currentTrailId?: string
    onNodeClick: (id: string) => void
}

export function ExpeditionMapContainer({ trails, currentTrailId, onNodeClick }: ExpeditionMapContainerProps) {

    const mapData = useMemo(() => {
        if (!trails || trails.length === 0) return null

        // 1. Convert flat list to tree
        // We can use d3 stratify to do the heavy lifting of building the parent/child structure

        // Validate we have a root (trail with no parent or is_base_camp)
        const root = trails.find(t => t.is_base_camp)
        if (!root) return null

        const formattingData = trails.map(t => ({
            id: t.id,
            parentId: t.parent_trail_id === root.id ? root.id : (t.parent_trail_id || (t.id === root.id ? undefined : root.id)),
            label: t.title,
            // Status logic:
            status: t.id === currentTrailId ? 'active' : 'completed'
        }))

        // Handle root parentId
        const cleanData = formattingData.map(d => ({
            ...d,
            parentId: d.id === root.id ? undefined : (d.parentId || root.id)
        }))

        try {
            const stratifier = stratify<{ id: string, parentId?: string, label: string, status: string }>()
                .id(d => d.id)
                .parentId(d => d.parentId)

            const rootNode = stratifier(cleanData)

            // Convert D3 hierarchy to MapData recursively
            const convertD3ToMapData = (node: any): MapData => {
                return {
                    id: node.data.id,
                    label: node.data.label,
                    status: node.data.status,
                    children: node.children?.map(convertD3ToMapData)
                }
            }

            return convertD3ToMapData(rootNode)
        } catch (e) {
            console.error("Map Stratify Error:", e)
            return null
        }

    }, [trails, currentTrailId])

    if (!mapData) return <div className="p-4 text-xs text-slate-400">Not enough data for map</div>

    return (
        <div className="w-full h-full min-h-[400px] overflow-y-auto bg-slate-50/50 rounded-xl p-8">
            <MetroMap
                data={mapData}
                onNodeClick={onNodeClick}
            />
        </div>
    )
}
