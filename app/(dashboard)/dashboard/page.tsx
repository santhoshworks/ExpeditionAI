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
import { AnalyticsCards } from "@/components/analytics"
import { formatDate } from "@/lib/utils"
import {
  Plus,
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
  Search,
  Filter,
  Zap
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredExpeditions = expeditions?.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-slate-50/50">
        <div className="bg-rose-50 p-6 rounded-3xl mb-6 border border-rose-100 shadow-xl shadow-rose-100/50">
          <Trash2 className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-3">Sync Interrupted</h3>
        <p className="text-slate-500 mb-8 max-w-sm font-medium">There was a temporary disconnect while loading your expeditions. Let&apos;s try reconnecting.</p>
        <Button onClick={() => window.location.reload()} className="h-12 px-8 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200">
          Retry Connection
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
      <div className="container mx-auto px-6 py-10 space-y-10">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Expedition Control
              </h1>
              <p className="text-slate-500 font-medium text-base">
                You have <span className="text-indigo-600 font-bold">{expeditions?.length || 0}</span> active learning journeys.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                onClick={() => setShowNewDialog(true)}
                className="rounded-2xl h-12 px-6 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-base shadow-xl shadow-indigo-100 dark:shadow-none transition-all hover:scale-105 active:scale-95 flex-1 md:flex-initial"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Expedition
              </Button>
            </div>
          </div>

          {/* Analytics with premium style */}
          <div className="p-1.5 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden">
            <AnalyticsCards />
          </div>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 dark:bg-slate-900/30 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Filter by title or topic..."
              className="pl-11 h-12 bg-white dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 rounded-xl focus:ring-indigo-500/10 focus:border-indigo-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className={cn("h-9 w-10 rounded-lg", viewMode === "table" && "bg-white dark:bg-slate-900 shadow-sm")}
                onClick={() => setViewMode("table")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className={cn("h-9 w-10 rounded-lg", viewMode === "grid" && "bg-white dark:bg-slate-900 shadow-sm")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Link href="/wishlist">
              <Button variant="outline" className="h-12 px-5 rounded-xl border-slate-200 dark:border-slate-800 font-bold gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                Wishlist
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-[2rem] bg-white dark:bg-slate-900 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : !filteredExpeditions || filteredExpeditions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-200/50 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] mb-8 relative">
              <Sparkles className="w-12 h-12 text-indigo-500 animate-pulse" />
              <div className="absolute -inset-2 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-[3rem] animate-spin-slow opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No Expeditions Found</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
              {searchTerm ? "No journeys match your current filters." : "You haven't embarked on any learning expeditions yet. Start your first journey today."}
            </p>
            <Button
              onClick={() => {
                if (searchTerm) setSearchTerm("")
                else setShowNewDialog(true)
              }}
              size="lg"
              className="h-12 px-8 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 font-bold text-base transition-all hover:scale-105"
            >
              {searchTerm ? "Clear Search" : "Create Your First Expedition"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExpeditions.map((expedition) => (
                  <Card
                    key={expedition.id}
                    className="group relative overflow-hidden rounded-[2.5rem] border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 h-full flex flex-col transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2 cursor-pointer"
                    onClick={() => router.push(`/expedition/${expedition.id}`)}
                  >
                    {/* Decorative elements */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors" />

                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">
                              {expedition.title}
                            </CardTitle>
                            {expedition.flagged_count > 0 && (
                              <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-100 rounded-lg px-2 py-0.5">
                                <Flag className="w-3 h-3 mr-1" />
                                {expedition.flagged_count}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="line-clamp-2 text-slate-500 font-medium pt-1">
                            {expedition.description || "No specific learning objective set."}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 pt-0 mt-auto flex flex-col gap-6">
                      <div className="flex items-center justify-between py-4 border-y border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Trails</span>
                            <span className="text-base font-bold text-slate-900 dark:text-white">{expedition.trail_count || 0}</span>
                          </div>
                          <div className="w-px h-8 bg-slate-100 dark:bg-slate-800" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Messages</span>
                            <span className="text-base font-bold text-slate-900 dark:text-white">{expedition.message_count || 0}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Last Dive</span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{formatDate(expedition.updated_at).split(' at')[0]}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          className="flex-1 h-11 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 font-bold text-sm group/btn shadow-lg shadow-slate-200 dark:shadow-none"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/expedition/${expedition.id}`)
                          }}
                        >
                          Dive Back In
                          <Zap className="w-4 h-4 ml-2 fill-indigo-400 text-indigo-400" />
                        </Button>
                        <Link href={`/expedition/${expedition.id}/journal`} onClick={e => e.stopPropagation()}>
                          <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-indigo-50">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          onClick={(e) => handleDelete(expedition.id, e)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/80">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-8 h-16 font-bold uppercase text-[10px] tracking-widest text-slate-400">Expedition</TableHead>
                      <TableHead className="h-16 font-bold uppercase text-[10px] tracking-widest text-slate-400">Stats</TableHead>
                      <TableHead className="h-16 font-bold uppercase text-[10px] tracking-widest text-slate-400">Status</TableHead>
                      <TableHead className="h-16 font-bold uppercase text-[10px] tracking-widest text-slate-400">Modified</TableHead>
                      <TableHead className="px-8 h-16 text-right font-bold uppercase text-[10px] tracking-widest text-slate-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpeditions.map((expedition) => (
                      <TableRow
                        key={expedition.id}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 border-slate-100 dark:border-slate-800 cursor-pointer"
                        onClick={() => router.push(`/expedition/${expedition.id}`)}
                      >
                        <TableCell className="px-8 py-6">
                          <div className="space-y-1">
                            <p className="font-black text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors">{expedition.title}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{expedition.description || "No objective set"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Compass className="w-4 h-4 text-indigo-500" />
                              <span className="font-bold text-slate-900 dark:text-white">{expedition.trail_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-indigo-500" />
                              <span className="font-bold text-slate-900 dark:text-white">{expedition.message_count || 0}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {expedition.flagged_count > 0 ? (
                            <Badge className="bg-rose-50 text-rose-600 border-rose-100">
                              <Flag className="w-3 h-3 mr-1" />
                              {expedition.flagged_count} Flagged
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{formatDate(expedition.updated_at).split(' at')[0]}</span>
                            <span className="text-[10px] uppercase font-black text-slate-400">{formatDate(expedition.updated_at).split(' at')[1]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Button size="sm" className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 font-bold">Resume</Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:text-rose-500"
                              onClick={e => handleDelete(expedition.id, e)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Expedition Dialog with premium feel */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-[600px] p-0 border-none shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-[3rem] overflow-hidden">
          <div className="bg-slate-950 p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-indigo-500 to-transparent" />
            </div>
            <div className="bg-indigo-600 p-4 rounded-3xl w-fit mx-auto mb-6 shadow-2xl shadow-indigo-500/20 relative z-10">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-white relative z-10">Start New Expedition</DialogTitle>
            <DialogDescription className="text-slate-400 text-base mt-2 relative z-10 font-medium">
              Where shall your curiosity take you today?
            </DialogDescription>
          </div>

          <div className="p-12 bg-white space-y-8">
            <div className="space-y-3">
              <label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                Expedition Target
              </label>
              <Input
                id="title"
                placeholder="e.g. History of Rome, Quantum Mechanics..."
                value={title}
                className="rounded-2xl h-16 px-6 text-lg border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                Learning Objective (Optional)
              </label>
              <Input
                id="description"
                placeholder="e.g. Focus on architectural developments..."
                value={description}
                className="rounded-2xl h-16 px-6 text-lg border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowNewDialog(false)}
                className="h-14 rounded-2xl flex-1 font-bold text-slate-500 hover:text-slate-950"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || createExpedition.isPending}
                className="h-14 rounded-2xl flex-[2] bg-indigo-600 hover:bg-slate-900 text-white font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                {createExpedition.isPending ? "Configuring..." : "Begin Expedition"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
