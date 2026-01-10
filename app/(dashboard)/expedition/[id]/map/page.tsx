"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { useExpedition, useTrails } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"
import { LazyExpeditionMap } from "@/components/map/lazy-expedition-map"
import { TopicSuggestions } from "@/components/map/topic-suggestions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function FullMapPage() {
  const params = useParams()
  const router = useRouter()
  const expeditionId = params.id as string
  const { currentTrailId, setCurrentTrail } = useExploreStore()
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: expedition, isLoading: expeditionLoading } = useExpedition(expeditionId)
  const { data: trails, isLoading: trailsLoading } = useTrails(expeditionId)

  if (expeditionLoading || trailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  if (!expedition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Expedition not found</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <Link href={`/expedition/${expeditionId}`}>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold truncate">{expedition.title}</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Exploration Map & Suggestions
                </p>
              </div>
            </div>

            {/* Mobile suggestions toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="md:hidden"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Ideas
            </Button>
          </div>
        </div>
      </header>

      {/* Map and Suggestions Layout */}
      <div className="flex-1 h-[calc(100vh-73px)] flex relative">
        {/* Map */}
        <div className="flex-1">
          <LazyExpeditionMap
            trails={trails || []}
            currentTrailId={currentTrailId || undefined}
            onTrailSelect={(trailId) => {
              setCurrentTrail(trailId)
              router.push(`/expedition/${expeditionId}?trailId=${trailId}`)
            }}
          />
        </div>

        {/* Suggestions Panel - Desktop */}
        <div className="hidden md:block w-80 border-l bg-card overflow-y-auto">
          <TopicSuggestions
            expeditionId={expeditionId}
            trails={trails || []}
            onCreateTrail={(trailId: string) => {
              router.push(`/expedition/${expeditionId}?trailId=${trailId}`)
            }}
          />
        </div>

        {/* Suggestions Panel - Mobile Overlay */}
        {showSuggestions && (
          <div className="md:hidden absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex">
            <div className="w-full max-w-sm ml-auto bg-card border-l shadow-xl overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Explore More</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSuggestions(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <TopicSuggestions
                expeditionId={expeditionId}
                trails={trails || []}
                onCreateTrail={(trailId: string) => {
                  setShowSuggestions(false)
                  router.push(`/expedition/${expeditionId}?trailId=${trailId}`)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
