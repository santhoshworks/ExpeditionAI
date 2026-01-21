import { nanoid } from 'nanoid'
import {
    DemoExpedition,
    DemoTrail,
    DemoMessage,
    DemoLimits,
    StoredDemoExpedition,
    StoredDemoTrail,
    StoredDemoMessage
} from './types'

export class DemoSessionManager {
    private static readonly STORAGE_KEY = 'expedition-ai-demo'
    private static readonly MAX_MESSAGES = 10
    private static readonly MAX_TRAILS = 5

    private expeditions: Map<string, DemoExpedition> = new Map()
    private hasSessionStorage: boolean

    constructor() {
        this.hasSessionStorage = typeof window !== 'undefined' && !!window.sessionStorage
        this.loadFromStorage()
    }

    createExpedition(topic: string): DemoExpedition {
        const expeditionId = nanoid()
        const now = new Date()

        const expedition: DemoExpedition = {
            id: expeditionId,
            title: topic,
            description: `Demo expedition: ${topic}`,
            trails: [],
            createdAt: now,
            lastAccessed: now,
            messageCount: 0,
        }

        // Create base camp trail
        const baseCampTrail: DemoTrail = {
            id: nanoid(),
            expeditionId,
            title: topic,
            sourceText: `Welcome to your exploration of ${topic}. This is your base camp where you can start your learning journey.`,
            isBaseCamp: true,
            position: 0,
            messages: [],
            createdAt: now,
        }

        expedition.trails.push(baseCampTrail)
        this.expeditions.set(expeditionId, expedition)
        this.saveToStorage()

        return expedition
    }

    getExpedition(expeditionId: string): DemoExpedition | null {
        const expedition = this.expeditions.get(expeditionId)
        if (expedition) {
            expedition.lastAccessed = new Date()
            this.saveToStorage()
        }
        return expedition || null
    }

    addTrail(expeditionId: string, trail: Omit<DemoTrail, 'id' | 'expeditionId' | 'createdAt'>): DemoTrail | null {
        const expedition = this.expeditions.get(expeditionId)
        if (!expedition) {
            return null
        }

        // Check trail limits
        if (expedition.trails.length >= DemoSessionManager.MAX_TRAILS) {
            throw new Error(`Demo limit reached: Maximum ${DemoSessionManager.MAX_TRAILS} trails allowed`)
        }

        const newTrail: DemoTrail = {
            ...trail,
            id: nanoid(),
            expeditionId,
            createdAt: new Date(),
        }

        expedition.trails.push(newTrail)
        expedition.lastAccessed = new Date()
        this.saveToStorage()

        return newTrail
    }

    getTrail(expeditionId: string, trailId: string): DemoTrail | null {
        const expedition = this.expeditions.get(expeditionId)
        if (!expedition) {
            return null
        }

        return expedition.trails.find(trail => trail.id === trailId) || null
    }

    addMessage(expeditionId: string, trailId: string, message: Omit<DemoMessage, 'id' | 'trailId' | 'timestamp'>): DemoMessage | null {
        const expedition = this.expeditions.get(expeditionId)
        if (!expedition) {
            return null
        }

        const trail = expedition.trails.find(t => t.id === trailId)
        if (!trail) {
            return null
        }

        // Check message limits
        const totalMessages = expedition.trails.reduce((sum, t) => sum + t.messages.length, 0)
        if (totalMessages >= DemoSessionManager.MAX_MESSAGES) {
            throw new Error(`Demo limit reached: Maximum ${DemoSessionManager.MAX_MESSAGES} messages allowed`)
        }

        const newMessage: DemoMessage = {
            ...message,
            id: nanoid(),
            trailId,
            timestamp: new Date(),
        }

        trail.messages.push(newMessage)
        expedition.messageCount = totalMessages + 1
        expedition.lastAccessed = new Date()
        this.saveToStorage()

        return newMessage
    }

    getMessages(expeditionId: string, trailId: string): DemoMessage[] {
        const trail = this.getTrail(expeditionId, trailId)
        return trail?.messages || []
    }

    checkLimits(expeditionId: string): DemoLimits {
        const expedition = this.expeditions.get(expeditionId)
        if (!expedition) {
            return {
                maxMessages: DemoSessionManager.MAX_MESSAGES,
                maxTrails: DemoSessionManager.MAX_TRAILS,
                messagesUsed: 0,
                trailsUsed: 0,
                canAddMessage: false,
                canAddTrail: false,
            }
        }

        const messagesUsed = expedition.trails.reduce((sum, trail) => sum + trail.messages.length, 0)
        const trailsUsed = expedition.trails.length

        return {
            maxMessages: DemoSessionManager.MAX_MESSAGES,
            maxTrails: DemoSessionManager.MAX_TRAILS,
            messagesUsed,
            trailsUsed,
            canAddMessage: messagesUsed < DemoSessionManager.MAX_MESSAGES,
            canAddTrail: trailsUsed < DemoSessionManager.MAX_TRAILS,
        }
    }

    cleanup(expeditionId?: string): void {
        if (expeditionId) {
            this.expeditions.delete(expeditionId)
        } else {
            this.expeditions.clear()
        }
        this.saveToStorage()
    }

    // Clean up old expeditions (older than 24 hours)
    cleanupOldExpeditions(): void {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        for (const [id, expedition] of this.expeditions.entries()) {
            if (expedition.lastAccessed < oneDayAgo) {
                this.expeditions.delete(id)
            }
        }

        this.saveToStorage()
    }

    private loadFromStorage(): void {
        if (!this.hasSessionStorage) {
            return
        }

        try {
            const stored = sessionStorage.getItem(DemoSessionManager.STORAGE_KEY)
            if (!stored) {
                return
            }

            const data: StoredDemoExpedition[] = JSON.parse(stored)

            for (const storedExpedition of data) {
                const expedition: DemoExpedition = {
                    ...storedExpedition,
                    createdAt: new Date(storedExpedition.createdAt),
                    lastAccessed: new Date(storedExpedition.lastAccessed),
                    trails: storedExpedition.trails.map(storedTrail => ({
                        ...storedTrail,
                        createdAt: new Date(storedTrail.createdAt),
                        messages: storedTrail.messages.map(storedMessage => ({
                            ...storedMessage,
                            timestamp: new Date(storedMessage.timestamp),
                        })),
                    })),
                }

                this.expeditions.set(expedition.id, expedition)
            }
        } catch (error) {
            console.warn('Failed to load demo session from storage:', error)
            // Clear corrupted data
            if (this.hasSessionStorage) {
                sessionStorage.removeItem(DemoSessionManager.STORAGE_KEY)
            }
        }
    }

    private saveToStorage(): void {
        if (!this.hasSessionStorage) {
            return
        }

        try {
            const expeditionsArray = Array.from(this.expeditions.values())
            const storedData: StoredDemoExpedition[] = expeditionsArray.map(expedition => ({
                ...expedition,
                createdAt: expedition.createdAt.toISOString(),
                lastAccessed: expedition.lastAccessed.toISOString(),
                trails: expedition.trails.map(trail => ({
                    ...trail,
                    createdAt: trail.createdAt.toISOString(),
                    messages: trail.messages.map(message => ({
                        ...message,
                        timestamp: message.timestamp.toISOString(),
                    })),
                })),
            }))

            sessionStorage.setItem(DemoSessionManager.STORAGE_KEY, JSON.stringify(storedData))
        } catch (error) {
            console.warn('Failed to save demo session to storage:', error)
        }
    }

    // Get all expeditions (for debugging/admin purposes)
    getAllExpeditions(): DemoExpedition[] {
        return Array.from(this.expeditions.values())
    }

    // Check if storage is available
    isStorageAvailable(): boolean {
        return this.hasSessionStorage
    }
}