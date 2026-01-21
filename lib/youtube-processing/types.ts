export interface YouTubeProcessor {
    name: string
    extractTranscript(videoId: string): Promise<string>
    canHandle(videoId: string): boolean
}

export interface TranscriptResult {
    success: boolean
    transcript?: string
    metadata?: VideoMetadata
    error?: ProcessingError
    processorUsed?: string
    fallbacksAttempted: string[]
}

export interface VideoMetadata {
    title: string
    description: string
    duration: string
    channelTitle: string
}

export interface ProcessingError {
    type: 'user_error' | 'system_error' | 'rate_limit' | 'content_invalid'
    message: string
    technicalDetails?: string
    suggestedAction?: string
    retryAfter?: number
    processorName?: string
}

export interface RetryConfig {
    maxRetries: number
    baseDelay: number
    maxDelay: number
}