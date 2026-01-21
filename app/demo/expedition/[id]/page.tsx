"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { GenerateTopicsModal } from "@/components/trail/generate-topics-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Compass, GitBranch, Sparkles, Wand2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { TrailWithCounts } from "@/types/database"

export default function DemoExpeditionPage() {
    const params = useParams()
    const expeditionId = params.id as string

    const [trails, setTrails] = useState<TrailWithCounts[]>([
        {
            id: "base-camp",
            expedition_id: expeditionId,
            parent_trail_id: null,
            title: "Base Camp",
            source_text: "Start your learning journey here",
            is_base_camp: true,
            position: 0,
            flag_type: 'not_explored',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_flagged: false,
            message_count: 0,
            last_message_at: null
        },
        {
            id: "fundamentals",
            expedition_id: expeditionId,
            parent_trail_id: null,
            title: "Fundamentals",
            source_text: "Core concepts and basics",
            is_base_camp: false,
            position: 1,
            flag_type: 'not_explored',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_flagged: false,
            message_count: 0,
            last_message_at: null
        },
        {
            id: "advanced",
            expedition_id: expeditionId,
            parent_trail_id: null,
            title: "Advanced Topics",
            source_text: "Deep dive into complex subjects",
            is_base_camp: false,
            position: 2,
            flag_type: 'not_explored',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_flagged: false,
            message_count: 0,
            last_message_at: null
        }
    ])

    const [currentTrailId, setCurrentTrailId] = useState<string>("base-camp")
    const [messageCount, setMessageCount] = useState(0)
    const [generateModalOpen, setGenerateModalOpen] = useState(false)

    const currentTrail = trails.find(t => t.id === currentTrailId)
    const maxMessages = 10
    const maxTrails = 8 // Allow up to 8 trails in demo
    const canAddTrail = trails.length < maxTrails

    const handleCreateTrails = async (topics: any[]) => {
        // Limit to 3 topics max in demo
        const maxTopics = Math.min(topics.length, 3, maxTrails - trails.length)
        const topicsToCreate = topics.slice(0, maxTopics)

        if (topicsToCreate.length === 0) {
            toast.error("Trail limit reached for demo")
            return
        }

        const newTrails: TrailWithCounts[] = topicsToCreate.map((topic, index) => ({
            id: `trail-${Date.now()}-${index}`,
            expedition_id: expeditionId,
            parent_trail_id: currentTrailId,
            title: topic.topic,
            source_text: topic.description,
            is_base_camp: false,
            position: trails.length + index,
            flag_type: 'not_explored',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_flagged: false,
            message_count: 0,
            last_message_at: null
        }))

        setTrails(prev => [...prev, ...newTrails])

        // Switch to first new trail
        if (newTrails.length > 0) {
            setCurrentTrailId(newTrails[0].id)
        }

        toast.success(`Created ${newTrails.length} new trails (demo limit: max 3 at a time)`)
    }

    return (
        <div className="h-screen bg-slate-50/50 dark:bg-slate-950/20 flex flex-col overflow-hidden">
            {/* Demo Header */}
            <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 z-50 shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>Demo Mode: {messageCount}/{maxMessages} messages, {trails.length}/{maxTrails} trails</span>
                <Link href="/signup" target="_blank" className="ml-2 underline hover:text-indigo-100">
                    Sign up to save progress
                </Link>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden lg:flex w-80 border-r bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl flex-col">
                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
                                Demo Trails
                            </h3>
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-[10px] px-1.5 py-0">
                                {trails.length}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-3">
                        <div className="space-y-1">
                            {trails.map((trail) => (
                                <button
                                    key={trail.id}
                                    onClick={() => setCurrentTrailId(trail.id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${currentTrailId === trail.id
                                            ? "bg-indigo-50 border border-indigo-200 text-indigo-900"
                                            : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                >
                                    <div className="font-medium text-sm">{trail.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">{trail.source_text}</div>
                                    {trail.is_base_camp && (
                                        <Badge variant="outline" className="mt-2 text-xs">Base Camp</Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50">
                        <Button
                            className={`w-full gap-2 h-10 rounded-xl font-bold text-xs ${canAddTrail
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                    : "bg-slate-400 text-white cursor-not-allowed"
                                }`}
                            onClick={() => setGenerateModalOpen(true)}
                            disabled={!canAddTrail}
                        >
                            <Wand2 className="h-3.5 w-3.5" />
                            {canAddTrail ? "Generate Topics" : "Trail Limit Reached"}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground mt-2">
                            {canAddTrail
                                ? `${maxTrails - trails.length} trails remaining (max 3 per generation)`
                                : 'Demo trail limit reached'
                            }
                        </p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl px-4 py-2.5 flex-shrink-0 flex items-center justify-between gap-4 z-10">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            {currentTrail && (
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md">
                                        <Compass className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {currentTrail.title}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            Demo Mode
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Mobile Trail Selector */}
                            <div className="lg:hidden">
                                <select
                                    value={currentTrailId}
                                    onChange={(e) => setCurrentTrailId(e.target.value)}
                                    className="px-3 py-2 text-xs border rounded-lg bg-white"
                                >
                                    {trails.map((trail) => (
                                        <option key={trail.id} value={trail.id}>
                                            {trail.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                className={`h-9 rounded-lg font-bold text-xs gap-2 ${canAddTrail
                                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                        : "bg-slate-400 text-white cursor-not-allowed"
                                    }`}
                                onClick={() => setGenerateModalOpen(true)}
                                disabled={!canAddTrail}
                            >
                                <Wand2 className="h-3.5 w-3.5" />
                                Generate
                            </Button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
                        {currentTrail && (
                            <ChatInterface
                                trailId={currentTrailId}
                                expeditionId={expeditionId}
                                trailTitle={currentTrail.title}
                                trailSourceText={currentTrail.source_text}
                                apiEndpoint="/api/chat"
                                enablePersistence={false}
                                maxMessages={maxMessages}
                                expeditionTitle="Demo Expedition"
                                isBaseCamp={currentTrail.is_base_camp}
                                initialMessages={[]}
                            />
                        )}
                    </div>
                </main>
            </div>

            <GenerateTopicsModal
                open={generateModalOpen}
                onOpenChange={setGenerateModalOpen}
                expeditionId={expeditionId}
                expeditionTitle="Demo Expedition"
                trails={trails}
                apiEndpoint="/api/generate-topics"
                onCreateTrails={handleCreateTrails}
            />
        </div>
    )
}