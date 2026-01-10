"use client"

import { useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useExpedition, useTrails } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ModelSelector } from "@/components/chat/model-selector"
import { ExploreButton } from "@/components/chat/explore-button"
import { MiniTree } from "@/components/map/mini-tree"
import { FlagButton } from "@/components/trail/flag-button"
import { useTextSelection } from "@/hooks/use-text-selection"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Map, BookOpen } from "lucide-react"
import Link from "next/link"

export default function ExpeditionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const expeditionId = params.id as string
  const trailIdParam = searchParams.get("trailId")

  const { setCurrentExpedition, currentTrailId, setCurrentTrail } = useExploreStore()
  const { data: expedition, isLoading: expeditionLoading } = useExpedition(expeditionId)
  const { data: trails, isLoading: trailsLoading } = useTrails(expeditionId)

  // Enable text selection for explore feature
  useTextSelection()

  useEffect(() => {
    if (expeditionId) {
      setCurrentExpedition(expeditionId)
    }
    return () => {
      setCurrentExpedition(null)
      setCurrentTrail(null)
    }
  }, [expeditionId, setCurrentExpedition, setCurrentTrail])

  // Sync trail ID from URL param if present
  useEffect(() => {
    if (trailIdParam) {
      setCurrentTrail(trailIdParam)
    }
  }, [trailIdParam, setCurrentTrail])

  // Set default trail to base camp if no trail is selected
  useEffect(() => {
    if (trails && trails.length > 0 && !currentTrailId && !trailIdParam) {
      const baseCamp = trails.find((t) => t.is_base_camp)
      if (baseCamp) {
        setCurrentTrail(baseCamp.id)
      } else {
        setCurrentTrail(trails[0].id)
      }
    }
  }, [trails, currentTrailId, setCurrentTrail, trailIdParam])

  if (expeditionLoading || trailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading expedition...</p>
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

  const currentTrail = trails?.find((t) => t.id === currentTrailId)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold">{expedition.title}</h1>
                  {currentTrail && (
                    <p className="text-sm text-muted-foreground">
                      Trail: {currentTrail.title}
                    </p>
                  )}
                </div>
                {currentTrail && (
                  <FlagButton
                    trailId={currentTrail.id}
                    isFlagged={currentTrail.is_flagged}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModelSelector />
              <Link href={`/expedition/${expeditionId}/map`}>
                <Button variant="outline" size="sm">
                  <Map className="mr-2 h-4 w-4" />
                  Map
                </Button>
              </Link>
              <Link href={`/expedition/${expeditionId}/journal`}>
                <Button variant="outline" size="sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Journal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Trail Tree */}
        <aside className="w-80 border-r bg-card/50 backdrop-blur-sm flex flex-col shadow-sm">
          <div className="px-4 py-3 border-b bg-accent/30">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-base flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" />
                Trails
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full font-medium">
                {trails?.length || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Navigate your exploration paths
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MiniTree
              trails={trails || []}
              currentTrailId={currentTrailId || undefined}
              onTrailSelect={setCurrentTrail}
            />
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative">
          {currentTrailId ? (
            <>
              <ChatInterface
                trailId={currentTrailId}
                expeditionId={expeditionId}
              />
              <ExploreButton
                expeditionId={expeditionId}
                parentTrailId={currentTrailId}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a trail to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
