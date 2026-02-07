import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/import/anki
 *
 * Imports flashcards from an Anki .apkg file
 *
 * REQUIRED DEPENDENCIES:
 * npm install jszip sql.js
 *
 * The .apkg format is a ZIP containing:
 * - collection.anki2 (or collection.anki21) - SQLite database
 * - media - folder with numbered files for images/audio
 *
 * Key Anki tables:
 * - notes: id, mid (model id), flds (fields separated by \x1f), tags
 * - cards: id, nid (note id), did (deck id), due, ivl, factor
 * - decks: JSON in col.decks column
 * - models: JSON in col.models column
 */
export async function POST(req: NextRequest) {
  // Check feature flag
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

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const deckTitle = formData.get("deckTitle") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".apkg")) {
      return NextResponse.json(
        { error: "File must be an Anki .apkg file" },
        { status: 400 }
      );
    }

    // Dynamically import dependencies
    let JSZip: typeof import("jszip");
    let initSqlJs: typeof import("sql.js").default;

    try {
      JSZip = (await import("jszip")).default;
      initSqlJs = (await import("sql.js")).default;
    } catch {
      return NextResponse.json(
        {
          error:
            "Anki import requires additional dependencies. Please run: npm install jszip sql.js",
        },
        { status: 500 }
      );
    }

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Unzip the .apkg file
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Find the database file (can be collection.anki2 or collection.anki21)
    let dbFile = zip.file("collection.anki2");
    if (!dbFile) {
      dbFile = zip.file("collection.anki21");
    }
    if (!dbFile) {
      return NextResponse.json(
        { error: "Invalid .apkg file: no database found" },
        { status: 400 }
      );
    }

    // Initialize SQL.js
    const SQL = await initSqlJs({
      locateFile: (filename: string) =>
        `https://sql.js.org/dist/${filename}`,
    });

    // Load the database
    const dbData = await dbFile.async("uint8array");
    const db = new SQL.Database(dbData);

    // Get collection info (contains decks and models as JSON)
    const colResult = db.exec("SELECT decks, models FROM col")[0];
    if (!colResult) {
      return NextResponse.json(
        { error: "Invalid database: no collection data" },
        { status: 400 }
      );
    }

    const decksJson = JSON.parse(colResult.values[0][0] as string);
    const modelsJson = JSON.parse(colResult.values[0][1] as string);

    // Get all notes
    const notesResult = db.exec(
      "SELECT id, mid, flds, tags FROM notes ORDER BY id"
    );
    if (!notesResult.length) {
      return NextResponse.json(
        { error: "No notes found in this deck" },
        { status: 400 }
      );
    }

    // Parse notes and extract cards
    const notes = notesResult[0].values.map((row) => ({
      id: row[0] as number,
      modelId: String(row[1]),
      fields: (row[2] as string).split("\x1f"), // Fields are separated by unit separator
      tags: (row[3] as string).split(" ").filter(Boolean),
    }));

    // Get cards with their scheduling info
    const cardsResult = db.exec(`
      SELECT c.id, c.nid, c.did, c.due, c.ivl, c.factor, c.reps, c.lapses
      FROM cards c
      ORDER BY c.nid
    `);

    const cardScheduling = new Map<
      number,
      { ivl: number; factor: number; reps: number; lapses: number }
    >();
    if (cardsResult.length) {
      cardsResult[0].values.forEach((row) => {
        const nid = row[1] as number;
        cardScheduling.set(nid, {
          ivl: row[4] as number,
          factor: (row[5] as number) / 1000, // Anki stores factor * 1000
          reps: row[6] as number,
          lapses: row[7] as number,
        });
      });
    }

    // Map notes to our flashcard format
    const flashcardsToCreate: Array<{
      front: string;
      back: string;
      tags: string[];
      ankiNoteId: number;
      stability: number;
      difficulty: number;
      reps: number;
      lapses: number;
    }> = [];

    for (const note of notes) {
      const model = modelsJson[note.modelId];
      if (!model) continue;

      // Most Anki cards have at least 2 fields: front and back
      // Handle different note types
      const fieldNames = model.flds?.map((f: { name: string }) => f.name) || [];
      const fields = note.fields;

      let front = "";
      let back = "";

      // Try to intelligently map fields
      if (fields.length >= 2) {
        // Basic card: first field is front, second is back
        front = fields[0];
        back = fields[1];
      } else if (fields.length === 1) {
        // Single field - use as front, mark back as incomplete
        front = fields[0];
        back = "(No back content)";
      }

      // Clean HTML from content
      front = stripHtml(front);
      back = stripHtml(back);

      // Skip empty cards
      if (!front.trim()) continue;

      // Get scheduling data if available
      const scheduling = cardScheduling.get(note.id);

      flashcardsToCreate.push({
        front,
        back,
        tags: note.tags,
        ankiNoteId: note.id,
        // Convert Anki scheduling to FSRS approximation
        stability: scheduling?.ivl || 0,
        difficulty: scheduling?.factor ? 10 - scheduling.factor * 2.5 : 5.0, // Rough conversion
        reps: scheduling?.reps || 0,
        lapses: scheduling?.lapses || 0,
      });
    }

    db.close();

    if (flashcardsToCreate.length === 0) {
      return NextResponse.json(
        { error: "No valid flashcards found in this deck" },
        { status: 400 }
      );
    }

    // Create a deck in our database
    const finalDeckTitle = deckTitle || Object.values(decksJson)[0]?.name || "Imported Anki Deck";

    const { data: newDeck, error: deckError } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: user.id,
        expedition_id: null,
        title: finalDeckTitle,
        description: `Imported from Anki: ${flashcardsToCreate.length} cards`,
      })
      .select("id")
      .single();

    if (deckError || !newDeck) {
      console.error("Error creating deck:", deckError);
      return NextResponse.json(
        { error: "Failed to create deck" },
        { status: 500 }
      );
    }

    // Insert flashcards
    const now = new Date().toISOString();
    const flashcardsToInsert = flashcardsToCreate.map((card) => ({
      deck_id: newDeck.id,
      user_id: user.id,
      front: card.front,
      back: card.back,
      source_trail_id: null,
      source_trail_title: "Anki Import",
      source_type: "concept" as const,
      importance: 3,
      // FSRS initial state (using imported values where available)
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: 0,
      scheduled_days: 0,
      reps: card.reps,
      lapses: card.lapses,
      state: card.reps > 0 ? "review" : "new",
      due_date: now,
      last_review_date: null,
      is_suspended: false,
      is_buried: false,
      tags: card.tags,
    }));

    const { error: insertError, data: insertedCards } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select("id");

    if (insertError) {
      console.error("Error inserting flashcards:", insertError);
      return NextResponse.json(
        { error: "Failed to import flashcards" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deckId: newDeck.id,
      deckTitle: finalDeckTitle,
      cardsImported: insertedCards?.length || flashcardsToCreate.length,
      message: `Successfully imported ${flashcardsToCreate.length} cards from Anki`,
    });
  } catch (error) {
    console.error("Anki import error:", error);
    return NextResponse.json(
      { error: "Failed to process Anki file" },
      { status: 500 }
    );
  }
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
