// Tier types
export type UserTier = 'free' | 'basic' | 'pro'
export type ModelSpeed = 'Very Fast' | 'Fast' | 'Medium'
export type ModelBadge = 'Free' | 'Fast' | 'Premium'

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
}

// All available models with tier restrictions
export const MODELS: ModelOption[] = [
  // Free Tier Models (Remove unreliable free models)
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    costPerTrail: 0,
    speed: 'Fast',
    tier: 'free',
    badge: 'Free',
    description: 'Best free model for learning',
  },

  // Basic Tier Models (Budget-friendly for beta)
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    costPerTrail: 0.5,
    speed: 'Very Fast',
    tier: 'basic',
    recommended: true,
    badge: 'Fast',
    description: 'Recommended for most learning',
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
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    costPerTrail: 0.8,
    speed: 'Fast',
    tier: 'basic',
    description: 'Strong reasoning & explanations',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    costPerTrail: 1.2,
    speed: 'Fast',
    tier: 'basic',
    description: 'Creative, engaging learning style',
  },

  // Pro Tier Models
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    costPerTrail: 2,
    speed: 'Fast',
    tier: 'pro',
    description: 'Latest model with advanced reasoning',
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    costPerTrail: 3,
    speed: 'Medium',
    tier: 'pro',
    description: 'Deep analysis & complex topics',
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
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    costPerTrail: 4,
    speed: 'Medium',
    tier: 'pro',
    description: 'Best for complex analysis',
  },
] as const

// Default model for each tier
export const DEFAULT_MODELS: Record<UserTier, string> = {
  free: 'deepseek/deepseek-chat',
  basic: 'google/gemini-2.0-flash-001',
  pro: 'google/gemini-2.0-flash-001',
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
    trailsPerDay: 15, // Increased for beta testing
    features: [
      'DeepSeek V3 (free model)',
      '15 trails per day',
      'Basic features',
    ],
  },
  basic: {
    name: 'Basic',
    price: 5,
    credits: 200, // Increased credits for beta
    bonusCredits: 0,
    trailsPerDay: null,
    features: [
      '200 credits (~400 trails with Gemini Flash 8B)',
      'Gemini 2.0 Flash, GPT-4o Mini, Claude Haiku',
      'Fast response times',
      'No daily limits',
    ],
  },
  pro: {
    name: 'Pro',
    price: 15,
    credits: 600, // Increased credits for beta
    bonusCredits: 100, // Bonus credits for early adopters
    trailsPerDay: null,
    features: [
      '600 credits + 100 bonus (~140 trails with GPT-4o)',
      'All models including GPT-4o, Claude Sonnet',
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
