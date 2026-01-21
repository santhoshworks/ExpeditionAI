export interface DemoExpedition {
    id: string
    title: string
    description: string
    trails: DemoTrail[]
    createdAt: Date
    lastAccessed: Date
    messageCount: number
}

export interface DemoTrail {
    id: string
    expeditionId: string
    parentTrailId?: string
    title: string
    description?: string
    sourceText: string
    isBaseCamp: boolean
    position: number
    messages: DemoMessage[]
    createdAt: Date
}

export interface DemoMessage {
    id: string
    trailId: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
}

export interface DemoLimits {
    maxMessages: 10
    maxTrails: 5
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
    description?: string
    sourceText: string
    isBaseCamp: boolean
    position: number
    messages: StoredDemoMessage[]
    createdAt: string
}

export interface StoredDemoMessage {
    id: string
    trailId: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: string
}