import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/import/pdf
 *
 * Extracts text content from an uploaded PDF file.
 *
 * REQUIRED DEPENDENCY:
 * npm install pdf-parse
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    // Dynamically import pdf-parse
    let pdfParse: typeof import("pdf-parse");
    try {
      pdfParse = (await import("pdf-parse")).default;
    } catch {
      return NextResponse.json(
        {
          error:
            "PDF import requires an additional dependency. Please run: npm install pdf-parse",
        },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);

    // Clean extracted text
    let text = pdfData.text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n") // Collapse multiple blank lines
      .trim();

    // Limit content length
    const maxLength = 20000;
    const truncated = text.length > maxLength;
    if (truncated) {
      text = text.substring(0, maxLength);
    }

    return NextResponse.json({
      title: file.name.replace(/\.pdf$/i, ""),
      content: text,
      pageCount: pdfData.numpages,
      contentLength: text.length,
      truncated,
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from PDF" },
      { status: 500 }
    );
  }
}
