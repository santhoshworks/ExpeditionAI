import { createClient } from "@/lib/supabase/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const enhanceSchema = z.object({
  cardId: z.string().optional(),
  front: z.string().min(1),
  back: z.string().min(1),
  enhanceMode: z.enum([
    "improve_clarity",
    "add_context",
    "make_harder",
    "make_easier",
    "add_mnemonics",
    "split_card",
  ]),
});

/**
 * POST /api/flashcards/enhance
 *
 * Uses AI to improve an individual flashcard based on the selected enhancement mode.
 */
export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_SPACED_REPETITION !== "true") {
    return NextResponse.json(
      { error: "Spaced repetition feature is not enabled" },
      { status: 403 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cardId, front, back, enhanceMode } = enhanceSchema.parse(body);

    const modeInstructions: Record<string, string> = {
      improve_clarity: `Improve the clarity and precision of this flashcard. Make the question more specific and unambiguous. Make the answer more concise and memorable. Fix any factual inaccuracies. Keep the same core concept.`,
      add_context: `Add helpful context to this flashcard. Include a brief example, analogy, or real-world application on the back. Add a hint or mnemonic if appropriate. Keep the front focused but make the back richer.`,
      make_harder: `Make this flashcard more challenging. Transform simple recall into application or analysis. Require deeper understanding to answer correctly. Could add "why" or "how" elements. Keep it fair and answerable.`,
      make_easier: `Simplify this flashcard. Break down complex concepts into simpler terms. Add scaffolding or hints to the question. Make the answer more straightforward. Keep the core learning objective.`,
      add_mnemonics: `Add memory aids to this flashcard. Create a mnemonic device, acronym, visual association, or memorable pattern. Add it to the back of the card as a "Memory Aid:" section.`,
      split_card: `This card tries to test too many things at once. Split it into 2-3 focused cards that each test one specific concept. Each card should be self-contained and clear.`,
    };

    const systemPrompt = `You are an expert flashcard optimizer for spaced repetition learning. Your job is to enhance flashcards to maximize learning efficiency.

${modeInstructions[enhanceMode]}

Return a JSON object with this structure:
${
  enhanceMode === "split_card"
    ? `{
  "cards": [
    { "front": "Question 1", "back": "Answer 1" },
    { "front": "Question 2", "back": "Answer 2" }
  ],
  "explanation": "Brief explanation of what was changed and why"
}`
    : `{
  "front": "Improved question",
  "back": "Improved answer",
  "explanation": "Brief explanation of what was changed and why"
}`
}`;

    const result = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Enhance this flashcard:\n\nFRONT: ${front}\n\nBACK: ${back}`,
      temperature: 0.7,
      maxTokens: 1500,
    });

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse enhancement data");
    }

    const enhancedData = JSON.parse(jsonMatch[0]);

    // If cardId is provided and it's not a split, update the card in the database
    if (cardId && enhanceMode !== "split_card") {
      const { error: updateError } = await supabase
        .from("flashcards")
        .update({
          front: enhancedData.front,
          back: enhancedData.back,
        })
        .eq("id", cardId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating card:", updateError);
        // Return the enhanced data anyway - user can manually update
      }
    }

    // If it's a split and cardId is provided, replace original with new cards
    if (cardId && enhanceMode === "split_card" && enhancedData.cards) {
      // Get the original card to copy deck info
      const { data: originalCard } = await supabase
        .from("flashcards")
        .select("*")
        .eq("id", cardId)
        .eq("user_id", user.id)
        .single();

      if (originalCard) {
        const now = new Date().toISOString();
        const newCards = enhancedData.cards.map(
          (card: { front: string; back: string }) => ({
            deck_id: originalCard.deck_id,
            user_id: user.id,
            front: card.front,
            back: card.back,
            source_trail_id: originalCard.source_trail_id,
            source_trail_title: originalCard.source_trail_title,
            source_type: originalCard.source_type,
            importance: originalCard.importance,
            stability: 0,
            difficulty: 5.0,
            elapsed_days: 0,
            scheduled_days: 0,
            reps: 0,
            lapses: 0,
            state: "new",
            due_date: now,
            last_review_date: null,
            is_suspended: false,
            is_buried: false,
            tags: originalCard.tags || [],
          })
        );

        await supabase.from("flashcards").insert(newCards);

        // Suspend the original (don't delete to preserve review history)
        await supabase
          .from("flashcards")
          .update({ is_suspended: true })
          .eq("id", cardId)
          .eq("user_id", user.id);
      }
    }

    return NextResponse.json({
      enhanced: enhancedData,
      mode: enhanceMode,
      savedToDb: !!cardId,
    });
  } catch (error) {
    console.error("Card enhancement error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to enhance card" },
      { status: 500 }
    );
  }
}
