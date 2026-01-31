// lib/model-pricing.ts

/**
 * Model pricing in credits per 1,000 tokens
 * Based on OpenRouter pricing (as of Jan 2026)
 *
 * Formula: Credits Deducted = (input_tokens × input_rate + output_tokens × output_rate) / 1000
 */

interface ModelPricingTier {
  input: number // credits per 1K input tokens
  output: number // credits per 1K output tokens
}

export const MODEL_PRICING: Record<string, ModelPricingTier> = {
  // Free models
  'deepseek/deepseek-chat': { input: 0, output: 0 },
  'deepseek/deepseek-r1-0528:free': { input: 0, output: 0 },
  'xiaomi/mimo-v2-flash:free': { input: 0, output: 0 },
  'nvidia/nemotron-3-nano-30b-a3b:free': { input: 0, output: 0 },

  // Budget models
  'google/gemini-2.0-flash-lite-001': { input: 0.075, output: 0.3 },
  'google/gemini-2.0-flash-001': { input: 0.15, output: 0.6 },
  'meta-llama/llama-3.2-3b-instruct': { input: 0.06, output: 0.24 },
  'mistralai/mistral-nemo': { input: 0.1, output: 0.4 },
  'meta-llama/llama-3.1-8b-instruct': { input: 0.1, output: 0.4 },

  // Mid-tier models
  'openai/gpt-4o-mini': { input: 0.3, output: 1.2 },
  'anthropic/claude-3.5-haiku': { input: 0.5, output: 2.5 },
  'google/gemini-2.0-flash-thinking-001': { input: 0.3, output: 1.2 },
  'deepseek/deepseek-v3.1-terminus': { input: 0.4, output: 1.6 },

  // Premium models
  'google/gemini-2.5-flash': { input: 0.5, output: 2 },
  'google/gemini-pro-1.5': { input: 2.5, output: 10 },
  'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
  'openai/gpt-4o': { input: 5, output: 15 },
  'anthropic/claude-3.7-sonnet': { input: 6, output: 18 },
  'google/gemini-2.5-pro': { input: 8, output: 24 },
  'openai/gpt-5': { input: 15, output: 60 },

  // Special cases
  'illustration': { input: 0, output: 0 }, // Fixed 2 credits (handled separately)
}

export function getModelPricing(modelId: string): ModelPricingTier {
  return MODEL_PRICING[modelId] || { input: 0, output: 0 }
}

export function calculateCreditsFromTokens(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = getModelPricing(modelId)

  // If model not found or is free, no credits
  if (pricing.input === 0 && pricing.output === 0) {
    return 0
  }

  // Calculate: (input_tokens × input_rate + output_tokens × output_rate) / 1000
  const credits = (inputTokens * pricing.input + outputTokens * pricing.output) / 1000

  // Round up to nearest 0.1 credit, minimum 0.1 if non-zero
  return credits > 0 ? Math.max(0.1, Math.ceil(credits * 10) / 10) : 0
}

export function isModelPriced(modelId: string): boolean {
  const pricing = getModelPricing(modelId)
  return pricing.input > 0 || pricing.output > 0
}
