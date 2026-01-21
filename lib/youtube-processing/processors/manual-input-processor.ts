import { YouTubeProcessor } from '../types'

export class ManualInputProcessor implements YouTubeProcessor {
    name = 'manual-input'

    canHandle(videoId: string): boolean {
        // This processor can handle any video ID as it relies on manual input
        return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
    }

    async extractTranscript(videoId: string): Promise<string> {
        // This processor doesn't actually extract transcripts automatically
        // It's designed to be used when manual input is provided
        // The actual implementation will be handled in the UI layer
        throw new Error('Manual transcript input required - this processor needs user-provided content')
    }

    // Helper method to validate manually provided transcript
    static validateManualTranscript(transcript: string): { valid: boolean; error?: string } {
        if (!transcript || typeof transcript !== 'string') {
            return { valid: false, error: 'Transcript is required' }
        }

        const cleanTranscript = transcript.trim()

        if (cleanTranscript.length < 100) {
            return { valid: false, error: 'Transcript must be at least 100 characters long' }
        }

        if (cleanTranscript.length > 100000) {
            return { valid: false, error: 'Transcript is too long (maximum 100,000 characters)' }
        }

        // Check for suspicious content (all caps, repeated characters, etc.)
        const wordsCount = cleanTranscript.split(/\s+/).length
        if (wordsCount < 20) {
            return { valid: false, error: 'Transcript appears too short or incomplete' }
        }

        return { valid: true }
    }

    // Helper method to clean manually provided transcript
    static cleanManualTranscript(transcript: string): string {
        return transcript
            .trim()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    }
}