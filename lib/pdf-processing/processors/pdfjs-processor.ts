import * as pdfjsLib from 'pdfjs-dist'
import { PDFProcessor } from '../types'

export class PdfjsProcessor implements PDFProcessor {
    name = 'pdfjs-dist'

    canHandle(buffer: Buffer): boolean {
        // Check if buffer starts with PDF signature
        return buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF'
    }

    async process(buffer: Buffer): Promise<string> {
        try {
            // Load PDF document
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(buffer),
                useSystemFonts: true,
            })

            const pdf = await loadingTask.promise
            let fullText = ''

            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum)
                const textContent = await page.getTextContent()

                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ')

                fullText += pageText + '\n'
            }

            const cleanText = fullText.trim()

            if (cleanText.length < 100) {
                throw new Error('PDF contains insufficient text content (less than 100 characters)')
            }

            return cleanText
        } catch (error) {
            throw new Error(`pdfjs-dist failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}