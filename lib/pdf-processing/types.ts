export interface PDFProcessor {
    name: string
    process(buffer: Buffer): Promise<string>
    canHandle(buffer: Buffer): boolean
}

export interface ProcessingResult {
    success: boolean
    content?: string
    error?: ProcessingError
    processorUsed?: string
    fallbacksAttempted: string[]
}

export interface ProcessingError {
    type: 'user_error' | 'system_error' | 'rate_limit' | 'content_invalid'
    message: string
    technicalDetails?: string
    suggestedAction?: string
    retryAfter?: number
    processorName?: string
}

export interface ProcessingAttempt {
    processorName: string
    success: boolean
    error?: string
    duration: number
    timestamp: Date
}