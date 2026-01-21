import { PDFProcessor, ProcessingResult, ProcessingError } from './types'
import { PdfParseProcessor } from './processors/pdf-parse-processor'
import { PdfjsProcessor } from './processors/pdfjs-processor'
import { Pdf2JsonProcessor } from './processors/pdf2json-processor'

export class PDFProcessorChain {
    private processors: PDFProcessor[]

    constructor() {
        this.processors = [
            new PdfParseProcessor(),
            new PdfjsProcessor(),
            new Pdf2JsonProcessor(),
        ]
    }

    async process(file: File): Promise<ProcessingResult> {
        const startTime = Date.now()
        const fallbacksAttempted: string[] = []

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return {
                success: false,
                error: {
                    type: 'user_error',
                    message: 'PDF file is too large. Please use a file smaller than 10MB.',
                    technicalDetails: `File size: ${file.size} bytes, limit: ${maxSize} bytes`,
                    suggestedAction: 'Reduce file size or split into smaller documents',
                },
                fallbacksAttempted,
            }
        }

        // Convert file to buffer
        let buffer: Buffer
        try {
            const arrayBuffer = await file.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
        } catch (error) {
            return {
                success: false,
                error: {
                    type: 'system_error',
                    message: 'Failed to read PDF file.',
                    technicalDetails: error instanceof Error ? error.message : 'Unknown error',
                    suggestedAction: 'Try uploading the file again',
                },
                fallbacksAttempted,
            }
        }

        // Validate PDF signature
        if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== '%PDF') {
            return {
                success: false,
                error: {
                    type: 'user_error',
                    message: 'Invalid PDF file. Please ensure you are uploading a valid PDF document.',
                    technicalDetails: 'File does not have PDF signature',
                    suggestedAction: 'Upload a valid PDF file',
                },
                fallbacksAttempted,
            }
        }

        // Try each processor in sequence
        for (const processor of this.processors) {
            if (!processor.canHandle(buffer)) {
                continue
            }

            const attemptStart = Date.now()

            try {
                console.log(`Attempting PDF processing with ${processor.name}`)

                const content = await processor.process(buffer)
                const duration = Date.now() - attemptStart

                // Validate content
                if (!content || content.trim().length < 100) {
                    throw new Error('Extracted content is too short or empty')
                }

                // Sanitize content
                const sanitizedContent = this.sanitizeContent(content)

                // Truncate if necessary (30k chars limit for AI processing)
                const finalContent = sanitizedContent.length > 30000
                    ? this.intelligentTruncate(sanitizedContent, 30000)
                    : sanitizedContent

                console.log(`PDF processing successful with ${processor.name} (${duration}ms)`)

                return {
                    success: true,
                    content: finalContent,
                    processorUsed: processor.name,
                    fallbacksAttempted,
                }
            } catch (error) {
                const duration = Date.now() - attemptStart
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'

                fallbacksAttempted.push(processor.name)

                console.warn(`PDF processor ${processor.name} failed (${duration}ms):`, errorMessage)

                // Continue to next processor
                continue
            }
        }

        // All processors failed
        const totalDuration = Date.now() - startTime

        return {
            success: false,
            error: {
                type: 'system_error',
                message: 'Unable to extract text from this PDF. It may be scanned, image-based, or corrupted.',
                technicalDetails: `All processors failed: ${fallbacksAttempted.join(', ')}`,
                suggestedAction: 'Try a different PDF with selectable text, or convert scanned PDFs to text-based format',
            },
            fallbacksAttempted,
        }
    }

    private sanitizeContent(content: string): string {
        // Remove potentially harmful content while preserving structure
        return content
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
    }

    private intelligentTruncate(content: string, maxLength: number): string {
        if (content.length <= maxLength) {
            return content
        }

        // Try to truncate at sentence boundaries
        const truncated = content.substring(0, maxLength)
        const lastSentence = truncated.lastIndexOf('.')
        const lastParagraph = truncated.lastIndexOf('\n\n')

        // Prefer paragraph breaks, then sentence breaks
        const cutPoint = lastParagraph > maxLength * 0.8 ? lastParagraph
            : lastSentence > maxLength * 0.8 ? lastSentence + 1
                : maxLength

        return content.substring(0, cutPoint) + '\n\n[Content truncated for processing...]'
    }
}