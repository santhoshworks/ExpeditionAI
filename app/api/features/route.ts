export async function GET() {
  return new Response(
    JSON.stringify({
      pdfParsingEnabled: process.env.ENABLE_PDF_PARSING === "true",
    }),
    { headers: { "Content-Type": "application/json" } }
  )
}
