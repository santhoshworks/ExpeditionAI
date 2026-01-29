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
