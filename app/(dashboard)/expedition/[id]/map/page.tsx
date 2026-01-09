"use client"

import { useParams, useRouter } from "next/navigation"
import { useExpedition, useTrails } from "@/lib/queries"
import { useExploreStore } from "@/lib/store"
import { ExpeditionMap } from "@/components/map/expedition-map"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function FullMapPage() {
  const params = useParams()
  const router = useRouter()
  const expeditionId = params.id as string
  const { currentTrailId, setCurrentTrail } = useExploreStore()

  const { data: expedition, isLoading: expeditionLoading } = useExpedition(expeditionId)
  const { data: trails, isLoading: trailsLoading } = useTrails(expeditionId)

  if (expeditionLoading || trailsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/expedition/${expeditionId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{expedition.title}</h1>
                <p className="text-sm text-muted-foreground">Full Map View</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 h-[calc(100vh-73px)]">
        <ExpeditionMap
          trails={trails || []}
          currentTrailId={currentTrailId || undefined}
          onTrailSelect={(trailId) => {
            setCurrentTrail(trailId)
            router.push(`/expedition/${expeditionId}`)
          }}
        />
      </div>
    </div>
  )
}
