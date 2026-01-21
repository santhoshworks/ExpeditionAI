import { PDFProcessor } from '../types'

export class Pdf2JsonProcessor implements PDFProcessor {
    name = 'pdf2json'

    canHandle(buffer: Buffer): boolean {
        // Check if buffer starts with PDF signature
        return buffer.length > 4 && buffer.toString('ascii', 0, 4) === '%PDF'
    }

    async process(buffer: Buffer): Promise<string> {
        try {
            // Dynamic import for pdf2json
            const PDFParser = (await import('pdf2json')).default

            return new Promise((resolve, reject) => {
                const pdfParser = new PDFParser()

                pdfParser.on('pdfParser_dataError', (errData: any) => {
                    reject(new Error(`pdf2json parsing error: ${errData.parserError}`))
                })

                pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                    try {
                        let fullText = ''

                        // Extract text from all pages
                        if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
                            for (const page of pdfData.Pages) {
                                if (page.Texts && Array.isArray(page.Texts)) {
                                    for (const textItem of page.Texts) {
                                        if (textItem.R && Array.isArray(textItem.R)) {
                                            for (const run of textItem.R) {
                                                if (run.T) {
                                                    // Decode URI component and add space
                                                    fullText += decodeURIComponent(run.T) + ' '
                                                }
                                            }
                                        }
                                    }
                                }
                                fullText += '\n'
                            }
                        }

                        const cleanText = fullText.trim()

                        if (cleanText.length < 100) {
                            reject(new Error('PDF contains insufficient text content (less than 100 characters)'))
                            return
                        }

                        resolve(cleanText)
                    } catch (error) {
                        reject(new Error(`pdf2json text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
                    }
                })

                // Parse the buffer
                pdfParser.parseBuffer(buffer)
            })
        } catch (error) {
            throw new Error(`pdf2json failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}