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
