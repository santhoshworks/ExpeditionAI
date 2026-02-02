import { createClient } from '@/lib/supabase/server'
import type { UserTier } from './constants'
import type { Database } from '@/types/supabase'

type UserCreditsRow = Database['public']['Tables']['user_credits']['Row']

export interface UserSubscription {
  userId: string
  tier: UserTier
}

/**
 * Get user's current subscription tier
 */
export async function getUserTier(userId: string): Promise<UserSubscription> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_credits')
    .select('tier')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // Return default free tier if no record exists
    return {
      userId,
      tier: 'free',
    }
  }

  const typedData = data as UserCreditsRow

  // Map old 'basic' tier to 'free' for backward compatibility
  let tier: UserTier = typedData.tier as UserTier
  if (tier === 'basic' as any) {
    tier = 'free'
  }

  return {
    userId,
    tier,
  }
}

/**
 * Upgrade user tier (for payment processing)
 */
export async function upgradeTier(
  userId: string,
  newTier: UserTier
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const insertData = {
    user_id: userId,
    tier: newTier,
    credits: 0, // Credits no longer used, but keep for DB compatibility
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

// Legacy exports for backward compatibility during migration
// These can be removed once all references are updated

export interface UserCredits {
  userId: string
  credits: number
  tier: UserTier
  trailsToday: number
  lastTrailDate: string | null
}

export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  const subscription = await getUserTier(userId)
  return {
    userId: subscription.userId,
    credits: 0, // No longer used
    tier: subscription.tier,
    trailsToday: 0,
    lastTrailDate: null,
  }
}

// These functions are no-ops now but kept for backward compatibility
export async function canCreateTrail(_userId: string): Promise<{ allowed: boolean; reason?: string }> {
  // No limits for now - using rate limiting instead
  return { allowed: true }
}

export async function hasEnoughCredits(
  _userId: string,
  _modelId: string,
  _estimatedCredits?: number
): Promise<{ hasCredits: boolean; required: number; available: number }> {
  // Credits no longer used - always return true
  return { hasCredits: true, required: 0, available: 0 }
}

export async function deductCredits(
  _userId: string,
  _modelId: string,
  _inputTokens: number,
  _outputTokens: number
): Promise<{ success: boolean; creditsUsed: number; error?: string }> {
  // No-op - credits no longer deducted
  return { success: true, creditsUsed: 0 }
}

export async function incrementTrailCount(_userId: string): Promise<void> {
  // No-op - daily limits removed
}

export async function addCredits(
  _userId: string,
  _amount: number
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  // No-op - credits no longer used
  return { success: true, newBalance: 0 }
}
