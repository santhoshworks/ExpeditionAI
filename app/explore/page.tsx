"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Calendar, GitBranch, MessageSquare, Search, TrendingUp, Clock, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Expedition } from "@/types/database"

interface PublicExpedition extends Expedition {
    profile: {
        full_name: string | null
    }
    trail_count: number
    trails: { id: string }[]
    is_public?: boolean
    public_slug?: string | null
    public_description?: string | null
    view_count?: number
}

export default function ExploreExpeditionsPage() {
    const [expeditions, setExpeditions] = useState<PublicExpedition[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trails'>('popular')

    useEffect(() => {
        async function fetchPublicExpeditions() {
            const supabase = createClient()

            try {
                let query = supabase
                    .from('expeditions')
                    .select(`
            *,
            profile:profiles(full_name),
            trail_count:trails(count),
            trails(id)
          `)
                    .eq('is_public', true)

                // Apply sorting
                switch (sortBy) {
                    case 'recent':
                        query = query.order('created_at', { ascending: false })
                        break
                    case 'popular':
                        query = query.order('view_count', { ascending: false, nullsLast: true })
                        break
                    case 'trails':
                        // This would need a more complex query in production
                        query = query.order('created_at', { ascending: false })
                        break
                }

                const { data, error } = await query.limit(50)

                if (error) throw error

                // Filter by search query if provided
                let filteredData = data || []
                if (searchQuery) {
                    filteredData = filteredData.filter(exp =>
                        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (exp.public_description && exp.public_description.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                }

                setExpeditions(filteredData as PublicExpedition[])
            } catch (error) {
                console.error('Error fetching public expeditions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPublicExpeditions()
    }, [searchQuery, sortBy])

    const getSortLabel = (sort: string) => {
        switch (sort) {
            case 'recent': return 'Most Recent'
            case 'popular': return 'Most Popular'
            case 'trails': return 'Most Trails'
            default: return 'Most Popular'
        }
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
                        <Link href="/signup">
                            <Button>Start Learning</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Explore Learning Expeditions
                    </h1>
                    <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                        Discover interactive knowledge maps created by learners around the world.
                        See how complex topics branch and connect in visual learning journeys.
                    </p>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search expeditions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['popular', 'recent', 'trails'] as const).map((sort) => (
                                <Button
                                    key={sort}
                                    variant={sortBy === sort ? "default" : "outline"}
                                    onClick={() => setSortBy(sort)}
                                    className="whitespace-nowrap"
                                >
                                    {getSortLabel(sort)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Demo Expedition Banner */}
                <Card className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Try ExpeditionAI Free
                                </h3>
                                <p className="text-indigo-100 text-sm">
                                    Create your own learning expedition on any topic. No signup required!
                                </p>
                            </div>
                            <Link href="/demo/create">
                                <Button size="lg" variant="secondary" className="font-bold">
                                    Create Demo Expedition
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Expeditions Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-slate-200 rounded"></div>
                                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : expeditions.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            {searchQuery ? 'No expeditions found' : 'No public expeditions yet'}
                        </h3>
                        <p className="text-slate-500 mb-6">
                            {searchQuery
                                ? 'Try adjusting your search terms or filters'
                                : 'Be the first to share your learning journey!'
                            }
                        </p>
                        <Link href="/signup">
                            <Button>Create First Expedition</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {expeditions.map((expedition) => (
                            <Card key={expedition.id} className="hover:shadow-lg transition-shadow group">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {expedition.title}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                by {expedition.profile?.full_name || 'Anonymous'}
                                            </CardDescription>
                                        </div>
                                        {expedition.view_count && expedition.view_count > 10 && (
                                            <Badge variant="secondary" className="ml-2 flex-shrink-0">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                Popular
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {expedition.public_description && (
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                            {expedition.public_description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(expedition.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {expedition.view_count || 0}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1 text-indigo-600">
                                                <GitBranch className="h-4 w-4" />
                                                {expedition.trail_count || 0}
                                            </span>
                                            <span className="flex items-center gap-1 text-green-600">
                                                <MessageSquare className="h-4 w-4" />
                                                {expedition.trails?.length || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {expedition.public_slug ? (
                                        <Link href={`/demo/expedition/${expedition.id}`}>
                                            <Button className="w-full group-hover:bg-indigo-600 transition-colors">
                                                Try Demo Mode
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="w-full" disabled>
                                            Not Available
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-16 text-center">
                    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Own Expedition?</h2>
                            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                                Join thousands of learners creating interactive knowledge maps.
                                Turn any topic into a visual learning adventure.
                            </p>
                            <Link href="/signup">
                                <Button size="lg" variant="secondary">
                                    Start Learning Free
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}