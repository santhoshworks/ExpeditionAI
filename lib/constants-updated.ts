// Tier types
export type UserTier = 'free' | 'basic' | 'pro'
export type ModelSpeed = 'Very Fast' | 'Fast' | 'Medium'
export type ModelBadge = 'Free' | 'Fast' | 'Premium' | 'Best Value'

// Model configuration with tier-based access
export interface ModelOption {
    id: string
    name: string
    provider: string
    costPerTrail: number // in credits (0 = free)
    speed: ModelSpeed
    tier: UserTier // minimum tier required
    recommended?: boolean
    badge?: ModelBadge
    description: string
    contextLength?: number
}

// All available models with tier restrictions
// Based on OpenRouter API data (January 2026)
export const MODELS: ModelOption[] = [
    // ============================================
    // FREE TIER MODELS (0 cost)
    // ============================================
    // Note: mistralai/devstral-2512:free was removed as OpenRouter now requires higher tier access
    {
        id: 'xiaomi/mimo-v2-flash:free',
        name: 'Xiaomi MiMo V2 Flash',
        provider: 'Xiaomi',
        costPerTrail: 0,
        speed: 'Very Fast',
        tier: 'free',
        badge: 'Free',
        description: 'Fast and efficient free model',
        contextLength: 262144,
    },
    {
        id: 'nvidia/nemotron-3-nano-30b-a3b:free',
        name: 'NVIDIA Nemotron 3 Nano',
        provider: 'NVIDIA',
        costPerTrail: 0,
        speed: 'Fast',
        tier: 'free',
        badge: 'Free',
        description: 'Powerful 30B parameter free model',
        contextLength: 256000,
    },
    {
        id: 'deepseek/deepseek-r1-0528:free',
        name: 'DeepSeek R1',
        provider: 'DeepSeek',
        costPerTrail: 0,
        speed: 'Fast',
        tier: 'free',
        badge: 'Free',
        description: 'Advanced reasoning model',
        contextLength: 163840,
    },

    // ============================================
    // BASIC TIER MODELS (Budget-friendly)
    // ============================================
    {
        id: 'google/gemini-2.0-flash-001',
        name: 'Gemini 2.0 Flash',
        provider: 'Google',
        costPerTrail: 0.5,
        speed: 'Very Fast',
        tier: 'basic',
        recommended: true,
        badge: 'Best Value',
        description: 'Recommended for most learning tasks',
        contextLength: 1048576,
    },
    {
        id: 'google/gemini-2.0-flash-lite-001',
        name: 'Gemini 2.0 Flash Lite',
        provider: 'Google',
        costPerTrail: 0.25,
        speed: 'Very Fast',
        tier: 'basic',
        badge: 'Fast',
        description: 'Ultra-fast and cost-efficient',
        contextLength: 1048576,
    },
    {
        id: 'meta-llama/llama-3.2-3b-instruct',
        name: 'Llama 3.2 3B',
        provider: 'Meta',
        costPerTrail: 0.3,
        speed: 'Very Fast',
        tier: 'basic',
        badge: 'Fast',
        description: 'Compact and efficient',
        contextLength: 131072,
    },
    {
        id: 'mistralai/mistral-nemo',
        name: 'Mistral Nemo',
        provider: 'Mistral',
        costPerTrail: 0.4,
        speed: 'Fast',
        tier: 'basic',
        description: 'Balanced performance and cost',
        contextLength: 131072,
    },
    {
        id: 'meta-llama/llama-3.1-8b-instruct',
        name: 'Llama 3.1 8B',
        provider: 'Meta',
        costPerTrail: 0.5,
        speed: 'Fast',
        tier: 'basic',
        description: 'Strong general-purpose model',
        contextLength: 16384,
    },
    {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        costPerTrail: 0.8,
        speed: 'Fast',
        tier: 'basic',
        description: 'Strong reasoning & explanations',
        contextLength: 128000,
    },
    {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        costPerTrail: 1.2,
        speed: 'Fast',
        tier: 'basic',
        description: 'Creative, engaging learning style',
        contextLength: 200000,
    },
    {
        id: 'google/gemini-2.0-flash-thinking-001',
        name: 'Gemini 2.0 Flash Thinking',
        provider: 'Google',
        costPerTrail: 1.5,
        speed: 'Fast',
        tier: 'basic',
        description: 'Enhanced reasoning capabilities',
        contextLength: 1048576,
    },

    // ============================================
    // PRO TIER MODELS (Premium)
    // ============================================
    {
        id: 'deepseek/deepseek-v3.1-terminus',
        name: 'DeepSeek V3.1 Terminus',
        provider: 'DeepSeek',
        costPerTrail: 2,
        speed: 'Fast',
        tier: 'pro',
        recommended: true,
        badge: 'Best Value',
        description: 'Advanced reasoning at great value',
        contextLength: 163840,
    },
    {
        id: 'google/gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'Google',
        costPerTrail: 2.5,
        speed: 'Fast',
        tier: 'pro',
        description: 'Latest model with advanced reasoning',
        contextLength: 1048576,
    },
    {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini 1.5 Pro',
        provider: 'Google',
        costPerTrail: 3,
        speed: 'Medium',
        tier: 'pro',
        description: 'Deep analysis & complex topics',
        contextLength: 2097152,
    },
    {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        costPerTrail: 4,
        speed: 'Medium',
        tier: 'pro',
        description: 'Best for complex analysis',
        contextLength: 200000,
    },
    {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        costPerTrail: 5,
        speed: 'Medium',
        tier: 'pro',
        badge: 'Premium',
        description: 'Highest quality responses',
        contextLength: 128000,
    },
    {
        id: 'anthropic/claude-3.7-sonnet',
        name: 'Claude 3.7 Sonnet',
        provider: 'Anthropic',
        costPerTrail: 6,
        speed: 'Medium',
        tier: 'pro',
        badge: 'Premium',
        description: 'Latest Claude with enhanced capabilities',
        contextLength: 200000,
    },
    {
        id: 'google/gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'Google',
        costPerTrail: 8,
        speed: 'Medium',
        tier: 'pro',
        badge: 'Premium',
        description: 'Most advanced Gemini model',
        contextLength: 1048576,
    },
    {
        id: 'openai/gpt-5',
        name: 'GPT-5',
        provider: 'OpenAI',
        costPerTrail: 10,
        speed: 'Medium',
        tier: 'pro',
        badge: 'Premium',
        description: 'Latest OpenAI flagship model',
        contextLength: 400000,
    },
] as const

// Default model for each tier
export const DEFAULT_MODELS: Record<UserTier, string> = {
    free: 'xiaomi/mimo-v2-flash:free', // Changed from mistralai/devstral-2512:free which now requires higher tier on OpenRouter
    basic: 'google/gemini-2.0-flash-001',
    pro: 'deepseek/deepseek-v3.1-terminus',
}

// Tier configurations
export interface TierConfig {
    name: string
    price: number // in dollars, 0 for free
    credits: number // included credits
    bonusCredits: number // bonus credits for pro
    trailsPerDay: number | null // null = unlimited
    features: string[]
}

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
    free: {
        name: 'Free',
        price: 0,
        credits: 0,
        bonusCredits: 0,
        trailsPerDay: 15,
        features: [
            'Free models (Mistral, DeepSeek, NVIDIA)',
            '15 trails per day',
            'Basic features',
        ],
    },
    basic: {
        name: 'Basic',
        price: 5,
        credits: 200,
        bonusCredits: 0,
        trailsPerDay: null,
        features: [
            '200 credits (~400 trails with Gemini Flash)',
            'Gemini 2.0 Flash, GPT-4o Mini, Claude Haiku',
            'Fast response times',
            'No daily limits',
        ],
    },
    pro: {
        name: 'Pro',
        price: 15,
        credits: 600,
        bonusCredits: 100,
        trailsPerDay: null,
        features: [
            '600 credits + 100 bonus (~140 trails with GPT-4o)',
            'All models including GPT-5, Claude 3.7, Gemini 2.5 Pro',
            'Priority speed',
            'Advanced features (mind maps, video summaries)',
        ],
    },
}

// Helper to get models available for a tier
export function getAvailableModels(userTier: UserTier): ModelOption[] {
    const tierOrder: UserTier[] = ['free', 'basic', 'pro']
    const userTierIndex = tierOrder.indexOf(userTier)

    return MODELS.filter(model => {
        const modelTierIndex = tierOrder.indexOf(model.tier)
        return modelTierIndex <= userTierIndex
    })
}

// Helper to check if user can use a model
export function canUseModel(userTier: UserTier, modelId: string): boolean {
    const model = MODELS.find(m => m.id === modelId)
    if (!model) return false

    const tierOrder: UserTier[] = ['free', 'basic', 'pro']
    const userTierIndex = tierOrder.indexOf(userTier)
    const modelTierIndex = tierOrder.indexOf(model.tier)

    return modelTierIndex <= userTierIndex
}

// Helper to get model by ID
export function getModelById(modelId: string): ModelOption | undefined {
    return MODELS.find(m => m.id === modelId)
}

// Legacy export for backward compatibility
export const POPULAR_MODELS = MODELS.map(m => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
}))

export const DEFAULT_MODEL = DEFAULT_MODELS.free

// Feature-specific model assignments
export const FEATURE_MODELS = {
    // Chat feature - uses user-selected model with tier validation
    CHAT: {
        // Handled dynamically based on user selection and tier
        fallback: DEFAULT_MODELS,
    },

    // Topic generation for expeditions
    TOPIC_GENERATION: 'google/gemini-2.0-flash-lite-001',

    // Journal/summary generation
    JOURNAL_GENERATION: 'google/gemini-2.0-flash-001',

    // Illustration prompt generation
    ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-lite-001',

    // Define feature - vocabulary definitions
    DEFINE_FEATURE: 'google/gemini-2.0-flash-lite-001',
} as const

// Helper function to get model for a specific feature
export function getFeatureModel(feature: keyof typeof FEATURE_MODELS): string {
    const model = FEATURE_MODELS[feature]

    if (typeof model === 'string') {
        return model
    }

    // For chat feature, return basic tier default
    if (feature === 'CHAT') {
        return DEFAULT_MODELS.basic
    }

    throw new Error(`Invalid feature: ${feature}`)
}

// Model validation helper
export function validateFeatureModel(feature: keyof typeof FEATURE_MODELS): boolean {
    try {
        const modelId = getFeatureModel(feature)
        const model = getModelById(modelId)
        return !!model
    } catch {
        return false
    }
}
