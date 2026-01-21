"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MetroMap, type MapData } from "@/components/map/MetroMap"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Calendar, GitBranch, MessageSquare, Share2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Expedition, Trail, Message } from "@/types/database"

interface PublicExpedition extends Expedition {
    profile: {
        full_name: string | null
    }
    trails: (Trail & {
        message_count: number
    })[]
}

export default function PublicExpeditionPage() {
    const params = useParams()
    const slug = params.slug as string
    const [expedition, setExpedition] = useState<PublicExpedition | null>(null)
    const [loading, setLoading] = useState(true)
    const [mapData, setMapData] = useState<MapData | null>(null)

    useEffect(() => {
        async function fetchPublicExpedition() {
            const supabase = createClient()

            try {
                // Increment view count (fire and forget - don't block on errors)
                supabase.rpc('increment_expedition_views', { expedition_slug: slug }).catch(err => {
                    console.warn('Failed to increment view count:', err)
                })

                // Fetch expedition with trails and stats
                const { data, error } = await supabase
                    .from('expeditions')
                    .select(`
            *,
            profile:profiles(full_name),
            trails(
              *,
              message_count:messages(count)
            )
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
                status: 'completed', // All public trails are considered completed
                children: children.length > 0 ? children : undefined
            }
        }

        return buildNode(baseCamp)
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied to clipboard!")
        } catch (error) {
            toast.error("Failed to copy link")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading expedition...</p>
            </div>
        )
    }

    if (!expedition) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Expedition Not Found</h1>
                    <p className="text-muted-foreground">This expedition may be private or doesn't exist.</p>
                    <Link href="/">
                        <Button>Explore Other Expeditions</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold text-indigo-600">
                            ExpeditionAI
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleShare} className="gap-2">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                            <Link href="/signup">
                                <Button className="gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Create Your Own
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Expedition Info */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{expedition.title}</h1>
                            {expedition.public_description && (
                                <p className="text-lg text-slate-600 mb-4">{expedition.public_description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    Created by {expedition.profile?.full_name || 'Anonymous'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(expedition.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    {expedition.view_count || 0} views
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <GitBranch className="h-4 w-4 text-indigo-500" />
                                    Trails
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{expedition.trails.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-green-500" />
                                    Messages
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {expedition.trails.reduce((sum, trail) => sum + (trail.message_count || 0), 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    Views
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{expedition.view_count || 0}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Knowledge Map */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Knowledge Map</CardTitle>
                        <CardDescription>
                            Explore the learning journey and see how topics branch and connect
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mapData ? (
                            <div className="bg-slate-50 rounded-lg p-6">
                                <MetroMap data={mapData} />
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                No trails to display
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Call to Action */}
                <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Start Your Own Learning Expedition</h2>
                        <p className="text-indigo-100 mb-6">
                            Create interactive knowledge maps, explore topics deeply, and share your learning journey with others.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Link href="/signup">
                                <Button size="lg" variant="secondary">
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link href="/about">
                                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}