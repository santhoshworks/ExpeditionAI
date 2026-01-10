"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useExpeditions, useCreateExpedition, useDeleteExpedition } from "@/lib/queries"
import { formatDate } from "@/lib/utils"
import {
  Plus,
  Map as MapIcon,
  Trash2,
  ArrowRight,
  MessageSquare,
  Flag,
  Clock,
  Sparkles,
  LayoutGrid,
  LayoutList,
  Compass
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const { data: expeditions, isLoading, isError } = useExpeditions()
  const createExpedition = useCreateExpedition()
  const deleteExpedition = useDeleteExpedition()

  const [showNewDialog, setShowNewDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const handleCreate = async () => {
    if (!title.trim()) return

    try {
      const expedition = await createExpedition.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
      })
      setShowNewDialog(false)
      setTitle("")
      setDescription("")
      router.push(`/expedition/${expedition.id}`)
    } catch (error) {
      console.error("Failed to create expedition:", error)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this expedition? All progress will be lost.")) {
      try {
        await deleteExpedition.mutateAsync(id)
      } catch (error) {
        console.error("Failed to delete expedition:", error)
      }
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <Trash2 className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold mb-2">Failed to load expeditions</h3>
        <p className="text-muted-foreground mb-6">There was an error connecting to the database.</p>
        <Button onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Welcome back Explorer
          </h1>
          <p className="text-muted-foreground mt-1">
            Pick up where you left off or start a new adventure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-accent/50 p-1 rounded-lg mr-2 border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowNewDialog(true)} className="rounded-full shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" />
            New Expedition
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[220px] rounded-2xl bg-accent/30 animate-pulse border" />
          ))}
        </div>
      ) : !expeditions || expeditions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 border-2 border-dashed rounded-3xl bg-accent/5">
          <div className="bg-primary/5 p-6 rounded-full mb-6">
            <Sparkles className="w-12 h-12 text-primary/40" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Your journey begins here</h3>
          <p className="text-muted-foreground mb-8 max-w-sm">
            You haven&apos;t created any expeditions yet. Start your first one to begin mapping your curiosity.
          </p>
          <Button onClick={() => setShowNewDialog(true)} size="lg" className="rounded-full px-8 animate-bounce-slow">
            Create Your First Expedition
          </Button>
        </div>
      ) : (
        <>
          {/* Expeditions Grid/List - sorted by recent activity */}
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {[...expeditions].sort((a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            ).map((expedition) => (
              <Card
                key={expedition.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 cursor-pointer bg-card/40 backdrop-blur-sm",
                  viewMode === "list" ? "flex flex-row items-center h-24" : "h-[240px]"
                )}
                onClick={() => router.push(`/expedition/${expedition.id}`)}
              >
                {/* Decorative background glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                <CardHeader className={cn(viewMode === "list" ? "p-4 flex-1" : "p-6")}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                          {expedition.title}
                        </CardTitle>
                        {expedition.flagged_count > 0 && (
                          <span className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold">
                            <Flag className="w-2 h-2" />
                            {expedition.flagged_count}
                          </span>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 min-h-[40px] text-xs mt-2">
                        {expedition.description || "No description provided."}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(expedition.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className={cn(
                  "flex flex-col justify-end gap-4",
                  viewMode === "list" ? "p-4 w-auto flex-row items-center border-l h-full bg-accent/10" : "p-6 pt-0"
                )}>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 capitalize">
                      <Compass className="w-3 h-3 text-primary/60" />
                      <span>{expedition.trail_count || 0} Trails</span>
                    </div>
                    <div className="flex items-center gap-1.5 capitalize">
                      <MessageSquare className="w-3 h-3 text-primary/60" />
                      <span>{expedition.message_count || 0} Msgs</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(expedition.updated_at)}</span>
                    </div>
                  </div>

                  <div className={cn("flex gap-2", viewMode === "list" ? "ml-4" : "mt-2")}>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 rounded-full text-xs h-9 bg-primary/90 hover:bg-primary shadow-sm hover:translate-x-1 transition-all group/btn"
                    >
                      Continue
                      <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <Link
                      href={`/expedition/${expedition.id}/map`}
                      className="flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/5 hover:text-primary transition-colors">
                        <MapIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* New Expedition Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-primary/10 p-8 text-center relative">
            <div className="bg-primary p-4 rounded-2xl w-fit mx-auto mb-4 shadow-xl shadow-primary/20">
              <Compass className="w-8 h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl font-bold">Start New Expedition</DialogTitle>
            <DialogDescription className="text-primary/70 mt-1">
              Where shall your curiosity take you today?
            </DialogDescription>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Expedition Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., Quantum Mechanics, Cooking Ethics..."
                value={title}
                className="rounded-xl h-12 focus:ring-primary/20 border-accent transition-all"
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Objective (Optional)
              </label>
              <Input
                id="description"
                placeholder="What specific aspects are you curious about?"
                value={description}
                className="rounded-xl h-12 focus:ring-primary/20 border-accent transition-all"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="p-8 pt-2">
            <Button variant="ghost" onClick={() => setShowNewDialog(false)} className="rounded-full px-6">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || createExpedition.isPending}
              className="rounded-full px-8 shadow-lg shadow-primary/20 min-w-[120px]"
            >
              {createExpedition.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : "Begin Expedition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
