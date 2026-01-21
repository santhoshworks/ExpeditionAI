import { DemoLimits } from './types'
import { DemoSessionManager } from './demo-session-manager'

export interface LimitCheckResult {
    allowed: boolean
    reason?: string
    upgradePrompt?: string
    remainingMessages?: number
    remainingTrails?: number
}

export class DemoLimitsEnforcer {
    private sessionManager: DemoSessionManager

    constructor(sessionManager: DemoSessionManager) {
        this.sessionManager = sessionManager
    }

    checkMessageLimit(expeditionId: string): LimitCheckResult {
        const limits = this.sessionManager.checkLimits(expeditionId)

        if (limits.canAddMessage) {
            return {
                allowed: true,
                remainingMessages: limits.maxMessages - limits.messagesUsed,
            }
        }

        return {
            allowed: false,
            reason: `Demo limit reached: You've used all ${limits.maxMessages} messages.`,
            upgradePrompt: 'Sign up for unlimited messages and save your progress!',
            remainingMessages: 0,
        }
    }

    checkTrailLimit(expeditionId: string): LimitCheckResult {
        const limits = this.sessionManager.checkLimits(expeditionId)

        if (limits.canAddTrail) {
            return {
                allowed: true,
                remainingTrails: limits.maxTrails - limits.trailsUsed,
            }
        }

        return {
            allowed: false,
            reason: `Demo limit reached: You've created all ${limits.maxTrails} trails.`,
            upgradePrompt: 'Sign up for unlimited trails and advanced features!',
            remainingTrails: 0,
        }
    }

    getLimitsStatus(expeditionId: string): DemoLimits & {
        messageWarning?: string
        trailWarning?: string
    } {
        const limits = this.sessionManager.checkLimits(expeditionId)
        const result = { ...limits }

        // Add warnings when approaching limits
        const messageUsagePercent = (limits.messagesUsed / limits.maxMessages) * 100
        const trailUsagePercent = (limits.trailsUsed / limits.maxTrails) * 100

        if (messageUsagePercent >= 80 && limits.canAddMessage) {
            const remaining = limits.maxMessages - limits.messagesUsed
            result.messageWarning = `Only ${remaining} message${remaining === 1 ? '' : 's'} remaining in demo mode`
        }

        if (trailUsagePercent >= 80 && limits.canAddTrail) {
            const remaining = limits.maxTrails - limits.trailsUsed
            result.trailWarning = `Only ${remaining} trail${remaining === 1 ? '' : 's'} remaining in demo mode`
        }

        return result
    }

    generateUpgradePrompt(type: 'message' | 'trail' | 'general'): {
        title: string
        description: string
        benefits: string[]
        ctaText: string
    } {
        const basePrompts = {
            message: {
                title: 'Message Limit Reached',
                description: 'You\'ve used all your demo messages. Sign up to continue the conversation!',
                benefits: [
                    'Unlimited AI conversations',
                    'Save your learning progress',
                    'Create unlimited expeditions',
                    'Access advanced features'
                ],
                ctaText: 'Sign Up for Free'
            },
            trail: {
                title: 'Trail Limit Reached',
                description: 'You\'ve created all your demo trails. Sign up to explore more topics!',
                benefits: [
                    'Unlimited learning trails',
                    'Advanced topic generation',
                    'Progress tracking',
                    'Export your expeditions'
                ],
                ctaText: 'Sign Up for Free'
            },
            general: {
                title: 'Upgrade Your Learning',
                description: 'Ready to unlock the full potential of ExpeditionAI?',
                benefits: [
                    'Unlimited messages and trails',
                    'Save and sync across devices',
                    'Advanced AI features',
                    'Priority support'
                ],
                ctaText: 'Get Started Free'
            }
        }

        return basePrompts[type]
    }

    // Helper method to format limit status for UI display
    formatLimitsForUI(expeditionId: string): {
        messages: { used: number; total: number; percentage: number }
        trails: { used: number; total: number; percentage: number }
        warnings: string[]
        canContinue: boolean
    } {
        const limits = this.getLimitsStatus(expeditionId)
        const warnings: string[] = []

        if (limits.messageWarning) {
            warnings.push(limits.messageWarning)
        }
        if (limits.trailWarning) {
            warnings.push(limits.trailWarning)
        }

        return {
            messages: {
                used: limits.messagesUsed,
                total: limits.maxMessages,
                percentage: Math.round((limits.messagesUsed / limits.maxMessages) * 100)
            },
            trails: {
                used: limits.trailsUsed,
                total: limits.maxTrails,
                percentage: Math.round((limits.trailsUsed / limits.maxTrails) * 100)
            },
            warnings,
            canContinue: limits.canAddMessage || limits.canAddTrail
        }
    }

    // Method to check if user should see upgrade prompts
    shouldShowUpgradePrompt(expeditionId: string): {
        show: boolean
        type: 'message' | 'trail' | 'general'
        urgency: 'low' | 'medium' | 'high'
    } {
        const limits = this.sessionManager.checkLimits(expeditionId)

        // High urgency - limits reached
        if (!limits.canAddMessage && !limits.canAddTrail) {
            return { show: true, type: 'general', urgency: 'high' }
        }

        if (!limits.canAddMessage) {
            return { show: true, type: 'message', urgency: 'high' }
        }

        if (!limits.canAddTrail) {
            return { show: true, type: 'trail', urgency: 'high' }
        }

        // Medium urgency - approaching limits
        const messageUsagePercent = (limits.messagesUsed / limits.maxMessages) * 100
        const trailUsagePercent = (limits.trailsUsed / limits.maxTrails) * 100

        if (messageUsagePercent >= 80 || trailUsagePercent >= 80) {
            return { show: true, type: 'general', urgency: 'medium' }
        }

        // Low urgency - show occasionally
        if (messageUsagePercent >= 50 || trailUsagePercent >= 50) {
            return { show: true, type: 'general', urgency: 'low' }
        }

        return { show: false, type: 'general', urgency: 'low' }
    }
}