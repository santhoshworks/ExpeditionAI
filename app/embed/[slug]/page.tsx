"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MetroMap, type MapData } from "@/components/map/MetroMap"
import { ExternalLink, GitBranch } from "lucide-react"
import type { Expedition, Trail } from "@/types/database"
import { cn } from "@/lib/utils"

interface PublicExpedition extends Expedition {
    profile: {
        full_name: string | null
    }
    trails: Trail[]
}

export default function EmbedExpeditionPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const slug = params.slug as string
    const theme = searchParams.get('theme') || 'light'
    const isDark = theme === 'dark'

    const [expedition, setExpedition] = useState<PublicExpedition | null>(null)
    const [loading, setLoading] = useState(true)
    const [mapData, setMapData] = useState<MapData | null>(null)

    useEffect(() => {
        async function fetchPublicExpedition() {
            const supabase = createClient()

            try {
                const { data, error } = await supabase
                    .from('expeditions')
                    .select(`
            *,
            profile:profiles(full_name),
            trails(*)
          `)
                    .eq('public_slug', slug)
                    .eq('is_public', true)
                    .single()

                if (error) throw error

                setExpedition(data as PublicExpedition)

                // Convert to map format
                if (data.trails) {
                    const mapData = convertToMapData(data.trails)
                    setMapData(mapData)
                }
            } catch (error) {
                console.error('Error fetching public expedition:', error)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchPublicExpedition()
        }
    }, [slug])

    const convertToMapData = (trails: Trail[]): MapData => {
        const baseCamp = trails.find(t => t.is_base_camp)
        if (!baseCamp) {
            return {
                id: trails[0]?.id || 'empty',
                label: trails[0]?.title || 'Empty Expedition',
                status: 'completed'
            }
        }

        const buildNode = (trail: Trail): MapData => {
            const children = trails
                .filter(t => t.parent_trail_id === trail.id)
                .sort((a, b) => a.position - b.position)
                .map(buildNode)

            return {
                id: trail.id,
                label: trail.title,
                status: 'completed',
                children: children.length > 0 ? children : undefined
            }
        }

        return buildNode(baseCamp)
    }

    if (loading) {
        return (
            <div className={cn(
                "min-h-screen flex items-center justify-center",
                isDark ? "bg-slate-900" : "bg-white"
            )}>
                <div className={cn(
                    "animate-pulse",
                    isDark ? "text-slate-500" : "text-slate-400"
                )}>Loading expedition...</div>
            </div>
        )
    }

    if (!expedition) {
        return (
            <div className={cn(
                "min-h-screen flex items-center justify-center",
                isDark ? "bg-slate-900" : "bg-white"
            )}>
                <div className={cn(
                    "text-center",
                    isDark ? "text-slate-400" : "text-slate-500"
                )}>
                    <p>Expedition not found or not public</p>
                </div>
            </div>
        )
    }

    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/explore/${slug}` : `/explore/${slug}`

    return (
        <div className={cn(
            "min-h-screen",
            isDark ? "bg-slate-900" : "bg-white"
        )}>
            {/* Compact Header */}
            <div className={cn(
                "border-b px-4 py-3",
                isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-200 bg-slate-50/50"
            )}>
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <h1 className={cn(
                            "text-lg font-bold truncate",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            {expedition.title}
                        </h1>
                        <div className={cn(
                            "flex items-center gap-3 text-xs mt-1",
                            isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                            <span>by {expedition.profile?.full_name || 'Anonymous'}</span>
                            <span className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                {expedition.trails.length} trails
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                                isDark
                                    ? "text-indigo-400 bg-indigo-900/50 hover:bg-indigo-900"
                                    : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            )}
                        >
                            <ExternalLink className="h-3 w-3" />
                            Explore Full
                        </a>
                        <a
                            href="https://expeditionai.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "text-xs font-bold transition-colors",
                                isDark
                                    ? "text-slate-500 hover:text-indigo-400"
                                    : "text-slate-400 hover:text-indigo-600"
                            )}
                        >
                            Powered by ExpeditionAI
                        </a>
                    </div>
                </div>
            </div>

            {/* Compact Map */}
            <div className="p-4">
                {mapData ? (
                    <div className={cn(
                        "rounded-xl p-4 max-h-96 overflow-y-auto",
                        isDark ? "bg-slate-800/50" : "bg-slate-50/50"
                    )}>
                        <MetroMap data={mapData} />
                    </div>
                ) : (
                    <div className={cn(
                        "text-center py-8",
                        isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                        No learning trails to display
                    </div>
                )}
            </div>

            {/* Footer CTA */}
            <div className="border-t bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                <div className="text-center">
                    <p className="text-sm font-medium mb-2">
                        Create your own interactive learning expeditions
                    </p>
                    <a
                        href="https://expeditionai.com/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors"
                    >
                        Start Learning Free
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    )
}