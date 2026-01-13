import { createClient } from "@/lib/supabase/server"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { generateText } from "ai"
import { getFeatureModel } from "@/lib/constants"

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
})

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const expeditionId = params.id
        const { model } = await req.json()
        const selectedModel = model || getFeatureModel('JOURNAL_GENERATION')

        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new Response("Unauthorized", { status: 401 })
        }

        // Verify expedition ownership and fetch all trails and messages
        const { data: expedition, error: expeditionError } = await supabase
            .from("expeditions")
            .select(`
        id,
        title,
        user_id,
        trails (
          id,
          title,
          messages (
            role,
            content,
            created_at
          )
        )
      `)
            .eq("id", expeditionId)
            .single()

        if (expeditionError || !expedition) {
            return new Response("Expedition not found", { status: 404 })
        }

        // Cast to any to handle complex join types from Supabase
        const expeditionData = expedition as any

        if (expeditionData.user_id !== user.id) {
            return new Response("Forbidden", { status: 403 })
        }

        // Prepare the content for summarization
        const trails = expeditionData.trails || []
        let learningContext = `Expedition Title: ${expeditionData.title}\n\n`

        const trailIds: string[] = []
        const MAX_MESSAGES_PER_TRAIL = 20 // Limit messages per trail to avoid huge payloads
        const MAX_CONTENT_LENGTH = 50000 // Limit total content length

        trails.forEach((trail: any) => {
            if (learningContext.length >= MAX_CONTENT_LENGTH) return // Stop if we've hit the limit

            trailIds.push(trail.id)
            learningContext += `### Trail: ${trail.title}\n`
            const messages = (trail.messages || []).slice(0, MAX_MESSAGES_PER_TRAIL)
            // Sort messages by created_at
            messages.sort((a: any, b: any) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )

            messages.forEach((msg: any) => {
                if (learningContext.length >= MAX_CONTENT_LENGTH) return
                learningContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`
            })
        })

        const prompt = `
          You are an expert learning assistant. Your task is to create a professional, beautifully formatted, and comprehensive Learning Journal based on the provided learning context.
          
          STRUCTURE REQUIREMENTS:
          1. # [Expedition Title] - Learning Journal
          2. A "Date of Synthesis" section using the current date.
          3. ## Executive Summary: A high-level overview of the entire learning journey.
          4. ## Knowledge Trails: For each trail in the context, create a sub-section (### Trail Name) that summarizes the core concepts, definitions, and unique insights uncovered. Use bullet points for clarity.
          5. ## Synthesized Insights & Connections: Analyze the common threads across different trails and highlight how these concepts interconnect.
          6. ## Critical Takeaways: Lists of the most important for the user to remember.
          
          FORMATTING RULES:
          - USE ONLY MARKDOWN.
          - Use proper heading hierarchy (H1, H2, H3).
          - Use proper sub-heading hierarchy (H4, H5, H6).
          - Use proper list hierarchy (UL, OL).
          - Use proper code block hierarchy 
          - Use proper indendation for points in lists.
          - Use bold text for key terms.
          - Use bullet points and numbered lists where appropriate.
          - DO NOT include any conversational filler, introductory remarks (like "Here is your journal..."), or concluding remarks. Start directly with the H1 title.
          - Maintain a professional, academic, yet engaging tone.
          
          Learning Context:
          ${learningContext}
        `

        const { text } = await generateText({
            model: openrouter(selectedModel),
            prompt: prompt,
        })

        // Save the journal to the database
        const { data: journal, error: journalError } = await supabase
            .from("journals")
            .insert({
                expedition_id: expeditionId,
                content: text,
                trail_ids: trailIds,
                model: selectedModel,
            } as any)
            .select()
            .single()

        if (journalError) {
            console.error("Failed to save journal:", journalError)
            return new Response("Failed to save journal", { status: 500 })
        }

        return Response.json(journal)
    } catch (error) {
        console.error("Journal API error:", error)
        return new Response(
            error instanceof Error ? error.message : "Internal server error",
            { status: 500 }
        )
    }
}

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const expeditionId = params.id
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return new Response("Unauthorized", { status: 401 })
        }

        const { data: journal, error } = await supabase
            .from("journals")
            .select("*")
            .eq("expedition_id", expeditionId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error("Failed to fetch journal:", error)
            return new Response("Failed to fetch journal", { status: 500 })
        }

        return Response.json(journal)
    } catch (error) {
        console.error("Journal API error:", error)
        return new Response(
            error instanceof Error ? error.message : "Internal server error",
            { status: 500 }
        )
    }
}
