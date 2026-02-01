# PDF Textbook Import Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Enable students to upload PDFs, parse structure via LLM, select topics, and create interactive learning expeditions with auto-generated explanations.

**Architecture:**
- PDF upload → document-parser API (raw text extraction) → LLM (structure analysis) → checkbox tree UI → trail creation with async explanation generation
- Integrates with existing expedition/trail infrastructure
- New `pdf_sources` table tracks PDF content mapping

**Tech Stack:**
- Next.js API routes, Supabase (database + auth), OpenAI API, Vercel AI SDK, React hooks, Zod validation

---

## Task 1: Create Database Migration for pdf_sources Table

**Files:**
- Create: `lib/migrations/001_create_pdf_sources.sql`

**Step 1: Write the migration SQL**

```sql
-- Create pdf_sources table to track PDF uploads and content mapping
CREATE TABLE public.pdf_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  pdf_filename TEXT NOT NULL,
  page_start INTEGER,
  page_end INTEGER,
  section_title TEXT,
  extracted_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups by expedition
CREATE INDEX idx_pdf_sources_expedition_id ON public.pdf_sources(expedition_id);
CREATE INDEX idx_pdf_sources_trail_id ON public.pdf_sources(trail_id);

-- Enable RLS
ALTER TABLE public.pdf_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: users can only see their own expedition's PDFs
CREATE POLICY "Users can view their own PDF sources"
  ON public.pdf_sources FOR SELECT
  USING (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );

-- Create RLS policy: users can only insert into their expeditions
CREATE POLICY "Users can insert PDF sources for their expeditions"
  ON public.pdf_sources FOR INSERT
  WITH CHECK (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );
```

**Step 2: Add migration to database type definitions**

Edit `types/database.ts` and add at the end:

```typescript
export interface PDFSource {
  id: string;
  expedition_id: string;
  trail_id: string;
  pdf_filename: string;
  page_start: number | null;
  page_end: number | null;
  section_title: string | null;
  extracted_content: string;
  created_at: string;
  updated_at: string;
}
```

**Step 3: Document how to run the migration**

Create `docs/MIGRATIONS.md`:

```markdown
# Database Migrations

## Running Migrations

Migrations are applied directly in Supabase SQL Editor.

### Migration 001: Create pdf_sources table

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `lib/migrations/001_create_pdf_sources.sql`
4. Run the query
5. Verify table created: check "Tables" in Supabase
```

**Step 4: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add lib/migrations/001_create_pdf_sources.sql types/database.ts docs/MIGRATIONS.md
git commit -m "feat(db): add pdf_sources table for tracking PDF uploads and content mapping"
```

---

## Task 2: Create PDF Parse API Endpoint

**Files:**
- Create: `app/api/pdf/parse/route.ts`

**Step 1: Write the endpoint with error handling**

```typescript
import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"
import FormData from "form-data"
import fetch from "node-fetch"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// Schema for parsed PDF structure
const PDFStructureSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        summary: z.string(),
      })
    ).optional(),
  })
)

type PDFStructure = z.infer<typeof PDFStructureSchema>

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Parse multipart form data
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return new Response(
        JSON.stringify({ error: "File too large (max 50MB)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Call document-parser API
    const parserFormData = new FormData()
    parserFormData.append("file", Buffer.from(await file.arrayBuffer()), file.name)
    parserFormData.append("extract_tables", "true")
    parserFormData.append("include_metadata", "true")

    const parserResponse = await fetch(
      "https://document-parser-api-production-4525.up.railway.app/parse",
      {
        method: "POST",
        body: parserFormData as any, // FormData type compatibility
        headers: parserFormData.getHeaders?.() || {},
      }
    )

    if (!parserResponse.ok) {
      const errorText = await parserResponse.text()
      console.error("Parser API error:", errorText)
      return new Response(
        JSON.stringify({ error: "Failed to parse PDF" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const parsedData = await parserResponse.json()
    const pdfContent = parsedData.content as string

    if (!pdfContent) {
      return new Response(
        JSON.stringify({ error: "No text content extracted from PDF" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Use LLM to analyze structure
    const structureAnalysis = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      prompt: `Analyze this PDF textbook content and identify the main structure (chapters, sections, topics).

Return ONLY valid JSON array (no markdown, no code blocks) in this format:
[
  {
    "id": "ch1",
    "title": "Chapter 1: Topic Name",
    "sections": [
      {
        "id": "ch1_s1",
        "title": "1.1 Section Name",
        "summary": "Brief description of what this section covers"
      }
    ]
  }
]

If the document has no clear chapter structure, treat major sections as chapters.

PDF Content:
${pdfContent.substring(0, 8000)} ${pdfContent.length > 8000 ? "... [content truncated]" : ""}`,
    })

    // Parse and validate structure
    let structure: PDFStructure
    try {
      const text = structureAnalysis.text.trim()
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```(?:json)?\n?|\n?```/g, "").trim()
      structure = PDFStructureSchema.parse(JSON.parse(cleanText))
    } catch (parseError) {
      console.error("Structure parsing failed:", parseError)
      return new Response(
        JSON.stringify({
          error: "Failed to parse PDF structure. Please ensure it's a valid textbook.",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Return with original content for later use
    return new Response(
      JSON.stringify({
        fileName: file.name,
        pageCount: parsedData.pages || 0,
        chapters: structure,
        extractedContent: pdfContent, // Full content for trail creation
        metadata: {
          wordCount: parsedData.word_count || 0,
          uploadedAt: new Date().toISOString(),
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("PDF parse API error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
```

**Step 2: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add app/api/pdf/parse/route.ts
git commit -m "feat(api): add PDF parse endpoint with document-parser integration and LLM structure analysis"
```

---

## Task 3: Create PDF Expedition Creation API Endpoint

**Files:**
- Create: `app/api/pdf/create-expedition/route.ts`

**Step 1: Write the endpoint**

```typescript
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { nanoid } from "nanoid"

const createExpeditionSchema = z.object({
  expeditionTitle: z.string().min(1),
  selectedSections: z.array(
    z.object({
      chapterId: z.string(),
      sectionId: z.string(),
      sectionTitle: z.string(),
      extractedContent: z.string(),
    })
  ).min(1),
  pdfFileName: z.string(),
  totalPages: z.number().optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const {
      expeditionTitle,
      selectedSections,
      pdfFileName,
      totalPages,
    } = createExpeditionSchema.parse(body)

    // 1. Create expedition
    const { data: expedition, error: expeditionError } = await supabase
      .from("expeditions")
      .insert({
        user_id: user.id,
        title: expeditionTitle,
        description: `Learning from: ${pdfFileName}`,
      })
      .select()
      .single()

    if (expeditionError || !expedition) {
      console.error("Expedition creation error:", expeditionError)
      return new Response(
        JSON.stringify({ error: "Failed to create expedition" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // 2. Create base camp trail (overview)
    const { data: baseCamp, error: baseCampError } = await supabase
      .from("trails")
      .insert({
        expedition_id: expedition.id,
        title: "📚 Start Here: Course Overview",
        is_base_camp: true,
        position: 0,
      })
      .select()
      .single()

    if (baseCampError || !baseCamp) {
      console.error("Base camp creation error:", baseCampError)
      return new Response(
        JSON.stringify({ error: "Failed to create base camp" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // 3. Create trails for each selected section
    const trailIds: string[] = []
    const pdfSourceEntries = []

    for (let i = 0; i < selectedSections.length; i++) {
      const section = selectedSections[i]
      const { data: trail, error: trailError } = await supabase
        .from("trails")
        .insert({
          expedition_id: expedition.id,
          title: section.sectionTitle,
          source_text: section.extractedContent.substring(0, 500), // First 500 chars as preview
          is_base_camp: false,
          position: i + 1,
        })
        .select()
        .single()

      if (trailError || !trail) {
        console.error(`Trail creation error for section ${section.sectionId}:`, trailError)
        continue
      }

      trailIds.push(trail.id)

      // Create pdf_sources entry
      pdfSourceEntries.push({
        expedition_id: expedition.id,
        trail_id: trail.id,
        pdf_filename: pdfFileName,
        section_title: section.sectionTitle,
        extracted_content: section.extractedContent,
      })
    }

    // 4. Insert pdf_sources entries
    if (pdfSourceEntries.length > 0) {
      const { error: sourcesError } = await supabase
        .from("pdf_sources")
        .insert(pdfSourceEntries)

      if (sourcesError) {
        console.error("PDF sources creation error:", sourcesError)
        // Non-blocking - continue even if this fails
      }
    }

    // 5. Queue async jobs to generate explanations for each trail
    // For now, we'll call the endpoint directly, but in production use a job queue
    const explanationJobs = trailIds.map(async (trailId) => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/trails/${trailId}/auto-explain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expeditionId: expedition.id }),
        })
      } catch (error) {
        console.error(`Failed to queue explanation for trail ${trailId}:`, error)
      }
    })

    // Fire off async (don't wait)
    Promise.allSettled(explanationJobs).catch(console.error)

    return new Response(
      JSON.stringify({
        expeditionId: expedition.id,
        trailIds,
        baseCampId: baseCamp.id,
        status: "created",
        message: "Expedition created. Generating explanations...",
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Create expedition API error:", error)
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: error.errors }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
```

**Step 2: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add app/api/pdf/create-expedition/route.ts
git commit -m "feat(api): add create expedition endpoint for PDF-sourced trails"
```

---

## Task 4: Create Auto-Explain Trail Endpoint

**Files:**
- Create: `app/api/trails/[trailId]/auto-explain/route.ts`

**Step 1: Write the endpoint**

```typescript
import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

const autoExplainSchema = z.object({
  expeditionId: z.string(),
})

export async function POST(
  req: Request,
  { params }: { params: { trailId: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { trailId } = params
    const body = await req.json()
    const { expeditionId } = autoExplainSchema.parse(body)

    // 1. Get the trail
    const { data: trail, error: trailError } = await supabase
      .from("trails")
      .select("*")
      .eq("id", trailId)
      .single()

    if (trailError || !trail) {
      return new Response(
        JSON.stringify({ error: "Trail not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // 2. Get the pdf_sources content for this trail
    const { data: pdfSource, error: sourcesError } = await supabase
      .from("pdf_sources")
      .select("extracted_content")
      .eq("trail_id", trailId)
      .single()

    if (sourcesError || !pdfSource) {
      return new Response(
        JSON.stringify({ error: "PDF source content not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    // 3. Generate explanation with LLM
    const explanation = await generateText({
      model: openrouter("google/gemini-2.0-flash-001"),
      prompt: `You are an engaging educational tutor. Create a clear, comprehensive explanation of this topic for a student who is learning it for the first time.

Topic: "${trail.title}"

Content to base explanation on:
${pdfSource.extracted_content}

Guidelines:
- Start with a clear definition or introduction
- Use simple language but don't oversimplify
- Include 2-3 key points or concepts
- Use markdown formatting (bold, italics, lists) for clarity
- End with why this topic matters or how it connects to broader learning
- Keep it between 300-500 words
- Make it engaging and conversational`,
    })

    // 4. Save explanation as first assistant message
    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        trail_id: trailId,
        role: "assistant",
        content: explanation.text,
        model: "google/gemini-2.0-flash-001",
      })

    if (messageError) {
      console.error("Failed to save explanation message:", messageError)
      // Don't fail the request - explanation was generated, just couldn't save
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Explanation generated and saved",
      }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Auto-explain API error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
```

**Step 2: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add app/api/trails/\[trailId\]/auto-explain/route.ts
git commit -m "feat(api): add auto-explain endpoint to generate AI explanations for trails"
```

---

## Task 5: Create PDF Upload Modal Component

**Files:**
- Create: `components/trail/pdf-upload-modal.tsx`

**Step 1: Write the component**

```typescript
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
```

**Step 2: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add components/trail/pdf-upload-modal.tsx
git commit -m "feat(ui): add PDF upload modal with structure preview and selection"
```

---

## Task 6: Integrate PDF Modal into Start Expedition Flow

**Files:**
- Modify: `components/trail/generate-topics-modal.tsx`
- Create: `components/trail/expedition-start-modal.tsx` (new wrapper)

**Step 1: Create wrapper modal**

```typescript
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
```

**Step 2: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add components/trail/expedition-start-modal.tsx
git commit -m "feat(ui): add expedition start mode selector for manual or PDF upload"
```

---

## Task 7: Update Trail Chat to Include PDF Content Context

**Files:**
- Modify: `app/api/chat/route.ts:87-89` (enhance system prompt with PDF context)

**Step 1: Update chat route to fetch and include PDF content**

Edit the section where `contextPrompt` is built in `/app/api/chat/route.ts`:

```typescript
// Around line 86-89, replace:
    // Enhanced context for the system prompt
    const contextPrompt = `You are currently assisting the user in an "Expedition" titled "${expeditionTitle}".
${isBaseCamp ? `The user is at the Base Camp, which covers the core topic: "${trailTitle}".` : `The user is currently exploring a specific branch called "${trailTitle}" within this expedition.`}
All questions, quizzes, and summaries should be strictly relevant to this topic unless the user explicitly asks to pivot.`

// With:
    // Enhanced context for the system prompt
    let contextPrompt = `You are currently assisting the user in an "Expedition" titled "${expeditionTitle}".
${isBaseCamp ? `The user is at the Base Camp, which covers the core topic: "${trailTitle}".` : `The user is currently exploring a specific branch called "${trailTitle}" within this expedition.`}
All questions, quizzes, and summaries should be strictly relevant to this topic unless the user explicitly asks to pivot.`

    // Add PDF content context if this is a PDF-sourced trail
    if (!isBaseCamp) {
      const { data: pdfSource } = await supabase
        .from("pdf_sources")
        .select("extracted_content")
        .eq("trail_id", trailId)
        .single()

      if (pdfSource?.extracted_content) {
        contextPrompt += `\n\nRelevant textbook content:\n${pdfSource.extracted_content.substring(0, 3000)}`
      }
    }
```

**Step 2: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add app/api/chat/route.ts
git commit -m "feat(chat): include PDF source content in chat context for accurate responses"
```

---

## Task 8: Update Expedition List to Show PDF Info

**Files:**
- Modify: `components/trail/expedition-card.tsx` (add PDF badge)

**Step 1: Add visual indicator for PDF expeditions**

Create or update `types/database.ts` to include helper:

```typescript
export interface ExpeditionWithSourceInfo extends ExpeditionWithStats {
  hasPDFSources?: boolean
  pdfFileName?: string
}
```

**Step 2: Commit**

```bash
cd .worktrees/feat/pdf-textbook-upload
git add types/database.ts
git commit -m "types: add PDF source info to expedition types"
```

---

## Testing Checklist

After implementation, test these flows:

- [ ] Upload valid PDF → structure parsed correctly
- [ ] Upload invalid PDF → error message shown
- [ ] Select sections → create expedition with correct trails
- [ ] Open trail → AI explanation auto-generated and displayed
- [ ] Ask follow-up question → uses PDF content as context
- [ ] Switch between PDF expeditions → content displays correctly
- [ ] Check database → pdf_sources table populated correctly

---

## Known Limitations & Future Improvements

1. **Full content sent to all trails** - Currently all selected sections get full PDF text. Should be optimized to store only relevant excerpts
2. **Sync explanation generation** - Currently fires async but doesn't wait. Should implement proper job queue (Bull, Inngest, etc.)
3. **Large PDF limit** - 50MB may be too large for some parsing. Monitor and adjust
4. **No indexing** - Could add vector embeddings for semantic search within PDF content
5. **Page ranges not tracked** - Could extract page numbers from parser API for citations

