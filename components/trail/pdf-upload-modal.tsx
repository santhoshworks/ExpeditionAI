"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2,
  CheckSquare,
  Square,
  Upload,
  AlertCircle,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PDFChapter {
  id: string
  title: string
  sections?: PDFSection[]
}

interface PDFSection {
  id: string
  title: string
  summary: string
}

interface PDFUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (expeditionId: string) => void
}

type Step = "upload" | "parsing" | "structure" | "creating" | "error"

export function PDFUploadModal({
  open,
  onOpenChange,
  onSuccess,
}: PDFUploadModalProps) {
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [chapters, setChapters] = useState<PDFChapter[]>([])
  const [expeditionTitle, setExpeditionTitle] = useState("")
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [extractedContent, setExtractedContent] = useState<Record<string, string>>({})

  const resetModal = useCallback(() => {
    setStep("upload")
    setFile(null)
    setChapters([])
    setExpeditionTitle("")
    setSelectedSections(new Set())
    setError(null)
    setExtractedContent({})
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
    setTimeout(resetModal, 200)
  }, [onOpenChange, resetModal])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".pdf")) {
        setError("Please select a PDF file")
        return
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File too large (max 50MB)")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }, [])

  const handleParse = useCallback(async () => {
    if (!file) return

    setStep("parsing")
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/pdf/parse", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to parse PDF")
      }

      const data = await response.json()
      setChapters(data.chapters)
      setExpeditionTitle(file.name.replace(".pdf", ""))
      setExtractedContent(data.extractedContent)

      // Auto-select all sections by default
      const allSectionIds = new Set<string>()
      data.chapters.forEach((chapter: PDFChapter) => {
        chapter.sections?.forEach((section: PDFSection) => {
          allSectionIds.add(`${chapter.id}:${section.id}`)
        })
      })
      setSelectedSections(allSectionIds)

      setStep("structure")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse PDF")
      setStep("error")
    }
  }, [file])

  const toggleSection = useCallback((sectionId: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }, [])

  const toggleChapter = useCallback((chapterId: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev)
      const chapter = chapters.find((ch) => ch.id === chapterId)
      if (!chapter?.sections) return next

      const chapterSections = chapter.sections.map((s) => `${chapterId}:${s.id}`)
      const allSelected = chapterSections.every((id) => next.has(id))

      chapterSections.forEach((id) => {
        if (allSelected) {
          next.delete(id)
        } else {
          next.add(id)
        }
      })

      return next
    })
  }, [chapters])

  const handleCreate = useCallback(async () => {
    if (!expeditionTitle || selectedSections.size === 0) {
      setError("Please select at least one section")
      return
    }

    setStep("creating")
    setError(null)

    try {
      // Build selected sections data
      const selectedData = []
      for (const sectionId of selectedSections) {
        const [chapterId, secId] = sectionId.split(":")
        const chapter = chapters.find((ch) => ch.id === chapterId)
        const section = chapter?.sections?.find((s) => s.id === secId)

        if (section) {
          selectedData.push({
            chapterId,
            sectionId: secId,
            sectionTitle: section.title,
            extractedContent: extractedContent, // Full content (simplified for this task)
          })
        }
      }

      const response = await fetch("/api/pdf/create-expedition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expeditionTitle,
          selectedSections: selectedData,
          pdfFileName: file!.name,
          totalPages: 0, // Could extract from parse response
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create expedition")
      }

      const data = await response.json()
      handleClose()
      onSuccess?.(data.expeditionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expedition")
      setStep("error")
    }
  }, [expeditionTitle, selectedSections, chapters, extractedContent, file, handleClose, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Textbook PDF</DialogTitle>
          <DialogDescription>
            Upload a PDF textbook and select topics to learn
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === "upload" && (
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-input"
                />
                <Label htmlFor="pdf-input" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">Click to upload PDF or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">Max 50MB</p>
                </Label>
              </div>

              {file && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="flex-1 text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </div>
          )}

          {step === "parsing" && (
            <div className="flex items-center justify-center py-16 space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="text-lg text-gray-700">Analyzing PDF structure...</span>
            </div>
          )}

          {step === "structure" && (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3 py-4">
                <div className="mb-4">
                  <Label htmlFor="title">Expedition Title</Label>
                  <Input
                    id="title"
                    value={expeditionTitle}
                    onChange={(e) => setExpeditionTitle(e.target.value)}
                    placeholder="Enter title for this learning expedition"
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Select Topics to Learn</Label>
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="space-y-2">
                      <div
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <Checkbox
                          checked={
                            chapter.sections?.some((s) =>
                              selectedSections.has(`${chapter.id}:${s.id}`)
                            ) ?? false
                          }
                          readOnly
                        />
                        <span className="font-medium text-sm flex-1">{chapter.title}</span>
                      </div>

                      {chapter.sections && (
                        <div className="ml-6 space-y-1">
                          {chapter.sections.map((section) => {
                            const sectionId = `${chapter.id}:${section.id}`
                            return (
                              <div
                                key={sectionId}
                                className="flex items-start gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                                onClick={() => toggleSection(sectionId)}
                              >
                                <Checkbox
                                  checked={selectedSections.has(sectionId)}
                                  readOnly
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{section.title}</p>
                                  <p className="text-xs text-gray-500">{section.summary}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {step === "creating" && (
            <div className="flex items-center justify-center py-16 space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span className="text-lg text-gray-700">Creating trails...</span>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
              <p className="text-lg font-medium text-gray-900">Something went wrong</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleParse}
                disabled={!file}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Parse PDF
              </Button>
            </>
          )}

          {step === "structure" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={selectedSections.size === 0 || !expeditionTitle}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Create Expedition
              </Button>
            </>
          )}

          {step === "error" && (
            <>
              <Button variant="outline" onClick={() => setStep("structure")}>
                Try Again
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
