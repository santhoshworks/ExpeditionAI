import { nanoid } from 'nanoid'

export interface DemoMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
}

export interface DemoTrail {
    id: string
    expeditionId: string
    parentTrailId?: string
    title: string
    description: string
    sourceText: string
    isBaseCamp: boolean
    position: number
    messages: DemoMessage[]
    createdAt: Date
}

export interface DemoExpedition {
    id: string
    title: string
    description: string
    trails: DemoTrail[]
    createdAt: Date
    lastAccessed: Date
    messageCount: number
}

export interface DemoLimits {
    maxMessages: number
    maxTrails: number
    messagesUsed: number
    trailsUsed: number
    canAddMessage: boolean
    canAddTrail: boolean
}

export interface StoredDemoExpedition {
    id: string
    title: string
    description: string
    trails: StoredDemoTrail[]
    createdAt: string
    lastAccessed: string
    messageCount: number
}

export interface StoredDemoTrail {
    id: string
    expeditionId: string
    parentTrailId?: string
    title: string
    description: string
    sourceText: string
    isBaseCamp: boolean
    position: number
    messages: StoredDemoMessage[]
    createdAt: string
}

export interface StoredDemoMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
}

export class DemoSessionManager {
    private static readonly STORAGE_KEY = 'expeditionai_demo_sessions'
    public static readonly MAX_MESSAGES = 10
    public static readonly MAX_TRAILS = 5
    private inMemoryStorage: Map<string, DemoExpedition> = new Map()

    constructor() {
        // Clean up old sessions on initialization
        this.cleanupOldSessions()
    }

    createExpedition(topic: string): DemoExpedition {
        const expeditionId = nanoid()
        const now = new Date()

        // Create base camp trail
        const baseCampTrail: DemoTrail = {
            id: nanoid(),
            expeditionId,
            title: topic,
            description: `Base camp for exploring: ${topic}`,
            sourceText: `Welcome to your exploration of ${topic}. This is your starting point for learning about this topic.`,
            isBaseCamp: true,
            position: 0,
            messages: [{
                id: nanoid(),
                role: 'system',
                content: `Welcome to your demo exploration of "${topic}"! I'm here to help you learn about this topic. You can ask me questions, and I'll provide detailed explanations. 

This is a demo with some limitations:
• 10 AI messages per trail
• 5 trails maximum
• Progress isn't saved (resets on refresh)

What would you like to know about ${topic}?`,
                timestamp: now
            }],
            createdAt: now
        }

        const expedition: DemoExpedition = {
            id: expeditionId,
            title: `Demo: ${topic}`,
            description: `Demo expedition exploring ${topic}`,
            trails: [baseCampTrail],
            createdAt: now,
            lastAccessed: now,
            messageCount: 1
        }

        // Store in both memory and session storage
        this.inMemoryStorage.set(expeditionId, expedition)
        this.saveToSessionStorage(expedition)

        return expedition
    }

    getExpedition(expeditionId: string): DemoExpedition | null {
        // Try memory first
        let expedition = this.inMemoryStorage.get(expeditionId)

        if (!expedition) {
            // Try session storage
            expedition = this.loadFromSessionStorage(expeditionId)
            if (expedition) {
                this.inMemoryStorage.set(expeditionId, expedition)
            }
        }

        if (expedition) {
            // Update last accessed
            expedition.lastAccessed = new Date()
            this.saveToSessionStorage(expedition)
        }

        return expedition || null
    }

    addTrail(expeditionId: string, trailData: {
        title: string
        description: string
        sourceText: string
        isBaseCamp?: boolean
        position?: number
        parentTrailId?: string
        messages?: DemoMessage[]
    }): DemoTrail | null {
        const expedition = this.getExpedition(expeditionId)
        if (!expedition) return null

        // Check trail limit
        if (expedition.trails.length >= DemoSessionManager.MAX_TRAILS) {
            return null
        }

        const trail: DemoTrail = {
            id: nanoid(),
            expeditionId,
            parentTrailId: trailData.parentTrailId,
            title: trailData.title,
            description: trailData.description,
            sourceText: trailData.sourceText,
            isBaseCamp: trailData.isBaseCamp || false,
            position: trailData.position || expedition.trails.length,
            messages: trailData.messages || [],
            createdAt: new Date()
        }

        expedition.trails.push(trail)
        expedition.lastAccessed = new Date()

        this.inMemoryStorage.set(expeditionId, expedition)
        this.saveToSessionStorage(expedition)

        return trail
    }

    addMessage(expeditionId: string, trailId: string, message: Omit<DemoMessage, 'id' | 'timestamp'>): boolean {
        const expedition = this.getExpedition(expeditionId)
        if (!expedition) return false

        const trail = expedition.trails.find(t => t.id === trailId)
        if (!trail) return false

        // Check message limit for this trail
        const trailMessages = trail.messages.filter(m => m.role !== 'system').length
        if (trailMessages >= DemoSessionManager.MAX_MESSAGES) {
            return false
        }

        const newMessage: DemoMessage = {
            id: nanoid(),
            ...message,
            timestamp: new Date()
        }

        trail.messages.push(newMessage)
        expedition.messageCount++
        expedition.lastAccessed = new Date()

        this.inMemoryStorage.set(expeditionId, expedition)
        this.saveToSessionStorage(expedition)

        return true
    }

    getTrailMessages(expeditionId: string, trailId: string): DemoMessage[] {
        const expedition = this.getExpedition(expeditionId)
        if (!expedition) return []

        const trail = expedition.trails.find(t => t.id === trailId)
        return trail?.messages || []
    }

    checkLimits(expeditionId: string): DemoLimits {
        const expedition = this.getExpedition(expeditionId)

        if (!expedition) {
            return {
                maxMessages: DemoSessionManager.MAX_MESSAGES,
                maxTrails: DemoSessionManager.MAX_TRAILS,
                messagesUsed: 0,
                trailsUsed: 0,
                canAddMessage: false,
                canAddTrail: false
            }
        }

        const messagesUsed = expedition.trails.reduce((total, trail) =>
            total + trail.messages.filter(m => m.role !== 'system').length, 0
        )
        const trailsUsed = expedition.trails.length

        return {
            maxMessages: DemoSessionManager.MAX_MESSAGES,
            maxTrails: DemoSessionManager.MAX_TRAILS,
            messagesUsed,
            trailsUsed,
            canAddMessage: messagesUsed < DemoSessionManager.MAX_MESSAGES,
            canAddTrail: trailsUsed < DemoSessionManager.MAX_TRAILS
        }
    }

    cleanup(): void {
        this.inMemoryStorage.clear()
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(DemoSessionManager.STORAGE_KEY)
        }
    }

    private saveToSessionStorage(expedition: DemoExpedition): void {
        if (typeof window === 'undefined') {
            return
        }

        try {
            const stored = this.getAllStoredExpeditions()
            stored[expedition.id] = this.serializeExpedition(expedition)
            sessionStorage.setItem(DemoSessionManager.STORAGE_KEY, JSON.stringify(stored))
        } catch (error) {
            // Silently fail - session storage might be full or unavailable
        }
    }

    private loadFromSessionStorage(expeditionId: string): DemoExpedition | null {
        if (typeof window === 'undefined') {
            return null
        }

        try {
            const stored = this.getAllStoredExpeditions()
            const storedExpedition = stored[expeditionId]

            if (storedExpedition) {
                return this.deserializeExpedition(storedExpedition)
            }
        } catch (error) {
            // Silently fail - session storage might be corrupted
        }

        return null
    }

    private getAllStoredExpeditions(): Record<string, StoredDemoExpedition> {
        if (typeof window === 'undefined') return {}

        try {
            const stored = sessionStorage.getItem(DemoSessionManager.STORAGE_KEY)
            return stored ? JSON.parse(stored) : {}
        } catch {
            return {}
        }
    }

    private serializeExpedition(expedition: DemoExpedition): StoredDemoExpedition {
        return {
            id: expedition.id,
            title: expedition.title,
            description: expedition.description,
            trails: expedition.trails.map(trail => ({
                id: trail.id,
                expeditionId: trail.expeditionId,
                parentTrailId: trail.parentTrailId,
                title: trail.title,
                description: trail.description,
                sourceText: trail.sourceText,
                isBaseCamp: trail.isBaseCamp,
                position: trail.position,
                messages: trail.messages.map(message => ({
                    id: message.id,
                    role: message.role,
                    content: message.content,
                    timestamp: message.timestamp.toISOString()
                })),
                createdAt: trail.createdAt.toISOString()
            })),
            createdAt: expedition.createdAt.toISOString(),
            lastAccessed: expedition.lastAccessed.toISOString(),
            messageCount: expedition.messageCount
        }
    }

    private deserializeExpedition(stored: StoredDemoExpedition): DemoExpedition {
        return {
            id: stored.id,
            title: stored.title,
            description: stored.description,
            trails: stored.trails.map(trail => ({
                id: trail.id,
                expeditionId: trail.expeditionId,
                parentTrailId: trail.parentTrailId,
                title: trail.title,
                description: trail.description,
                sourceText: trail.sourceText,
                isBaseCamp: trail.isBaseCamp,
                position: trail.position,
                messages: trail.messages.map(message => ({
                    id: message.id,
                    role: message.role,
                    content: message.content,
                    timestamp: new Date(message.timestamp)
                })),
                createdAt: new Date(trail.createdAt)
            })),
            createdAt: new Date(stored.createdAt),
            lastAccessed: new Date(stored.lastAccessed),
            messageCount: stored.messageCount
        }
    }

    private cleanupOldSessions(): void {
        if (typeof window === 'undefined') return

        try {
            const stored = this.getAllStoredExpeditions()
            const now = new Date()
            const maxAge = 24 * 60 * 60 * 1000 // 24 hours

            let hasChanges = false
            for (const [id, expedition] of Object.entries(stored)) {
                const lastAccessed = new Date(expedition.lastAccessed)
                if (now.getTime() - lastAccessed.getTime() > maxAge) {
                    delete stored[id]
                    hasChanges = true
                }
            }

            if (hasChanges) {
                sessionStorage.setItem(DemoSessionManager.STORAGE_KEY, JSON.stringify(stored))
            }
        } catch (error) {
            // Silently fail - session storage cleanup is not critical
        }
    }
}

export class DemoLimitsEnforcer {
    constructor(private sessionManager: DemoSessionManager) { }

    checkMessageLimit(expeditionId: string, trailId: string): { allowed: boolean; reason?: string } {
        const expedition = this.sessionManager.getExpedition(expeditionId)
        if (!expedition) {
            return { allowed: false, reason: 'Expedition not found' }
        }

        const trail = expedition.trails.find(t => t.id === trailId)
        if (!trail) {
            return { allowed: false, reason: 'Trail not found' }
        }

        const trailMessages = trail.messages.filter(m => m.role !== 'system').length
        if (trailMessages >= DemoSessionManager.MAX_MESSAGES) {
            return {
                allowed: false,
                reason: `Demo limit reached: ${DemoSessionManager.MAX_MESSAGES} messages per trail. Sign up for unlimited messages!`
            }
        }

        return { allowed: true }
    }

    checkTrailLimit(expeditionId: string): { allowed: boolean; reason?: string; remainingTrails?: number } {
        const expedition = this.sessionManager.getExpedition(expeditionId)
        if (!expedition) {
            return { allowed: false, reason: 'Expedition not found' }
        }

        if (expedition.trails.length >= DemoSessionManager.MAX_TRAILS) {
            return {
                allowed: false,
                reason: `Demo limit reached: ${DemoSessionManager.MAX_TRAILS} trails maximum. Sign up for unlimited trails!`
            }
        }

        return {
            allowed: true,
            remainingTrails: DemoSessionManager.MAX_TRAILS - expedition.trails.length
        }
    }

    getLimitsStatus(expeditionId: string): DemoLimits {
        return this.sessionManager.checkLimits(expeditionId)
    }
}