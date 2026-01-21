import { YoutubeTranscript } from 'youtube-transcript'
import puppeteer from 'puppeteer'
import { adminNotifications } from './admin-notifications'

export interface ProcessingError {
    type: 'user_error' | 'system_error' | 'rate_limit' | 'content_invalid'
    message: string
    technicalDetails?: string
    suggestedAction?: string
    retryAfter?: number
    processorName?: string
}

export interface VideoMetadata {
    title: string
    description: string
    duration: string
    channelTitle: string
}

export interface TranscriptResult {
    success: boolean
    transcript?: string
    metadata?: VideoMetadata
    error?: ProcessingError
    processorUsed?: string
    fallbacksAttempted: string[]
}

export interface YouTubeProcessor {
    name: string
    extractTranscript(videoId: string): Promise<string>
    canHandle(videoId: string): boolean
}

export class YouTubeTranscriptProcessor implements YouTubeProcessor {
    name = 'youtube-transcript'

    canHandle(videoId: string): boolean {
        return videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)
    }

    async extractTranscript(videoId: string): Promise<string> {
        try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)

            if (!transcriptItems || transcriptItems.length === 0) {
                throw new Error('No transcript available for this video')
            }

            // Combine transcript items into a single string
            const transcript = transcriptItems
                .map(item => item.text)
                .join(' ')
                .trim()

            if (transcript.length < 50) {
                throw new Error('Transcript too short or empty')
            }

            return transcript
        } catch (error) {
            throw new Error(`youtube-transcript failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}

export class PuppeteerProcessor implements YouTubeProcessor {
    name = 'puppeteer-scraper'

    canHandle(videoId: string): boolean {
        return videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)
    }

    async extractTranscript(videoId: string): Promise<string> {
        let browser = null

        try {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            })

            const page = await browser.newPage()

            // Set user agent to avoid detection
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

            // Navigate to YouTube video
            await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            })

            // Wait for video to load
            await page.waitForSelector('video', { timeout: 10000 })

            // Try to find and click the CC button to enable captions
            try {
                await page.click('button[aria-label*="Captions"]', { timeout: 5000 })
                await page.waitForTimeout(2000)
            } catch {
                // CC button might not be available or already enabled
            }

            // Extract transcript from caption elements
            const transcript = await page.evaluate(() => {
                const captionElements = document.querySelectorAll('.ytp-caption-segment')
                if (captionElements.length > 0) {
                    return Array.from(captionElements)
                        .map(el => el.textContent?.trim())
                        .filter(text => text && text.length > 0)
                        .join(' ')
                }

                // Fallback: try to get transcript from description or other elements
                const descriptionElement = document.querySelector('#description-text')
                if (descriptionElement) {
                    const descText = descriptionElement.textContent || ''
                    // Look for transcript patterns in description
                    const transcriptMatch = descText.match(/transcript[:\s]+(.*?)(?:\n\n|\[|$)/is)
                    if (transcriptMatch && transcriptMatch[1]) {
                        return transcriptMatch[1].trim()
                    }
                }

                return ''
            })

            if (!transcript || transcript.length < 50) {
                throw new Error('No captions found or transcript too short')
            }

            return transcript
        } catch (error) {
            throw new Error(`puppeteer-scraper failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            if (browser) {
                await browser.close()
            }
        }
    }
}

export class ManualInputProcessor implements YouTubeProcessor {
    name = 'manual-input'

    canHandle(videoId: string): boolean {
        return true // Can always handle as fallback
    }

    async extractTranscript(videoId: string): Promise<string> {
        // This processor doesn't actually extract - it signals that manual input is needed
        throw new Error('Manual transcript input required - automated extraction failed')
    }
}

export class YouTubeProcessorChain {
    private processors: YouTubeProcessor[]
    private retryDelays = [1000, 2000, 4000] // Exponential backoff delays

    constructor() {
        this.processors = [
            new YouTubeTranscriptProcessor(),
            new PuppeteerProcessor(),
            new ManualInputProcessor(),
        ]
    }

    static extractVideoId(url: string): string | null {
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
            /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match && match[1]) {
                return match[1]
            }
        }

        return null
    }

    async processVideo(url: string): Promise<TranscriptResult> {
        const fallbacksAttempted: string[] = []

        try {
            // Extract video ID
            const videoId = YouTubeProcessorChain.extractVideoId(url)
            if (!videoId) {
                return {
                    success: false,
                    error: {
                        type: 'user_error',
                        message: 'Invalid YouTube URL format.',
                        suggestedAction: 'Please provide a valid YouTube video URL (youtube.com/watch?v=... or youtu.be/...)',
                        processorName: 'url-validator'
                    },
                    fallbacksAttempted
                }
            }

            // Get video metadata
            const metadata = await this.getVideoMetadata(videoId)

            // Try each processor with retry logic
            for (const processor of this.processors) {
                if (!processor.canHandle(videoId)) {
                    fallbacksAttempted.push(processor.name)
                    continue
                }

                // Skip manual input processor in automated flow
                if (processor.name === 'manual-input') {
                    fallbacksAttempted.push(processor.name)
                    continue
                }

                try {
                    console.log(`Attempting YouTube processing with ${processor.name}`)
                    const transcript = await this.processWithRetry(processor, videoId)

                    // Validate transcript quality
                    if (transcript.length < 50) {
                        throw new Error('Transcript too short (less than 50 characters)')
                    }

                    // Sanitize and truncate if needed
                    const sanitizedTranscript = this.sanitizeContent(transcript)
                    const finalTranscript = sanitizedTranscript.length > 50000
                        ? this.intelligentTruncate(sanitizedTranscript, 50000)
                        : sanitizedTranscript

                    console.log(`YouTube processed successfully with ${processor.name}, transcript length: ${finalTranscript.length}`)

                    // Notify admin of fallback usage
                    await adminNotifications.notifyFallbackUsage({
                        type: 'youtube_fallback',
                        processorUsed: processor.name,
                        fallbacksAttempted,
                        success: true
                    })

                    return {
                        success: true,
                        transcript: finalTranscript,
                        metadata,
                        processorUsed: processor.name,
                        fallbacksAttempted
                    }
                } catch (error) {
                    console.warn(`${processor.name} failed:`, error)
                    fallbacksAttempted.push(processor.name)

                    // Check if it's a rate limit error
                    if (error instanceof Error && error.message.includes('rate limit')) {
                        return {
                            success: false,
                            error: {
                                type: 'rate_limit',
                                message: 'YouTube service temporarily unavailable due to rate limits.',
                                technicalDetails: error.message,
                                suggestedAction: 'Please try again in a few minutes',
                                retryAfter: 300,
                                processorName: processor.name
                            },
                            fallbacksAttempted
                        }
                    }

                    continue
                }
            }

            // All automated processors failed
            await adminNotifications.notifyFallbackUsage({
                type: 'youtube_fallback',
                processorUsed: 'none',
                fallbacksAttempted,
                success: false,
                error: 'All YouTube processors failed'
            })

            return {
                success: false,
                error: {
                    type: 'user_error',
                    message: 'Unable to extract transcript from this video. The video may not have captions available or may be restricted.',
                    technicalDetails: `All processors failed: ${fallbacksAttempted.join(', ')}`,
                    suggestedAction: 'Try a different video with captions, or manually paste the transcript if available',
                    processorName: 'all-processors'
                },
                fallbacksAttempted
            }

        } catch (error) {
            return {
                success: false,
                error: {
                    type: 'system_error',
                    message: 'Failed to process YouTube video due to a system error.',
                    technicalDetails: error instanceof Error ? error.message : 'Unknown error',
                    suggestedAction: 'Please try again, or contact support if the problem persists',
                    processorName: 'system'
                },
                fallbacksAttempted
            }
        }
    }

    private async processWithRetry(processor: YouTubeProcessor, videoId: string): Promise<string> {
        let lastError: Error | null = null

        for (let attempt = 0; attempt < this.retryDelays.length; attempt++) {
            try {
                return await processor.extractTranscript(videoId)
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error')

                // Don't retry on user errors
                if (lastError.message.includes('No transcript available') ||
                    lastError.message.includes('private') ||
                    lastError.message.includes('restricted')) {
                    throw lastError
                }

                // Wait before retry
                if (attempt < this.retryDelays.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelays[attempt]))
                }
            }
        }

        throw lastError || new Error('All retry attempts failed')
    }

    private async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
        try {
            // Use YouTube's oEmbed endpoint (no API key needed)
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            const response = await fetch(oembedUrl)

            if (response.ok) {
                const data = await response.json()
                return {
                    title: data.title || `YouTube Video ${videoId}`,
                    description: `Learning expedition based on: ${data.title}`,
                    duration: 'Unknown',
                    channelTitle: data.author_name || 'YouTube Creator'
                }
            }
        } catch (error) {
            console.warn('Failed to fetch video metadata from oEmbed:', error)
        }

        // Fallback metadata
        return {
            title: `YouTube Video: ${videoId}`,
            description: `Learning expedition created from YouTube video ${videoId}`,
            duration: 'Unknown',
            channelTitle: 'YouTube Creator'
        }
    }

    private sanitizeContent(content: string): string {
        // Remove potentially harmful content and normalize whitespace
        return content
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\[.*?\]/g, '') // Remove timestamp markers like [00:30]
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

        // Use the best boundary we can find
        const cutPoint = lastSentence > maxLength * 0.8 ? lastSentence + 1 :
            lastSpace > maxLength * 0.9 ? lastSpace :
                maxLength

        return content.substring(0, cutPoint).trim() + ' [Transcript truncated for processing...]'
    }
}