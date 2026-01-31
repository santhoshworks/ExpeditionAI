"use client"

import { useState, useEffect } from "react"
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
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [pdfParsingEnabled, setPdfParsingEnabled] = useState(false)

  useEffect(() => {
    const checkFeatures = async () => {
      try {
        const response = await fetch("/api/features/check")
        if (response.ok) {
          const data = await response.json()
          setPdfParsingEnabled(data.pdfParsingEnabled)

          // If PDF parsing is disabled, skip choice and go directly to manual mode
          if (!data.pdfParsingEnabled) {
            setMode("manual")
            setManualModalOpen(true)
          }
        }
      } catch (error) {
        console.error("Failed to check feature flags:", error)
      }
    }
    checkFeatures()
  }, [open])

  const handleClose = () => {
    setPdfModalOpen(false)
    setManualModalOpen(false)
    onOpenChange(false)
    setTimeout(() => setMode("choose"), 200)
  }

  const handlePDFMode = () => {
    setMode("pdf")
    setPdfModalOpen(true)
  }

  const handleManualMode = () => {
    setMode("manual")
    setManualModalOpen(true)
  }

  const handlePDFSuccess = (newExpeditionId: string) => {
    handleClose()
    // Optionally navigate to the new expedition
    window.location.href = `/explore/${newExpeditionId}`
  }

  const handlePDFOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPdfModalOpen(false)
      setMode("choose")
    }
  }

  const handleManualOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setManualModalOpen(false)
      setMode("choose")
    }
  }

  return (
    <>
      {/* Choose Mode - Main Dialog */}
      {mode === "choose" && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start Learning</DialogTitle>
              <DialogDescription>
                How would you like to explore?
              </DialogDescription>
            </DialogHeader>

            <div className={`grid gap-3 py-4 ${pdfParsingEnabled ? "grid-cols-2" : "grid-cols-1"}`}>
              <Button
                variant="outline"
                onClick={handleManualMode}
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <Sparkles className="h-6 w-6" />
                <span className="text-sm">Generate Topics</span>
              </Button>

              {pdfParsingEnabled && (
                <Button
                  variant="outline"
                  onClick={handlePDFMode}
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Upload PDF</span>
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* PDF Upload Modal */}
      {mode === "pdf" && (
        <PDFUploadModal
          open={pdfModalOpen}
          onOpenChange={handlePDFOpenChange}
          onSuccess={handlePDFSuccess}
        />
      )}

      {/* Generate Topics Modal */}
      {mode === "manual" && (
        <GenerateTopicsModal
          open={manualModalOpen}
          onOpenChange={handleManualOpenChange}
          expeditionId={expeditionId}
          expeditionTitle={expeditionTitle}
          trails={trails}
        />
      )}
    </>
  )
}
