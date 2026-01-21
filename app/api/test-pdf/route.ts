import { NextRequest, NextResponse } from "next/server"
import { PDFProcessorChain } from "@/lib/pdf-processing"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const pdfFile = formData.get("pdf") as File

        if (!pdfFile) {
            return NextResponse.json(
                { error: "PDF file is required" },
                { status: 400 }
            )
        }

        console.log(`Testing PDF processing with file: ${pdfFile.name}, size: ${pdfFile.size}`)

        // Test PDF processing
        const pdfProcessor = new PDFProcessorChain()
        const processingResult = await pdfProcessor.process(pdfFile)

        if (!processingResult.success) {
            const error = processingResult.error!
            console.error('PDF processing failed:', error)

            return NextResponse.json({
                success: false,
                error: error.message,
                details: error.technicalDetails,
                suggestedAction: error.suggestedAction,
                processorsFailed: processingResult.fallbacksAttempted
            })
        }

        const textContent = processingResult.content!
        console.log(`PDF processed successfully with ${processingResult.processorUsed}, content length: ${textContent.length}`)

        return NextResponse.json({
            success: true,
            processorUsed: processingResult.processorUsed,
            contentLength: textContent.length,
            contentPreview: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''),
            fallbacksAttempted: processingResult.fallbacksAttempted
        })

    } catch (error) {
        console.error('Error testing PDF processing:', error)
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process PDF",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}