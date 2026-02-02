// Tier types - simplified to free and pro only
export type UserTier = 'free' | 'pro'
export type ModelSpeed = 'Very Fast' | 'Fast' | 'Medium'
export type ModelBadge = 'Fast' | 'Premium'

// Model configuration with tier-based access
export interface ModelOption {
  id: string
  name: string
  provider: string
  speed: ModelSpeed
  tier: UserTier // minimum tier required
  recommended?: boolean
  badge?: ModelBadge
  description: string
}

// Curated models: 4 mini (free) + 4 flagship (pro) = 8 total
export const MODELS: ModelOption[] = [
  // FREE Tier - Mini Models (fast, efficient)
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    speed: 'Very Fast',
    tier: 'free',
    recommended: true,
    badge: 'Fast',
    description: 'Fast & smart for everyday learning',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    speed: 'Very Fast',
    tier: 'free',
    badge: 'Fast',
    description: 'Quick, clear explanations',
  },
  {
    id: 'google/gemini-2.0-flash-lite-001',
    name: 'Gemini Flash Lite',
    provider: 'Google',
    speed: 'Very Fast',
    tier: 'free',
    badge: 'Fast',
    description: 'Lightning fast responses',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    speed: 'Fast',
    tier: 'free',
    description: 'Great for technical topics',
  },

  // PRO Tier - Flagship Models (powerful, detailed)
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    speed: 'Medium',
    tier: 'pro',
    badge: 'Premium',
    description: 'Most capable OpenAI model',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    speed: 'Medium',
    tier: 'pro',
    badge: 'Premium',
    description: 'Best for deep analysis & nuance',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    speed: 'Fast',
    tier: 'pro',
    description: 'Fast with strong reasoning',
  },
  {
    id: 'deepseek/deepseek-reasoner',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    speed: 'Medium',
    tier: 'pro',
    badge: 'Premium',
    description: 'Advanced reasoning & math',
  },
] as const

// Default model for each tier
export const DEFAULT_MODELS: Record<UserTier, string> = {
  free: 'openai/gpt-4o-mini',
  pro: 'openai/gpt-4o-mini',
}

// Tier configurations - simplified pricing
export interface TierConfig {
  name: string
  price: number // monthly price in dollars
  originalPrice?: number // original price before discount
  features: string[]
}

export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '4 fast AI models',
      'GPT-4o Mini, Claude Haiku, Gemini Flash Lite, DeepSeek V3',
      'Unlimited conversations',
      'Branching trails & visual maps',
      'Quizzes & flashcards',
    ],
  },
  pro: {
    name: 'Pro',
    price: 4.99,
    originalPrice: 9.99,
    features: [
      'All 8 AI models',
      'GPT-4o, Claude Sonnet, Gemini Flash, DeepSeek R1',
      'Most powerful models for complex topics',
      'Priority support',
      'Early access to new features',
    ],
  },
}

// Helper to get models available for a tier
export function getAvailableModels(userTier: UserTier): ModelOption[] {
  const tierOrder: UserTier[] = ['free', 'pro']
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

  const tierOrder: UserTier[] = ['free', 'pro']
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
  JOURNAL_GENERATION: 'openai/gpt-4o-mini',

  // Illustration prompt generation
  ILLUSTRATION_GENERATION: 'google/gemini-2.0-flash-lite-001',

  // Define feature - vocabulary definitions
  DEFINE_FEATURE: 'google/gemini-2.0-flash-lite-001',

  // Quiz generation
  QUIZ_GENERATION: 'openai/gpt-4o-mini',

  // Flashcard generation
  FLASHCARD_GENERATION: 'openai/gpt-4o-mini',
} as const

// Helper function to get model for a specific feature
export function getFeatureModel(feature: keyof typeof FEATURE_MODELS): string {
  const model = FEATURE_MODELS[feature]

  if (typeof model === 'string') {
    return model
  }

  // For chat feature, return free tier default
  if (feature === 'CHAT') {
    return DEFAULT_MODELS.free
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
