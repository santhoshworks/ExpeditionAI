"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
  Compass,
  BookOpen,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMapPreloader, preloadMapComponents } from "@/hooks/use-map-preloader"

export default function DashboardPage() {
  const router = useRouter()
  const { data: expeditions, isLoading, isError } = useExpeditions()
  const createExpedition = useCreateExpedition()
  const deleteExpedition = useDeleteExpedition()



  const [showNewDialog, setShowNewDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

  // Preload map components for faster transitions
  const isMapPreloaded = useMapPreloader(1500)

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
    <div className="h-full overflow-y-auto container mx-auto px-4 md:px-6 py-4 md:py-8">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col gap-4 mb-6 md:mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Welcome back Explorer
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Pick up where you left off or start a new adventure.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/wishlist">
              <Button
                variant="outline"
                className="rounded-full gap-2 flex-shrink-0"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </Button>
            </Link>
            <div className="flex items-center bg-accent/50 p-1 rounded-lg border flex-shrink-0">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setViewMode("table")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => setShowNewDialog(true)}
              className="rounded-full shadow-lg shadow-primary/20 gap-2 flex-1 md:flex-initial"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Expedition</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        viewMode === "table" ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expedition</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map(i => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-accent/30 rounded animate-pulse w-32" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-accent/30 rounded animate-pulse w-20" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-accent/30 rounded animate-pulse w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 bg-accent/30 rounded animate-pulse w-24 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[200px] md:h-[220px] rounded-2xl bg-accent/30 animate-pulse border" />
            ))}
          </div>
        )
      ) : !expeditions || expeditions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-4 md:p-8 border-2 border-dashed rounded-3xl bg-accent/5">
          <div className="bg-primary/5 p-4 md:p-6 rounded-full mb-4 md:mb-6">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-primary/40" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Your journey begins here</h3>
          <p className="text-muted-foreground mb-6 md:mb-8 max-w-sm text-sm md:text-base">
            You haven&apos;t created any expeditions yet. Start your first one to begin mapping your curiosity.
          </p>
          <Button onClick={() => setShowNewDialog(true)} size="lg" className="rounded-full px-6 md:px-8 animate-bounce-slow">
            <span className="hidden sm:inline">Create Your First Expedition</span>
            <span className="sm:hidden">Create Expedition</span>
          </Button>
        </div>
      ) : (
        <>
          {viewMode === "table" ? (
            /* Table View */
            <div className="border rounded-lg bg-card/50 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="font-semibold">Expedition</TableHead>
                    <TableHead className="font-semibold">Progress</TableHead>
                    <TableHead className="font-semibold">Flags</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...expeditions].sort((a, b) =>
                    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                  ).map((expedition) => (
                    <TableRow
                      key={expedition.id}
                      className="group hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/expedition/${expedition.id}`)}
                    >
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                            {expedition.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                            {expedition.description || "No description provided"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Compass className="w-3 h-3 text-primary/60" />
                            <span className="font-medium">{expedition.trail_count || 0}</span>
                            <span className="text-muted-foreground text-xs">trails</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-primary/60" />
                            <span className="font-medium">{expedition.message_count || 0}</span>
                            <span className="text-muted-foreground text-xs">msgs</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        {expedition.flagged_count > 0 ? (
                          <Badge variant="secondary" className="bg-rose-100 text-rose-700 hover:bg-rose-200">
                            <Flag className="w-3 h-3 mr-1" />
                            {expedition.flagged_count}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(expedition.updated_at)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-3 rounded-full text-xs bg-primary/90 hover:bg-primary shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/expedition/${expedition.id}`)
                            }}
                          >
                            <span className="hidden sm:inline">Continue</span>
                            <span className="sm:hidden">Open</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>

                          <Link
                            href={`/expedition/${expedition.id}/map`}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={() => {
                              if (!isMapPreloaded) {
                                preloadMapComponents()
                              }
                            }}
                          >
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/5 hover:text-primary">
                              <MapIcon className="h-3 w-3" />
                            </Button>
                          </Link>

                          <Link
                            href={`/expedition/${expedition.id}/journal`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/5 hover:text-primary">
                              <BookOpen className="h-3 w-3" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(expedition.id, e)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...expeditions].sort((a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              ).map((expedition) => (
                <Card
                  key={expedition.id}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 cursor-pointer bg-card/40 backdrop-blur-sm h-[200px] md:h-[240px]"
                  onClick={() => router.push(`/expedition/${expedition.id}`)}
                >
                  {/* Decorative background glow */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                  <CardHeader className="p-4 md:p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors line-clamp-1">
                            {expedition.title}
                          </CardTitle>
                          {expedition.flagged_count > 0 && (
                            <span className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">
                              <Flag className="w-2 h-2" />
                              {expedition.flagged_count}
                            </span>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2 min-h-[32px] md:min-h-[40px] text-xs mt-2">
                          {expedition.description || "No description provided."}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(expedition.id, e)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive h-8 w-8 rounded-full flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col justify-end gap-3 md:gap-4 p-4 md:p-6 pt-0">
                    <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-[11px] text-muted-foreground font-medium">
                      <div className="flex items-center gap-1 md:gap-1.5 capitalize">
                        <Compass className="w-3 h-3 text-primary/60" />
                        <span>{expedition.trail_count || 0} Trails</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5 capitalize">
                        <MessageSquare className="w-3 h-3 text-primary/60" />
                        <span>{expedition.message_count || 0} Msgs</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-1.5 ml-auto">
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">{formatDate(expedition.updated_at)}</span>
                        <span className="sm:hidden">{formatDate(expedition.updated_at).split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 rounded-full text-xs h-8 md:h-9 bg-primary/90 hover:bg-primary shadow-sm hover:translate-x-1 transition-all group/btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/expedition/${expedition.id}`)
                        }}
                      >
                        <span className="hidden sm:inline">Continue</span>
                        <span className="sm:hidden">Open</span>
                        <ArrowRight className="w-3 h-3 ml-1 md:ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                      <Link
                        href={`/expedition/${expedition.id}/map`}
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={() => {
                          if (!isMapPreloaded) {
                            preloadMapComponents()
                          }
                        }}
                      >
                        <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 rounded-full hover:bg-primary/5 hover:text-primary transition-colors">
                          <MapIcon className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* New Expedition Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[500px] mx-4 p-0 overflow-hidden border-none shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <div className="bg-primary/10 p-6 md:p-8 text-center relative">
            <div className="bg-primary p-3 md:p-4 rounded-2xl w-fit mx-auto mb-3 md:mb-4 shadow-xl shadow-primary/20">
              <Compass className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold">Start New Expedition</DialogTitle>
            <DialogDescription className="text-primary/70 mt-1 text-sm md:text-base">
              Where shall your curiosity take you today?
            </DialogDescription>
            <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10">
              <Sparkles className="w-16 h-16 md:w-24 md:h-24" />
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                Expedition Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., Quantum Mechanics, Cooking Ethics..."
                value={title}
                className="rounded-xl h-10 md:h-12 focus:ring-primary/20 border-accent transition-all"
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
                className="rounded-xl h-10 md:h-12 focus:ring-primary/20 border-accent transition-all"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="p-6 md:p-8 pt-2 flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setShowNewDialog(false)} className="rounded-full px-6 w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || createExpedition.isPending}
              className="rounded-full px-6 md:px-8 shadow-lg shadow-primary/20 min-w-[120px] w-full sm:w-auto"
            >
              {createExpedition.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <span className="hidden sm:inline">Begin Expedition</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
