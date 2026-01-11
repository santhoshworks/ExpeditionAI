"use client"

import { useParams } from "next/navigation"
import { useExpedition, useJournal, useGenerateJournal, useTrails, useUserCredits } from "@/lib/queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  BookOpen,
  RefreshCw,
  Download,
  Calendar,
  Loader2,
  FileDown,
  FileText,
  FileCode
} from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { format } from "date-fns"
import { ModelSelector } from "@/components/chat/model-selector"
import { useExploreStore } from "@/lib/store"
import { useTextSelection } from "@/hooks/use-text-selection"
import { ExploreButton } from "@/components/chat/explore-button"
import React, { useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function JournalPage() {
  const params = useParams()
  const expeditionId = params.id as string
  const { data: expedition, isLoading: isExpeditionLoading } = useExpedition(expeditionId)
  const { data: journal, isLoading: isJournalLoading } = useJournal(expeditionId)
  const { selectedModel, setCurrentExpedition, currentTrailId, setCurrentTrail, userTier, userCredits } = useExploreStore()
  const { mutate: generateJournal, isPending: isGenerating } = useGenerateJournal()
  const { data: trails } = useTrails(expeditionId)

  // Fetch and sync user credits
  useUserCredits()
  const [isExporting, setIsExporting] = React.useState(false)

  // Enable text selection for explore feature
  useTextSelection()

  useEffect(() => {
    if (expeditionId) {
      setCurrentExpedition(expeditionId)
    }
  }, [expeditionId, setCurrentExpedition])

  // Set default trail to base camp if no trail is selected
  useEffect(() => {
    if (trails && trails.length > 0 && !currentTrailId) {
      const baseCamp = trails.find((t: any) => t.is_base_camp)
      if (baseCamp) {
        setCurrentTrail(baseCamp.id)
      } else {
        setCurrentTrail(trails[0].id)
      }
    }
  }, [trails, currentTrailId, setCurrentTrail])

  const handleGenerate = () => {
    generateJournal(
      { expeditionId, model: selectedModel },
      {
        onSuccess: () => {
          console.log("Journal generated successfully!")
        },
        onError: (error) => {
          console.error("Failed to generate journal:", error)
          alert("Failed to generate journal. Please try again.")
        },
      }
    )
  }

  const handleExportMarkdown = () => {
    if (!journal) return
    const blob = new Blob([journal.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${expedition?.title || "expedition"}-journal.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = async () => {
    if (!journal) return
    const element = document.getElementById("journal-card")
    if (!element) return

    setIsExporting(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      })

      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      let heightLeft = pdfHeight
      let position = 0
      const pageHeight = pdf.internal.pageSize.getHeight()

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${expedition?.title || "expedition"}-journal.pdf`)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  if (isExpeditionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading expedition details...</p>
        </div>
      </div>
    )
  }

  if (!expedition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-10 pb-10 text-center">
            <h3 className="text-xl font-bold mb-2">Expedition not found</h3>
            <p className="text-muted-foreground mb-6">We couldn&apos;t find the expedition you&apos;re looking for.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md no-print">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/expedition/${expeditionId}`}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{expedition.title}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Created {format(new Date(expedition.created_at), "PPP")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {journal && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2" disabled={isExporting}>
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportMarkdown} className="gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      Export as Markdown
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <ModelSelector userTier={userTier} userCredits={userCredits} />
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <BookOpen className="h-4 w-4" />
                )}
                {journal ? "Regenerate" : "Generate Journal"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {isJournalLoading ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-40 w-full bg-muted animate-pulse rounded pt-8" />
                </CardContent>
              </Card>
            </div>
          ) : journal ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card id="journal-card" className="border-none shadow-2xl bg-card/50 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden print:shadow-none print:ring-0 print:bg-white print:text-black">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-primary/20" />
                <CardHeader className="pt-10 pb-6 border-b border-white/5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary mb-2">
                        COMPLETED EXPEDITION
                      </div>
                      <CardTitle className="text-4xl font-extrabold tracking-tight text-foreground">
                        {expedition.title}
                      </CardTitle>
                      <CardDescription className="text-lg text-muted-foreground/80 font-medium">
                        Learning Synthesis & Knowledge Consolidation
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-white/5">
                      <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70">Synthesized using</span>
                      <span className="text-primary font-medium">{journal.model?.split('/').pop() || "Advanced AI"}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-10 pb-16 px-6 sm:px-12 bg-journal-pattern">
                  <article className="prose prose-slate dark:prose-invert max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-h1:text-3xl prose-h1:mb-8 prose-h1:text-primary
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:pb-2 prose-h2:border-primary/20
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-primary/80
                    prose-p:text-lg prose-p:leading-relaxed prose-p:text-foreground/80
                    prose-li:text-lg prose-li:my-2
                    prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                    prose-strong:text-foreground prose-strong:font-bold
                    prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {journal.content}
                    </ReactMarkdown>
                  </article>
                </CardContent>
              </Card>

              {/* Action Footer for the Journal */}
              <div className="flex justify-center gap-4 no-print">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2 rounded-full px-8 border-primary/20 hover:bg-primary/5" disabled={isExporting}>
                      {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                      Export Journal
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="min-w-[200px]">
                    <DropdownMenuItem onClick={handleExportPDF} className="gap-3 py-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">Export as PDF</span>
                        <span className="text-xs text-muted-foreground">Print-ready format</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportMarkdown} className="gap-3 py-3">
                      <FileCode className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">Export as Markdown</span>
                        <span className="text-xs text-muted-foreground">For editors & blogs</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="lg" onClick={handleGenerate} disabled={isGenerating} className="gap-2 rounded-full px-8 text-muted-foreground hover:text-primary">
                  <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate Insights
                </Button>
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="py-20 text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <BookOpen size={48} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Your Journey Awaits</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                  Once you&apos;ve explored some trails and gathered knowledge,
                  you can generate a beautiful summary of everything you&apos;ve learned.
                </p>
                <div className="flex flex-col items-center gap-4 mb-4">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Select Synthesis Model</span>
                  <ModelSelector userTier={userTier} userCredits={userCredits} />
                </div>
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2 px-8 py-6 text-lg shadow-lg hover:shadow-primary/20 transition-all"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                  {isGenerating ? "Building your journal..." : "Start Generation"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer / Mobile floating button? */}
      {journal && (
        <div className="fixed bottom-6 right-6 sm:hidden no-print">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl" disabled={isExporting}>
                {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF} className="gap-2">
                <FileText className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMarkdown} className="gap-2">
                <FileCode className="h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="no-print">
        <ExploreButton expeditionId={expeditionId} />
      </div>
    </div>
  )
}
