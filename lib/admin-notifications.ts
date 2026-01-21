export interface FallbackUsageEvent {
    type: 'pdf_fallback' | 'youtube_fallback'
    processorUsed: string
    fallbacksAttempted: string[]
    success: boolean
    error?: string
    timestamp: Date
    userId?: string
    sessionId?: string
}

export interface AdminNotificationConfig {
    enabled: boolean
    webhookUrl?: string
    emailEndpoint?: string
    slackWebhook?: string
}

export class AdminNotificationManager {
    private config: AdminNotificationConfig
    private eventBuffer: FallbackUsageEvent[] = []
    private readonly BUFFER_SIZE = 100
    private readonly FLUSH_INTERVAL = 5 * 60 * 1000 // 5 minutes

    constructor(config: AdminNotificationConfig = { enabled: false }) {
        this.config = config

        // Set up periodic flushing in browser environment
        if (typeof window !== 'undefined' && config.enabled) {
            setInterval(() => this.flushEvents(), this.FLUSH_INTERVAL)
        }
    }

    async notifyFallbackUsage(event: Omit<FallbackUsageEvent, 'timestamp'>): Promise<void> {
        if (!this.config.enabled) {
            return
        }

        const fullEvent: FallbackUsageEvent = {
            ...event,
            timestamp: new Date()
        }

        // Add to buffer
        this.eventBuffer.push(fullEvent)

        // Flush if buffer is full
        if (this.eventBuffer.length >= this.BUFFER_SIZE) {
            await this.flushEvents()
        }

        // For critical failures, send immediate notification
        if (!event.success && event.fallbacksAttempted.length >= 2) {
            await this.sendImmediateAlert(fullEvent)
        }
    }

    private async flushEvents(): Promise<void> {
        if (this.eventBuffer.length === 0) {
            return
        }

        const events = [...this.eventBuffer]
        this.eventBuffer = []

        try {
            await this.sendBatchNotification(events)
        } catch (error) {
            console.warn('Failed to send admin notifications:', error)
            // Re-add events to buffer for retry (keep only recent ones)
            this.eventBuffer = [...events.slice(-50), ...this.eventBuffer]
        }
    }

    private async sendBatchNotification(events: FallbackUsageEvent[]): Promise<void> {
        const summary = this.generateSummary(events)

        // Send to configured endpoints
        const promises: Promise<void>[] = []

        if (this.config.webhookUrl) {
            promises.push(this.sendWebhook(this.config.webhookUrl, summary))
        }

        if (this.config.emailEndpoint) {
            promises.push(this.sendEmail(summary))
        }

        if (this.config.slackWebhook) {
            promises.push(this.sendSlackNotification(summary))
        }

        await Promise.allSettled(promises)
    }

    private async sendImmediateAlert(event: FallbackUsageEvent): Promise<void> {
        const alert = {
            type: 'critical_fallback_failure',
            message: `Critical processing failure: ${event.type}`,
            details: {
                processorUsed: event.processorUsed,
                fallbacksAttempted: event.fallbacksAttempted,
                error: event.error,
                timestamp: event.timestamp.toISOString()
            },
            severity: 'high'
        }

        // Send immediate alerts to all configured channels
        const promises: Promise<void>[] = []

        if (this.config.webhookUrl) {
            promises.push(this.sendWebhook(this.config.webhookUrl, alert))
        }

        if (this.config.slackWebhook) {
            promises.push(this.sendSlackAlert(alert))
        }

        await Promise.allSettled(promises)
    }

    private generateSummary(events: FallbackUsageEvent[]) {
        const pdfEvents = events.filter(e => e.type === 'pdf_fallback')
        const youtubeEvents = events.filter(e => e.type === 'youtube_fallback')

        const pdfSuccessRate = pdfEvents.length > 0 ?
            (pdfEvents.filter(e => e.success).length / pdfEvents.length * 100).toFixed(1) : 'N/A'

        const youtubeSuccessRate = youtubeEvents.length > 0 ?
            (youtubeEvents.filter(e => e.success).length / youtubeEvents.length * 100).toFixed(1) : 'N/A'

        const fallbackUsage = events.reduce((acc, event) => {
            event.fallbacksAttempted.forEach(processor => {
                acc[processor] = (acc[processor] || 0) + 1
            })
            return acc
        }, {} as Record<string, number>)

        return {
            type: 'fallback_usage_summary',
            timeRange: {
                start: events[0]?.timestamp.toISOString(),
                end: events[events.length - 1]?.timestamp.toISOString()
            },
            summary: {
                totalEvents: events.length,
                pdfEvents: pdfEvents.length,
                youtubeEvents: youtubeEvents.length,
                pdfSuccessRate: `${pdfSuccessRate}%`,
                youtubeSuccessRate: `${youtubeSuccessRate}%`,
                fallbackUsage,
                failures: events.filter(e => !e.success).length
            },
            events: events.slice(-20) // Include last 20 events for details
        }
    }

    private async sendWebhook(url: string, data: any): Promise<void> {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
    }

    private async sendEmail(summary: any): Promise<void> {
        if (!this.config.emailEndpoint) return

        await fetch(this.config.emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'admin@expeditionai.com',
                subject: 'ExpeditionAI Fallback Usage Report',
                body: this.formatEmailBody(summary)
            })
        })
    }

    private async sendSlackNotification(summary: any): Promise<void> {
        if (!this.config.slackWebhook) return

        const message = {
            text: 'ExpeditionAI Fallback Usage Report',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Fallback Usage Summary*\n\n` +
                            `• Total Events: ${summary.summary.totalEvents}\n` +
                            `• PDF Success Rate: ${summary.summary.pdfSuccessRate}\n` +
                            `• YouTube Success Rate: ${summary.summary.youtubeSuccessRate}\n` +
                            `• Failures: ${summary.summary.failures}`
                    }
                }
            ]
        }

        await fetch(this.config.slackWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        })
    }

    private async sendSlackAlert(alert: any): Promise<void> {
        if (!this.config.slackWebhook) return

        const message = {
            text: '🚨 Critical Processing Failure',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*🚨 ${alert.message}*\n\n` +
                            `• Processor: ${alert.details.processorUsed}\n` +
                            `• Fallbacks Tried: ${alert.details.fallbacksAttempted.join(', ')}\n` +
                            `• Error: ${alert.details.error}\n` +
                            `• Time: ${alert.details.timestamp}`
                    }
                }
            ]
        }

        await fetch(this.config.slackWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
        })
    }

    private formatEmailBody(summary: any): string {
        return `
ExpeditionAI Fallback Usage Report

Time Range: ${summary.timeRange.start} to ${summary.timeRange.end}

Summary:
- Total Events: ${summary.summary.totalEvents}
- PDF Events: ${summary.summary.pdfEvents} (Success Rate: ${summary.summary.pdfSuccessRate})
- YouTube Events: ${summary.summary.youtubeEvents} (Success Rate: ${summary.summary.youtubeSuccessRate})
- Total Failures: ${summary.summary.failures}

Fallback Usage:
${Object.entries(summary.summary.fallbackUsage)
                .map(([processor, count]) => `- ${processor}: ${count} times`)
                .join('\n')}

Recent Events:
${summary.events.map((event: FallbackUsageEvent) =>
                    `- ${event.timestamp.toISOString()}: ${event.type} - ${event.success ? 'SUCCESS' : 'FAILED'} (${event.processorUsed})`
                ).join('\n')}
        `.trim()
    }

    // Public method to get current statistics
    getStatistics(): {
        bufferSize: number
        recentEvents: FallbackUsageEvent[]
        isEnabled: boolean
    } {
        return {
            bufferSize: this.eventBuffer.length,
            recentEvents: this.eventBuffer.slice(-10),
            isEnabled: this.config.enabled
        }
    }
}

// Global instance for the application
export const adminNotifications = new AdminNotificationManager({
    enabled: process.env.NODE_ENV === 'production',
    webhookUrl: process.env.ADMIN_WEBHOOK_URL,
    slackWebhook: process.env.SLACK_WEBHOOK_URL,
})