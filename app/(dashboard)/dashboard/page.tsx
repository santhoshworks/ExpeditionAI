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
import { Plus, Map, BookOpen, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

export default function DashboardPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: expeditions, isLoading } = useExpeditions()
  const createExpedition = useCreateExpedition()
  const deleteExpedition = useDeleteExpedition()
  
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

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
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this expedition?")) {
      try {
        await deleteExpedition.mutateAsync(id)
      } catch (error) {
        console.error("Failed to delete expedition:", error)
      }
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    queryClient.clear()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <span className="text-xl font-bold">ExplorerAI</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Expeditions</h1>
            <p className="text-muted-foreground">
              Start a new learning journey or continue an existing one
            </p>
          </div>
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Expedition
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading expeditions...</p>
          </div>
        ) : !expeditions || expeditions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No expeditions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your first learning journey
              </p>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Expedition
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Expeditions</CardDescription>
                  <CardTitle className="text-3xl">{expeditions.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Trails</CardDescription>
                  <CardTitle className="text-3xl">
                    {expeditions.reduce((sum, e) => sum + (e.trail_count || 0), 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Messages</CardDescription>
                  <CardTitle className="text-3xl">
                    {expeditions.reduce((sum, e) => sum + (e.message_count || 0), 0)}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Expeditions List */}
            <div className="grid gap-4">
              {expeditions.map((expedition) => (
                <Card
                  key={expedition.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => router.push(`/expedition/${expedition.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{expedition.title}</CardTitle>
                        {expedition.description && (
                          <CardDescription className="mb-2">
                            {expedition.description}
                          </CardDescription>
                        )}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{expedition.trail_count || 0} trails</span>
                          <span>{expedition.message_count || 0} messages</span>
                          {expedition.flagged_count > 0 && (
                            <span>🚩 {expedition.flagged_count} flagged</span>
                          )}
                          <span>Last active: {formatDate(expedition.updated_at)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(expedition.id, e)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link href={`/expedition/${expedition.id}`}>
                        <Button variant="outline" size="sm">
                          Continue
                        </Button>
                      </Link>
                      <Link href={`/expedition/${expedition.id}/map`}>
                        <Button variant="outline" size="sm">
                          <Map className="mr-2 h-4 w-4" />
                          View Map
                        </Button>
                      </Link>
                      <Link href={`/expedition/${expedition.id}/journal`}>
                        <Button variant="outline" size="sm">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Journal
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* New Expedition Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Expedition</DialogTitle>
            <DialogDescription>
              Start a new learning journey on any topic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., Understanding Kubernetes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title.trim()) {
                    handleCreate()
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="description"
                placeholder="What would you like to explore?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim() || createExpedition.isPending}>
              {createExpedition.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
