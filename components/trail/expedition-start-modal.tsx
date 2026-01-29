"use client"

import { useState } from "react"
import { GenerateTopicsModal } from "./generate-topics-modal"
import { PDFUploadModal } from "./pdf-upload-modal"
import { TrailWithCounts } from "@/types/database"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Sparkles } from "lucide-react"

interface ExpeditionStartModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expeditionId: string
  expeditionTitle: string
  trails: TrailWithCounts[]
}

type StartMode = "choose" | "manual" | "pdf"

export function ExpeditionStartModal({
  open,
  onOpenChange,
  expeditionId,
  expeditionTitle,
  trails,
}: ExpeditionStartModalProps) {
  const [mode, setMode] = useState<StartMode>("choose")

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setMode("choose"), 200)
  }

  const handlePDFSuccess = (newExpeditionId: string) => {
    handleClose()
    // Optionally navigate to the new expedition
    window.location.href = `/explore/${newExpeditionId}`
  }

  if (mode === "manual") {
    return (
      <GenerateTopicsModal
        open={open}
        onOpenChange={onOpenChange}
        expeditionId={expeditionId}
        expeditionTitle={expeditionTitle}
        trails={trails}
      />
    )
  }

  if (mode === "pdf") {
    return (
      <PDFUploadModal
        open={open}
        onOpenChange={onOpenChange}
        onSuccess={handlePDFSuccess}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start Learning</DialogTitle>
          <DialogDescription>
            How would you like to explore?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          <Button
            variant="outline"
            onClick={() => setMode("manual")}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <Sparkles className="h-6 w-6" />
            <span className="text-sm">Generate Topics</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setMode("pdf")}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm">Upload PDF</span>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
