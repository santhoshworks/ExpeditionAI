import { YouTubeProcessor, TranscriptResult, VideoMetadata, RetryConfig } from './types'
import { YouTubeTranscriptProcessor } from './processors/youtube-transcript-processor'
import { PuppeteerProcessor } from './processors/puppeteer-processor'
import { ManualInputProcessor } from './processors/manual-input-processor'

export class YouTubeProcessorChain {
    private processors: YouTubeProcessor[]
    private retryConfig: RetryConfig

    constructor() {
        this.processors = [
            new YouTubeTranscriptProcessor(),
            new PuppeteerProcessor(),
            // Manual input processor is handled separately in UI
        ]

        this.retryConfig = {
            maxRetries: 3,
            baseDelay: 1000,
            maxDelay: 10000,
        }
    }

    // YouTube URL patterns
    private static readonly URL_PATTERNS = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    ]

    static extractVideoId(url: string): string | null {
        for (const pattern of this.URL_PATTERNS) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    }

    async processVideo(url: string): Promise<TranscriptResult> {
        const startTime = Date.now()
        const fallbacksAttempted: string[] = []

        // Extract video ID
        const videoId = YouTubeProcessorChain.extractVideoId(url)
        if (!videoId) {
            return {
                success: false,
                error: {
                    type: 'user_error',
                    message: 'Invalid YouTube URL. Please provide a valid YouTube video link.',
                    technicalDetails: `URL pattern not recognized: ${url}`,
                    suggestedAction: 'Use a standard YouTube URL format (youtube.com/watch?v=... or youtu.be/...)',
                },
                fallbacksAttempted,
            }
        }

        // Get video metadata first
        const metadata = await this.getVideoMetadata(videoId)

        // Try each processor in sequence
        for (const processor of this.processors) {
            if (!processor.canHandle(videoId)) {
                continue
            }

            const attemptStart = Date.now()

            try {
                console.log(`Attempting YouTube transcript extraction with ${processor.name}`)

                const transcript = await this.retryWithBackoff(
                    () => processor.extractTranscript(videoId),
                    processor.name
                )

                const duration = Date.now() - attemptStart

                // Validate transcript
                if (!transcript || transcript.trim().length < 100) {
                    throw new Error('Extracted transcript is too short or empty')
                }

                // Sanitize and truncate if necessary
                const sanitizedTranscript = this.sanitizeContent(transcript)
                const finalTranscript = sanitizedTranscript.length > 50000
                    ? this.intelligentTruncate(sanitizedTranscript, 50000)
                    : sanitizedTranscript

                console.log(`YouTube transcript extraction successful with ${processor.name} (${duration}ms)`)

                return {
                    success: true,
                    transcript: finalTranscript,
                    metadata,
                    processorUsed: processor.name,
                    fallbacksAttempted,
                }
            } catch (error) {
                const duration = Date.now() - attemptStart
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'

                fallbacksAttempted.push(processor.name)

                console.warn(`YouTube processor ${processor.name} failed (${duration}ms):`, errorMessage)

                // Check if this is a rate limit error
                if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
                    return {
                        success: false,
                        error: {
                            type: 'rate_limit',
                            message: 'YouTube service temporarily unavailable. Please try again in a few minutes.',
                            technicalDetails: errorMessage,
                            suggestedAction: 'Wait a few minutes and try again',
                            retryAfter: 300,
                            processorName: processor.name,
                        },
                        fallbacksAttempted,
                    }
                }

                // Continue to next processor
                continue
            }
        }

        // All processors failed - suggest manual input
        const totalDuration = Date.now() - startTime

        return {
            success: false,
            metadata,
            error: {
                type: 'system_error',
                message: 'Could not extract transcript automatically. The video may not have captions available or may be restricted.',
                technicalDetails: `All processors failed: ${fallbacksAttempted.join(', ')}`,
                suggestedAction: 'Try a video with captions enabled, or provide the transcript manually',
            },
            fallbacksAttempted,
        }
    }

    async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
        try {
            // Use YouTube's oEmbed endpoint (no API key needed)
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            const response = await fetch(oembedUrl)

            if (response.ok) {
                const data = await response.json()
                return {
                    title: data.title || `YouTube Video ${videoId}`,
                    description: `Learning expedition based on: ${data.title}`,
                    duration: "Unknown",
                    channelTitle: data.author_name || "YouTube Creator"
                }
            }
        } catch (error) {
            console.warn('Failed to fetch video metadata from oEmbed:', error)
        }

        // Fallback metadata
        return {
            title: `YouTube Video: ${videoId}`,
            description: `Learning expedition created from YouTube video ${videoId}. Explore the content through AI-generated learning trails.`,
            duration: "Unknown",
            channelTitle: "YouTube Creator"
        }
    }

    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        processorName: string
    ): Promise<T> {
        let lastError: Error | null = null

        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                return await operation()
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error')

                // Don't retry on certain types of errors
                if (lastError.message.includes('No transcript') ||
                    lastError.message.includes('disabled') ||
                    lastError.message.includes('private')) {
                    throw lastError
                }

                // Don't retry on the last attempt
                if (attempt === this.retryConfig.maxRetries) {
                    break
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(2, attempt),
                    this.retryConfig.maxDelay
                )

                console.log(`${processorName} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }

        throw lastError || new Error('All retry attempts failed')
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
        const lastSpace = truncated.lastIndexOf(' ')

        // Prefer sentence breaks, then word breaks
        const cutPoint = lastSentence > maxLength * 0.8 ? lastSentence + 1
            : lastSpace > maxLength * 0.8 ? lastSpace
                : maxLength

        return content.substring(0, cutPoint) + ' [Transcript truncated for processing...]'
    }

    // Static method for manual transcript processing
    static processManualTranscript(transcript: string): { success: boolean; content?: string; error?: string } {
        const validation = ManualInputProcessor.validateManualTranscript(transcript)

        if (!validation.valid) {
            return { success: false, error: validation.error }
        }

        const cleanedTranscript = ManualInputProcessor.cleanManualTranscript(transcript)

        return { success: true, content: cleanedTranscript }
    }
}