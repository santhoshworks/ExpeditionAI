"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useExploreStore } from "@/lib/store"
import { useCreateTrail } from "@/lib/queries"
import { Compass } from "lucide-react"
import { useRouter } from "next/navigation"

interface ExploreButtonProps {
  expeditionId: string
  parentTrailId?: string
}

export function ExploreButton({ expeditionId, parentTrailId }: ExploreButtonProps) {
  const { selectedText, setSelectedText, setCurrentTrail, currentTrailId } = useExploreStore()
  const [showDialog, setShowDialog] = useState(false)
  const [title, setTitle] = useState("")
  const createTrail = useCreateTrail()
  const router = useRouter()

  useEffect(() => {
    if (selectedText && !showDialog) {
      setShowDialog(true)
      setTitle("") // Reset title when new text is selected
    }
  }, [selectedText, showDialog])

  const handleExplore = async () => {
    if (!title.trim() || !selectedText) return

    try {
      const trail = await createTrail.mutateAsync({
        expeditionId,
        parentTrailId: parentTrailId || currentTrailId || undefined,
        title: title.trim(),
        sourceText: selectedText,
      })

      setShowDialog(false)
      setSelectedText(null)
      setCurrentTrail(trail.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to create trail:", error)
    }
  }

  const handleCancel = () => {
    setShowDialog(false)
    setSelectedText(null)
    setTitle("")
  }

  if (!selectedText) return null

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🧭 Explore New Trail</DialogTitle>
          <DialogDescription>
            Create a new trail to explore: "{selectedText.substring(0, 100)}
            {selectedText.length > 100 ? "..." : ""}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="trail-title" className="text-sm font-medium">
              Trail Title *
            </label>
            <Input
              id="trail-title"
              placeholder="e.g., Understanding Raft Consensus Algorithm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  handleExplore()
                }
              }}
            />
          </div>
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="font-medium mb-1">Selected Text:</p>
            <p className="text-muted-foreground">{selectedText}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleExplore} disabled={!title.trim() || createTrail.isPending}>
            <Compass className="mr-2 h-4 w-4" />
            {createTrail.isPending ? "Creating..." : "Create Trail"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
