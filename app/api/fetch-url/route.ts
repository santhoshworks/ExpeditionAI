import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const fetchUrlSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

/**
 * POST /api/fetch-url
 *
 * Fetches content from a URL and extracts text
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

    const body = await req.json();
    const { url } = fetchUrlSchema.parse(body);

    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ExpeditionAI/1.0; +https://expeditionai.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 400 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const html = await response.text();

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Extract main content - simple HTML to text conversion
    // Remove script and style tags
    let content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");

    // Convert common HTML elements to text
    content = content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<[^>]+>/g, " ") // Remove remaining HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Limit content length (API has token limits)
    const maxLength = 15000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + "...";
    }

    return NextResponse.json({
      title,
      content,
      url,
      contentLength: content.length,
    });
  } catch (error) {
    console.error("URL fetch error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch URL content" },
      { status: 500 }
    );
  }
}
