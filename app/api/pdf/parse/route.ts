import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { z } from "zod"
import FormData from "form-data"
import fetch from "node-fetch"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

// Schema for parsed PDF structure with position tracking
const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  startPos: z.number(),
  endPos: z.number(),
})

const PDFStructureSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    startPos: z.number(),
    endPos: z.number(),
    sections: z.array(SectionSchema).optional(),
  })
)

type PDFStructure = z.infer<typeof PDFStructureSchema>

export async function POST(req: Request) {
  // Check if PDF parsing is enabled via environment flag
  if (process.env.ENABLE_PDF_PARSING !== "true") {
    return new Response(
      JSON.stringify({
        error: "PDF parsing feature is currently disabled",
        message: "This feature can be enabled via the ENABLE_PDF_PARSING environment variable"
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }

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

    const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB limit

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: "File too large (max 3MB)",
          suggestion: "For better performance, please upload individual chapters rather than entire textbooks."
        }),
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

    // Extract text from parser response (content is an object with text property)
    let pdfContent: string = ""
    if (typeof parsedData.content === 'object' && parsedData.content !== null && 'text' in parsedData.content) {
      pdfContent = parsedData.content.text
    } else if (typeof parsedData.content === 'string') {
      pdfContent = parsedData.content
    }

    // Validate pdfContent is a string and has content
    if (typeof pdfContent !== 'string' || !pdfContent || pdfContent.trim().length === 0) {
      console.error("Invalid pdfContent:", {
        type: typeof pdfContent,
        hasContent: !!pdfContent,
        contentType: typeof parsedData.content
      })
      return new Response(
        JSON.stringify({
          error: "No text content found in PDF. The file may be empty, image-based, or corrupted.",
          suggestion: "Try a PDF with selectable text content."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Check minimum content length
    if (pdfContent.length < 100) {
      return new Response(
        JSON.stringify({
          error: "PDF content too short. Expected textbook content but found minimal text.",
          contentLength: pdfContent.length
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Use LLM to analyze structure and estimate content positions
    const structureAnalysis = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      prompt: `Analyze this PDF textbook content and identify the main structure with content positions.

Return ONLY valid JSON array (no markdown, no code blocks) in this format:
[
  {
    "id": "ch1",
    "title": "Chapter 1: Topic Name",
    "startPos": 0,
    "endPos": 5000,
    "sections": [
      {
        "id": "ch1_s1",
        "title": "1.1 Section Name",
        "summary": "Brief description",
        "startPos": 0,
        "endPos": 2500
      }
    ]
  }
]

Estimate character positions (startPos/endPos) based on section titles found in the text.
If no clear boundaries, divide content proportionally among sections.

PDF Content:
${pdfContent}`,
    })

    // Parse and validate structure
    let structure: PDFStructure
    try {
      const text = structureAnalysis.text.trim()
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```(?:json)?\n?|\n?```/g, "").trim()
      structure = PDFStructureSchema.parse(JSON.parse(cleanText))

      // Validate structure has content
      if (structure.length === 0) {
        throw new Error("No chapters or sections identified in PDF")
      }
    } catch (parseError) {
      console.error("Structure parsing failed:", parseError)

      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError)
      const isZodError = errorMessage.includes("validation") || errorMessage.includes("expected")

      return new Response(
        JSON.stringify({
          error: isZodError
            ? "PDF structure format invalid. The document may not be a standard textbook."
            : "Failed to identify textbook structure. Please ensure it has clear chapters/sections.",
          details: errorMessage,
          suggestion: "Try a PDF with clear chapter headings and section structure."
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Return structure with positions and full content for segmentation
    return new Response(
      JSON.stringify({
        fileName: file.name,
        pageCount: parsedData.pages || 0,
        chapters: structure,
        fullContent: pdfContent, // Full content for section-specific extraction
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
