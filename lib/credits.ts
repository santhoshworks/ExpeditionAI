import { createClient } from '@/lib/supabase/server'
import { getModelById, type UserTier } from './constants'
import type { Database } from '@/types/supabase'

type UserCreditsRow = Database['public']['Tables']['user_credits']['Row']

// Token cost per million for different models (in USD)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  // Free tier model (no cost)
  'google/gemini-2.0-flash-lite-001': { input: 0, output: 0 },

  // Paid models
  'google/gemini-2.0-flash-001': { input: 0.075, output: 0.3 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'anthropic/claude-3.5-haiku': { input: 0.25, output: 1.25 },
  'google/gemini-pro-1.5': { input: 1.25, output: 5.0 },
  'openai/gpt-4o': { input: 2.5, output: 10.0 },
  'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
}

// 1 credit = $0.01
const CREDIT_VALUE_USD = 0.01

export interface CreditDeductionResult {
  success: boolean
  creditsUsed: number
  remainingCredits?: number
  error?: string
}

export interface UserCredits {
  userId: string
  credits: number
  tier: UserTier
  trailsToday: number
  lastTrailDate: string | null
}

/**
 * Get actual token cost for a model
 */
export function getTokenCost(modelId: string, type: 'input' | 'output'): number {
  const costs = MODEL_COSTS[modelId]
  if (!costs) return 0
  return type === 'input' ? costs.input : costs.output
}

/**
 * Calculate credits to deduct based on token usage
 */
export function calculateCreditsFromTokens(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = getModelById(modelId)

  // Free models cost nothing
  if (!model || model.costPerTrail === 0) {
    return 0
  }

  const inputCost = (inputTokens / 1_000_000) * getTokenCost(modelId, 'input')
  const outputCost = (outputTokens / 1_000_000) * getTokenCost(modelId, 'output')
  const totalCostUSD = inputCost + outputCost

  // Convert to credits (1 credit = $0.01), minimum 0.1 credits if not free
  const credits = totalCostUSD / CREDIT_VALUE_USD
  return Math.max(0.1, Math.ceil(credits * 10) / 10) // Round up to nearest 0.1
}

/**
 * Get user's current credit balance and tier
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_credits')
    .select('credits, tier, trails_today, last_trail_date')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Return default free tier if no record exists
    return {
      userId,
      credits: 0,
      tier: 'free',
      trailsToday: 0,
      lastTrailDate: null,
    }
  }

  const typedData = data as UserCreditsRow

  return {
    userId,
    credits: typedData.credits,
    tier: typedData.tier as UserTier,
    trailsToday: typedData.trails_today,
    lastTrailDate: typedData.last_trail_date,
  }
}

/**
 * Check if user can create a trail (for free tier daily limit)
 */
export async function canCreateTrail(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const userCredits = await getUserCredits(userId)

  if (!userCredits) {
    return { allowed: false, reason: 'User not found' }
  }

  // Paid tiers have no daily limit
  if (userCredits.tier !== 'free') {
    return { allowed: true }
  }

  // Check if it's a new day
  const today = new Date().toISOString().split('T')[0]
  const isNewDay = userCredits.lastTrailDate !== today

  if (isNewDay) {
    return { allowed: true }
  }

  // Check daily limit for free tier (15 trails/day)
  if (userCredits.trailsToday >= 15) {
    return {
      allowed: false,
      reason: 'Daily trail limit reached. Upgrade to Basic for unlimited trails.'
    }
  }

  return { allowed: true }
}

/**
 * Check if user has enough credits for a model
 */
export async function hasEnoughCredits(
  userId: string,
  modelId: string,
  estimatedCredits?: number
): Promise<{ hasCredits: boolean; required: number; available: number }> {
  const model = getModelById(modelId)
  const userCredits = await getUserCredits(userId)

  if (!model || !userCredits) {
    return { hasCredits: false, required: 0, available: 0 }
  }

  // Free models don't require credits
  if (model.costPerTrail === 0) {
    return { hasCredits: true, required: 0, available: userCredits.credits }
  }

  const required = estimatedCredits || model.costPerTrail

  return {
    hasCredits: userCredits.credits >= required,
    required,
    available: userCredits.credits,
  }
}

/**
 * Deduct credits after a chat completion or other service usage
 */
export async function deductCredits(
  userId: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number
): Promise<CreditDeductionResult> {
  // Handle illustration generation
  if (modelId === 'illustration') {
    const creditsToDeduct = 2 // Fixed cost for illustrations

    const supabase = await createClient()

    const result = await (supabase as any).rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: creditsToDeduct,
    })

    const { data, error } = result as {
      data: { success: boolean; remaining_credits: number; error?: string } | null;
      error: any
    }

    if (error) {
      console.error('Credit deduction error:', error)
      return {
        success: false,
        creditsUsed: 0,
        error: 'Failed to deduct credits'
      }
    }

    if (!data?.success) {
      return {
        success: false,
        creditsUsed: 0,
        error: data?.error || 'Insufficient credits'
      }
    }

    return {
      success: true,
      creditsUsed: creditsToDeduct,
      remainingCredits: data.remaining_credits,
    }
  }

  const model = getModelById(modelId)

  // Free models don't cost credits
  if (!model || model.costPerTrail === 0) {
    return { success: true, creditsUsed: 0 }
  }

  const creditsToDeduct = calculateCreditsFromTokens(modelId, inputTokens, outputTokens)

  if (creditsToDeduct === 0) {
    return { success: true, creditsUsed: 0 }
  }

  const supabase = await createClient()

  // Deduct credits atomically
  const result = await (supabase as any).rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: creditsToDeduct,
  })

  const { data, error } = result as {
    data: { success: boolean; remaining_credits: number; error?: string } | null;
    error: any
  }

  if (error) {
    console.error('Credit deduction error:', error)
    return {
      success: false,
      creditsUsed: 0,
      error: 'Failed to deduct credits'
    }
  }

  if (!data?.success) {
    return {
      success: false,
      creditsUsed: 0,
      error: data?.error || 'Insufficient credits'
    }
  }

  return {
    success: true,
    creditsUsed: creditsToDeduct,
    remainingCredits: data.remaining_credits,
  }
}

/**
 * Increment trail count for free tier daily limit tracking
 */
export async function incrementTrailCount(userId: string): Promise<void> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const result = await (supabase as any).rpc('increment_trail_count', {
    p_user_id: userId,
    p_date: today,
  })

  // Type assertion for the result
  const _ = result as { data: void; error: any }
}

/**
 * Add credits to user account (for purchases)
 */
export async function addCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = await createClient()

  const result = await (supabase as any).rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
  })

  const { data, error } = result as { data: { new_balance: number } | null; error: any }

  if (error) {
    console.error('Add credits error:', error)
    return { success: false, error: 'Failed to add credits' }
  }

  return { success: true, newBalance: data?.new_balance }
}

/**
 * Upgrade user tier
 */
export async function upgradeTier(
  userId: string,
  newTier: UserTier,
  creditsToAdd: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const insertData = {
    user_id: userId,
    tier: newTier,
    credits: creditsToAdd,
    trails_today: 0,
    last_trail_date: null,
  }

  const { error } = await (supabase
    .from('user_credits')
    .upsert(insertData as any, {
      onConflict: 'user_id',
    }))

  if (error) {
    console.error('Upgrade tier error:', error)
    return { success: false, error: 'Failed to upgrade tier' }
  }

  return { success: true }
}
