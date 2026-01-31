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

    // 2. Get the pdf_sources content for this trail (handle multiple sources)
    const { data: pdfSources, error: sourcesError } = await supabase
      .from("pdf_sources")
      .select("extracted_content")
      .eq("trail_id", trailId)
      .order("created_at", { ascending: false })

    if (sourcesError) {
      console.error("Error fetching PDF sources:", sourcesError)
      return new Response(
        JSON.stringify({ error: "Failed to fetch PDF content" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    if (!pdfSources || pdfSources.length === 0) {
      return new Response(
        JSON.stringify({ error: "No PDF source found for this trail" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      )
    }

    const pdfSource = pdfSources[0] // Take most recent if multiple exist

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
