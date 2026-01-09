"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useExpedition, useTrails, useCreateTrail } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ModelSelector } from "@/components/chat/model-selector"
import { ExploreButton } from "@/components/chat/explore-button"
import { ExpeditionMap } from "@/components/map/expedition-map"
import { TrailList } from "@/components/trail/trail-list"
import { FlagButton } from "@/components/trail/flag-button"
import { useTextSelection } from "@/hooks/use-text-selection"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Map, BookOpen } from "lucide-react"
import Link from "next/link"

export default function ExpeditionPage() {
  const params = useParams()
  const router = useRouter()
  const expeditionId = params.id as string
  
  const { setCurrentExpedition, currentTrailId, setCurrentTrail } = useExploreStore()
  const { data: expedition, isLoading: expeditionLoading } = useExpedition(expeditionId)
  const { data: trails, isLoading: trailsLoading } = useTrails(expeditionId)
  const createTrail = useCreateTrail()
  
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

  // Set default trail to base camp if no trail is selected
  useEffect(() => {
    if (trails && trails.length > 0 && !currentTrailId) {
      const baseCamp = trails.find((t) => t.is_base_camp)
      if (baseCamp) {
        setCurrentTrail(baseCamp.id)
      } else {
        setCurrentTrail(trails[0].id)
      }
    }
  }, [trails, currentTrailId, setCurrentTrail])

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
        {/* Sidebar - Trail List & Mini Map */}
        <aside className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold mb-2">Trails</h2>
            <div className="h-48 border rounded-md mb-4">
              <ExpeditionMap
                trails={trails || []}
                currentTrailId={currentTrailId || undefined}
                onTrailSelect={setCurrentTrail}
                mini
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TrailList
              trails={trails || []}
              currentTrailId={currentTrailId || undefined}
              onTrailSelect={setCurrentTrail}
              expeditionId={expeditionId}
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
