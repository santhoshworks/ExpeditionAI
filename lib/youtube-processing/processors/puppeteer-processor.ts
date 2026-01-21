import { YouTubeProcessor } from '../types'

export class PuppeteerProcessor implements YouTubeProcessor {
    name = 'puppeteer'

    canHandle(videoId: string): boolean {
        // Basic validation of video ID format
        return /^[a-zA-Z0-9_-]{11}$/.test(videoId)
    }

    async extractTranscript(videoId: string): Promise<string> {
        let browser = null

        try {
            // Dynamic import for puppeteer (only load when needed)
            const puppeteer = await import('puppeteer')

            browser = await puppeteer.default.launch({
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
            const url = `https://www.youtube.com/watch?v=${videoId}`
            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })

            // Wait for video player to load
            await page.waitForSelector('#movie_player', { timeout: 10000 })

            // Try to find and click the CC button to enable captions
            try {
                await page.click('.ytp-subtitles-button', { timeout: 5000 })
                await page.waitForTimeout(2000) // Wait for captions to load
            } catch {
                // CC button might not be available or already enabled
            }

            // Extract transcript from caption elements
            const transcript = await page.evaluate(() => {
                const captionElements = document.querySelectorAll('.ytp-caption-segment')
                if (captionElements.length === 0) {
                    return null
                }

                return Array.from(captionElements)
                    .map(el => el.textContent?.trim())
                    .filter(text => text && text.length > 0)
                    .join(' ')
            })

            if (!transcript || transcript.length < 100) {
                throw new Error('No captions found or transcript too short')
            }

            return transcript.trim()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            throw new Error(`puppeteer transcript extraction failed: ${errorMessage}`)
        } finally {
            if (browser) {
                await browser.close()
            }
        }
    }
}