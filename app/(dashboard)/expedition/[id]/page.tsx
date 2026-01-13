"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useExpedition, useTrails, useUserCredits } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"
import { getDisplayFlagType } from "@/lib/flag-migration"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ModelSelector } from "@/components/chat/model-selector"
import { ExploreButton } from "@/components/chat/explore-button"
import { LearningModeToggle } from "@/components/chat/learning-mode-toggle"
import { CinemaModeOverlay } from "@/components/chat/cinema-mode-overlay"
import { MiniTree } from "@/components/map/mini-tree"
import { MultiFlagButton } from "@/components/trail/multi-flag-button"
import { GenerateTopicsModal } from "@/components/trail/generate-topics-modal"
import { MobileTrailSelector } from "@/components/trail/mobile-trail-selector"
import { useTextSelection } from "@/hooks/use-text-selection"
import { useMapPreloader, preloadMapComponents } from "@/hooks/use-map-preloader"
import { Button } from "@/components/ui/button"
import { Map as MapIcon, BookOpen, Wand2 } from "lucide-react"
import Link from "next/link"

export default function ExpeditionPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const expeditionId = params.id as string
  const trailIdParam = searchParams.get("trailId")

  const [generateModalOpen, setGenerateModalOpen] = useState(false)

  const { setCurrentExpedition, currentTrailId, setCurrentTrail, userTier, userCredits } = useExploreStore()
  const { data: expedition, isLoading: expeditionLoading } = useExpedition(expeditionId)
  const { data: trails, isLoading: trailsLoading } = useTrails(expeditionId)

  // Fetch and sync user credits
  useUserCredits()

  // Enable text selection for explore feature
  useTextSelection()

  // Preload map components for faster transitions
  const isMapPreloaded = useMapPreloader(2000)

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
      {/* Cinema mode overlay - dims everything except chat */}
      <CinemaModeOverlay />

      {/* Main Content - Full width for better chat visibility */}
      <div className="flex-1 flex overflow-hidden">
        {/* Trail Navigation - Simplified without expedition title */}
        <aside className="hidden lg:flex w-64 border-r bg-card/30 backdrop-blur-sm flex-col shadow-sm transition-all duration-300">
          <div className="px-3 py-2 border-b bg-accent/20">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-primary" />
                Trails
              </h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                {trails?.length || 0}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <MiniTree
              trails={trails || []}
              currentTrailId={currentTrailId || undefined}
              onTrailSelect={setCurrentTrail}
            />
          </div>
          {/* Generate Topics Button */}
          <div className="p-2 border-t bg-accent/10">
            <Button
              variant="outline"
              className="w-full gap-2 text-xs h-8"
              onClick={() => setGenerateModalOpen(true)}
            >
              <Wand2 className="h-3 w-3" />
              Generate Topics
            </Button>
          </div>
        </aside>

        {/* Main Chat Area - Maximized for better visibility */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Chat Header - Minimal design focused on current trail */}
          <div className="border-b bg-card/30 px-4 py-2 flex-shrink-0 flex items-center justify-between gap-4">
            {/* Current Trail Info - Only show trail name, not expedition */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {currentTrail && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium truncate">{currentTrail.title}</span>
                  <MultiFlagButton
                    trailId={currentTrail.id}
                    currentFlag={getDisplayFlagType(currentTrail)}
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:block">
                <ModelSelector userTier={userTier} userCredits={userCredits} />
              </div>
              <LearningModeToggle />

              {/* Mobile trail selector */}
              <MobileTrailSelector
                trails={trails || []}
                currentTrailId={currentTrailId || undefined}
                onTrailSelect={setCurrentTrail}
                onGenerateTopics={() => setGenerateModalOpen(true)}
              />

              {/* Quick actions */}
              <div className="hidden sm:flex items-center gap-1">
                <Link href={`/expedition/${expeditionId}/map`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 px-3"
                    onMouseEnter={() => {
                      if (!isMapPreloaded) {
                        preloadMapComponents()
                      }
                    }}
                  >
                    <MapIcon className="h-4 w-4" />
                    Map
                  </Button>
                </Link>
                <Link href={`/expedition/${expeditionId}/journal`}>
                  <Button variant="ghost" size="sm" className="h-8 gap-2 px-3">
                    <BookOpen className="h-4 w-4" />
                    Journal
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Model Selector */}
          <div className="md:hidden border-b bg-card/30 p-2 flex-shrink-0">
            <ModelSelector userTier={userTier} userCredits={userCredits} />
          </div>

          {currentTrailId ? (
            <div className="flex-1 flex flex-col min-h-0">
              <ChatInterface
                trailId={currentTrailId}
                expeditionId={expeditionId}
                trailTitle={currentTrail?.title}
                trailSourceText={currentTrail?.source_text}
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
                <MobileTrailSelector
                  trails={trails || []}
                  currentTrailId={currentTrailId || undefined}
                  onTrailSelect={setCurrentTrail}
                  onGenerateTopics={() => setGenerateModalOpen(true)}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Generate Topics Modal */}
      <GenerateTopicsModal
        open={generateModalOpen}
        onOpenChange={setGenerateModalOpen}
        expeditionId={expeditionId}
        expeditionTitle={expedition.title}
        trails={trails || []}
      />
    </div>
  )
}
