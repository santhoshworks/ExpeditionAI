import pdf from 'pdf-parse'
import * as pdfjsLib from 'pdfjs-dist'
import PDFParser from 'pdf2json'
import { adminNotifications } from './admin-notifications'

// Configure PDF.js worker
if (typeof window === 'undefined') {
    // Server-side configuration - use the correct path for Next.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
}

export interface ProcessingError {
    type: 'user_error' | 'system_error' | 'rate_limit' | 'content_invalid'
    message: string
    technicalDetails?: string
    suggestedAction?: string
    retryAfter?: number
    processorName?: string
}

export interface ProcessingResult {
    success: boolean
    content?: string
    error?: ProcessingError
    processorUsed?: string
    fallbacksAttempted: string[]
}

export interface PDFProcessor {
    name: string
    process(buffer: Buffer): Promise<string>
    canHandle(buffer: Buffer): boolean
}

export class PdfParseProcessor implements PDFProcessor {
    name = 'pdf-parse'

    canHandle(buffer: Buffer): boolean {
        // Check if buffer starts with PDF signature
        return buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF'
    }

    async process(buffer: Buffer): Promise<string> {
        try {
            const data = await pdf(buffer)

            if (!data.text || data.text.trim().length < 10) {
                throw new Error('No readable text found in PDF')
            }

            return data.text.trim()
        } catch (error) {
            throw new Error(`pdf-parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}

export class PdfjsDistProcessor implements PDFProcessor {
    name = 'pdfjs-dist'

    canHandle(buffer: Buffer): boolean {
        return buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF'
    }

    async process(buffer: Buffer): Promise<string> {
        try {
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(buffer),
                useSystemFonts: true,
                disableFontFace: true,
            })

            const pdf = await loadingTask.promise
            const textContent: string[] = []

            // Extract text from all pages
            for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 50); pageNum++) {
                const page = await pdf.getPage(pageNum)
                const content = await page.getTextContent()

                const pageText = content.items
                    .map((item: any) => item.str)
                    .join(' ')
                    .trim()

                if (pageText) {
                    textContent.push(pageText)
                }
            }

            const fullText = textContent.join('\n\n').trim()

            if (!fullText || fullText.length < 10) {
                throw new Error('No readable text found in PDF')
            }

            return fullText
        } catch (error) {
            throw new Error(`pdfjs-dist failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}

export class Pdf2JsonProcessor implements PDFProcessor {
    name = 'pdf2json'

    canHandle(buffer: Buffer): boolean {
        return buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF'
    }

    async process(buffer: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            const pdfParser = new PDFParser()

            pdfParser.on('pdfParser_dataError', (errData: any) => {
                reject(new Error(`pdf2json failed: ${errData.parserError}`))
            })

            pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                try {
                    const textContent: string[] = []

                    if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
                        for (const page of pdfData.Pages) {
                            if (page.Texts && Array.isArray(page.Texts)) {
                                const pageText = page.Texts
                                    .map((text: any) => {
                                        if (text.R && Array.isArray(text.R)) {
                                            return text.R.map((r: any) => decodeURIComponent(r.T || '')).join('')
                                        }
                                        return ''
                                    })
                                    .filter((text: string) => text.trim())
                                    .join(' ')

                                if (pageText.trim()) {
                                    textContent.push(pageText.trim())
                                }
                            }
                        }
                    }

                    const fullText = textContent.join('\n\n').trim()

                    if (!fullText || fullText.length < 10) {
                        reject(new Error('No readable text found in PDF'))
                        return
                    }

                    resolve(fullText)
                } catch (error) {
                    reject(new Error(`pdf2json parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
                }
            })

            // Parse the buffer
            pdfParser.parseBuffer(buffer)
        })
    }
}

export class PDFProcessorChain {
    private processors: PDFProcessor[]

    constructor() {
        this.processors = [
            new PdfParseProcessor(),
            new PdfjsDistProcessor(),
            new Pdf2JsonProcessor(),
        ]
    }

    async process(file: File): Promise<ProcessingResult> {
        const fallbacksAttempted: string[] = []

        try {
            // Convert File to Buffer
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            // Validate file size (10MB limit)
            if (buffer.length > 10 * 1024 * 1024) {
                return {
                    success: false,
                    error: {
                        type: 'user_error',
                        message: 'PDF file is too large. Please use a file smaller than 10MB.',
                        suggestedAction: 'Try compressing the PDF or using a smaller file',
                        processorName: 'size-validator'
                    },
                    fallbacksAttempted
                }
            }

            // Validate PDF signature
            if (buffer.length < 4 || buffer.toString('ascii', 0, 4) !== '%PDF') {
                return {
                    success: false,
                    error: {
                        type: 'user_error',
                        message: 'Invalid file format. Please upload a valid PDF file.',
                        suggestedAction: 'Ensure the file is a PDF and not corrupted',
                        processorName: 'format-validator'
                    },
                    fallbacksAttempted
                }
            }

            // Try each processor in sequence
            for (const processor of this.processors) {
                if (!processor.canHandle(buffer)) {
                    fallbacksAttempted.push(processor.name)
                    continue
                }

                try {
                    console.log(`Attempting PDF processing with ${processor.name}`)
                    const content = await processor.process(buffer)

                    // Validate content quality
                    if (content.length < 100) {
                        throw new Error('Extracted content too short (less than 100 characters)')
                    }

                    // Sanitize content
                    const sanitizedContent = this.sanitizeContent(content)

                    // Truncate if too long (30k chars to stay within token limits)
                    const finalContent = sanitizedContent.length > 30000
                        ? this.intelligentTruncate(sanitizedContent, 30000)
                        : sanitizedContent

                    console.log(`PDF processed successfully with ${processor.name}, content length: ${finalContent.length}`)

                    // Notify admin of fallback usage
                    await adminNotifications.notifyFallbackUsage({
                        type: 'pdf_fallback',
                        processorUsed: processor.name,
                        fallbacksAttempted,
                        success: true
                    })

                    return {
                        success: true,
                        content: finalContent,
                        processorUsed: processor.name,
                        fallbacksAttempted
                    }
                } catch (error) {
                    console.warn(`${processor.name} failed:`, error)
                    fallbacksAttempted.push(processor.name)
                    continue
                }
            }

            // All processors failed
            await adminNotifications.notifyFallbackUsage({
                type: 'pdf_fallback',
                processorUsed: 'none',
                fallbacksAttempted,
                success: false,
                error: 'All PDF processors failed'
            })

            return {
                success: false,
                error: {
                    type: 'user_error',
                    message: 'Unable to extract text from this PDF. It may be scanned, image-based, or corrupted.',
                    technicalDetails: `All processors failed: ${fallbacksAttempted.join(', ')}`,
                    suggestedAction: 'Try a different PDF with selectable text, or convert scanned PDFs using OCR software',
                    processorName: 'all-processors'
                },
                fallbacksAttempted
            }

        } catch (error) {
            return {
                success: false,
                error: {
                    type: 'system_error',
                    message: 'Failed to process PDF due to a system error.',
                    technicalDetails: error instanceof Error ? error.message : 'Unknown error',
                    suggestedAction: 'Please try again, or contact support if the problem persists',
                    processorName: 'system'
                },
                fallbacksAttempted
            }
        }
    }

    private sanitizeContent(content: string): string {
        // Remove potentially harmful content and normalize whitespace
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

        // Use the best boundary we can find
        const cutPoint = lastSentence > maxLength * 0.8 ? lastSentence + 1 :
            lastParagraph > maxLength * 0.7 ? lastParagraph :
                maxLength

        return content.substring(0, cutPoint).trim() + '\n\n[Content truncated for processing...]'
    }
}