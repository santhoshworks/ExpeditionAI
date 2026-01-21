import { YoutubeTranscript } from 'youtube-transcript'
import { YouTubeProcessor } from '../types'

export class YouTubeTranscriptProcessor implements YouTubeProcessor {
    name = 'youtube-transcript'

    canHandle(videoId: string): boolean {
        // Basic validation of video ID format
        return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
    }

    async extractTranscript(videoId: string): Promise<string> {
        try {
            const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)

            if (!transcriptItems || transcriptItems.length === 0) {
                throw new Error('No transcript items found')
            }

            // Combine transcript items into a single string
            const transcript = transcriptItems
                .map(item => item.text)
                .join(' ')
                .trim()

            if (transcript.length < 100) {
                throw new Error('Transcript too short (less than 100 characters)')
            }

            return transcript
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'

            // Provide more specific error messages
            if (errorMessage.includes('Transcript is disabled')) {
                throw new Error('Video transcript is disabled by the creator')
            } else if (errorMessage.includes('Video unavailable')) {
                throw new Error('Video is unavailable or private')
            } else if (errorMessage.includes('No transcript')) {
                throw new Error('No transcript available for this video')
            }

            throw new Error(`youtube-transcript failed: ${errorMessage}`)
        }
    }
}