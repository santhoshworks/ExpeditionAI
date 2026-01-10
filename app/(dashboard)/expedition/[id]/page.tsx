"use client"

import { useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useExpedition, useTrails, useUserCredits } from "@/lib/queries"
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

  const { setCurrentExpedition, currentTrailId, setCurrentTrail, userTier, userCredits } = useExploreStore()
  const { data: expedition, isLoading: expeditionLoading } = useExpedition(expeditionId)
  const { data: trails, isLoading: trailsLoading } = useTrails(expeditionId)

  // Fetch and sync user credits
  useUserCredits()

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
    <div className="h-full bg-background flex flex-col">
      {/* Expedition Actions / Sub-header */}
      <div className="border-b bg-card/30 px-4 md:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {currentTrail && (
            <div className="flex items-center gap-2 md:gap-3 border-l pl-2 md:pl-4 min-w-0 flex-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden sm:inline">Current Trail</span>
              <span className="text-sm font-bold truncate">{currentTrail.title}</span>
              <FlagButton
                trailId={currentTrail.id}
                isFlagged={currentTrail.is_flagged}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <div className="hidden md:block">
            <ModelSelector userTier={userTier} userCredits={userCredits} />
          </div>
          <div className="h-4 w-[1px] bg-border mx-1 hidden md:block" />
          <Link href={`/expedition/${expeditionId}/map`}>
            <Button variant="ghost" size="sm" className="h-8 gap-1 md:gap-2 px-2 md:px-3">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </Button>
          </Link>
          <Link href={`/expedition/${expeditionId}/journal`}>
            <Button variant="ghost" size="sm" className="h-8 gap-1 md:gap-2 px-2 md:px-3">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Journal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Trail Tree - Hidden on mobile, shown as overlay when needed */}
        <aside className="hidden md:flex w-80 border-r bg-card/50 backdrop-blur-sm flex-col shadow-sm">
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
        <main className="flex-1 flex flex-col relative min-h-0">
          {/* Mobile Model Selector */}
          <div className="md:hidden border-b bg-card/30 p-2 flex-shrink-0">
            <ModelSelector userTier={userTier} userCredits={userCredits} />
          </div>

          {currentTrailId ? (
            <div className="flex-1 flex flex-col min-h-0">
              <ChatInterface
                trailId={currentTrailId}
                expeditionId={expeditionId}
              />
              <ExploreButton
                expeditionId={expeditionId}
                parentTrailId={currentTrailId}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <div className="text-center">
                <p className="mb-4">Select a trail to start chatting</p>
                <Button
                  variant="outline"
                  onClick={() => {/* TODO: Show mobile trail selector */ }}
                  className="md:hidden"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Browse Trails
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
