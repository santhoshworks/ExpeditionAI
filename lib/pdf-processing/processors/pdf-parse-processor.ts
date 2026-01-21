import pdf from 'pdf-parse'
import { PDFProcessor } from '../types'

export class PdfParseProcessor implements PDFProcessor {
    name = 'pdf-parse'

    canHandle(buffer: Buffer): boolean {
        // Check if buffer starts with PDF signature
        return buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF'
    }

    async process(buffer: Buffer): Promise<string> {
        try {
            const data = await pdf(buffer)

            if (!data.text || data.text.trim().length < 100) {
                throw new Error('PDF contains insufficient text content (less than 100 characters)')
            }

            return data.text.trim()
        } catch (error) {
            throw new Error(`pdf-parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}