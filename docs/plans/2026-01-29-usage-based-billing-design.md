# Usage-Based Billing Design: Per-Token LLM Cost Tracking

**Date:** 2026-01-29
**Status:** Design Complete
**Scope:** Implement per-token credit deduction for LLM API calls via OpenRouter

---

## Overview

Extend the existing tier-based credit system with usage-based billing that deducts credits based on actual LLM token consumption. Users purchase tier packages with large upfront credit allotments, then deduct credits as they use LLM features. When depleted, they manually recharge via existing Dodo payment integration.

## Problem Statement

Currently, tier packages grant fixed credits with no consumption tracking. This doesn't reflect actual costs—expensive models (GPT-4) and cheap models (GPT-3.5) cost the same amount of credits. We need to:
- Track actual token usage per model
- Charge different rates for different models (model-based pricing)
- Prevent unlimited usage with credit checks
- Allow manual recharge when depleted

## Solution Architecture

### Core Principles
- **Simple first**: Single credit pool (no separate wallet)
- **Per-token accurate**: Different models cost different amounts
- **Manual recharge only**: Users explicitly purchase more credits
- **Fail open on errors**: Don't block users if pricing lookup fails

### Data Model

#### Configuration: Model Pricing
```typescript
// lib/models-pricing.ts
interface ModelPricingConfig {
  modelId: string
  provider: 'openrouter' // extensible for future providers
  inputTokenCost: number // credits per 1,000 input tokens
  outputTokenCost: number // credits per 1,000 output tokens
}

// Example:
// GPT-4o: 15 credits per 1K input, 45 credits per 1K output
// GPT-3.5-turbo: 0.5 credits per 1K input, 1.5 credits per 1K output
```

#### Database: New Tables

**`model_pricing`** (configuration table)
```sql
CREATE TABLE model_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'openai/gpt-4-turbo'
  provider VARCHAR(50) NOT NULL DEFAULT 'openrouter',
  input_cost_per_1k_tokens DECIMAL(10, 4) NOT NULL,
  output_cost_per_1k_tokens DECIMAL(10, 4) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`credit_usage_logs`** (audit trail)
```sql
CREATE TABLE credit_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id VARCHAR(255) NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  credits_deducted DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  feature VARCHAR(100), -- e.g., 'chat', 'analysis', 'generation'
  request_id VARCHAR(255), -- trace to OpenRouter request
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_usage_logs_user_id ON credit_usage_logs(user_id);
CREATE INDEX idx_credit_usage_logs_created_at ON credit_usage_logs(created_at DESC);
```

#### Database: Schema Extensions

**`users` or `user_profiles` table** - Add/extend fields:
```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_credits DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS credits_available DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS credits_used DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_credit_update TIMESTAMPTZ DEFAULT NOW();

-- Track credit history
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS credits_granted INTEGER;
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS credits_used INTEGER;
```

### Tier Configuration Updates

Extend existing `TIER_CONFIGS` with credit allotments:

```typescript
// lib/constants.ts
export const TIER_CONFIGS = {
  basic: {
    name: 'Basic',
    price: 29.99,
    credits: 100000, // large upfront allotment
    bonusCredits: 10000,
    // ... other config
  },
  pro: {
    name: 'Pro',
    price: 99.99,
    credits: 500000, // much larger for pro tier
    bonusCredits: 50000,
    // ... other config
  },
}
```

## Implementation Layers

### 1. Configuration & Pricing

**File:** `lib/models-pricing.ts`

```typescript
interface ModelPricing {
  [modelId: string]: {
    inputCost: number // per 1K tokens
    outputCost: number // per 1K tokens
  }
}

export const MODEL_PRICING: ModelPricing = {
  'openai/gpt-4-turbo': { inputCost: 15, outputCost: 45 },
  'openai/gpt-4': { inputCost: 10, outputCost: 30 },
  'openai/gpt-4o': { inputCost: 12, outputCost: 36 },
  'openai/gpt-3.5-turbo': { inputCost: 0.5, outputCost: 1.5 },
  // ... add more models
}

export function getModelPricing(modelId: string) {
  return MODEL_PRICING[modelId] || { inputCost: 0, outputCost: 0 }
}

export function calculateCreditsNeeded(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = getModelPricing(model)
  return (
    (inputTokens * pricing.inputCost + outputTokens * pricing.outputCost) / 1000
  )
}
```

### 2. Credit Management Service

**File:** `lib/credits-manager.ts`

```typescript
export async function checkCreditBalance(
  userId: string,
  estimatedCost: number
): Promise<{ available: number; sufficient: boolean }> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('credits_available')
    .eq('user_id', userId)
    .single()

  const available = profile?.credits_available || 0
  return {
    available,
    sufficient: available >= estimatedCost,
  }
}

export async function deductCredits(
  userId: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  feature: string
): Promise<{ success: boolean; creditsDeducted: number; balanceAfter: number }> {
  try {
    const creditsToDeduct = calculateCreditsNeeded(
      modelId,
      inputTokens,
      outputTokens
    )

    const supabase = await createClient()

    // Get current balance
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('credits_available')
      .eq('user_id', userId)
      .single()

    const currentBalance = profile?.credits_available || 0

    // Deduct credits and log usage
    const newBalance = Math.max(0, currentBalance - creditsToDeduct)

    await supabase
      .from('user_profiles')
      .update({
        credits_available: newBalance,
        credits_used: (profile?.credits_used || 0) + creditsToDeduct,
        last_credit_update: new Date().toISOString(),
      })
      .eq('user_id', userId)

    await supabase.from('credit_usage_logs').insert({
      user_id: userId,
      model_id: modelId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      credits_deducted: creditsToDeduct,
      balance_after: newBalance,
      feature,
    })

    return {
      success: true,
      creditsDeducted: creditsToDeduct,
      balanceAfter: newBalance,
    }
  } catch (error) {
    console.error('Error deducting credits:', error)
    return { success: false, creditsDeducted: 0, balanceAfter: 0 }
  }
}

export async function addCredits(
  userId: string,
  amountToAdd: number,
  reason: string = 'manual_purchase'
): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('total_credits, credits_available')
      .eq('user_id', userId)
      .single()

    const newTotal = (profile?.total_credits || 0) + amountToAdd
    const newAvailable = (profile?.credits_available || 0) + amountToAdd

    await supabase
      .from('user_profiles')
      .update({
        total_credits: newTotal,
        credits_available: newAvailable,
      })
      .eq('user_id', userId)

    return true
  } catch (error) {
    console.error('Error adding credits:', error)
    return false
  }
}
```

### 3. LLM Call Integration

**Where to integrate:**
- Intercept before sending request to OpenRouter
- Extract token counts from response
- Deduct credits after successful call

**Example flow (to be integrated into existing LLM service):**

```typescript
export async function callLLMWithCredits(
  userId: string,
  model: string,
  prompt: string,
  feature: string = 'chat'
) {
  // 1. Check credits (estimate based on prompt length)
  const estimatedTokens = Math.ceil(prompt.length / 4) // rough estimate
  const estimatedCost = calculateCreditsNeeded(model, estimatedTokens, estimatedTokens)

  const { sufficient } = await checkCreditBalance(userId, estimatedCost)
  if (!sufficient) {
    throw new Error('INSUFFICIENT_CREDITS')
  }

  // 2. Make LLM call
  const response = await openRouterClient.createChatCompletion({
    model,
    messages: [{ role: 'user', content: prompt }],
  })

  // 3. Deduct actual credits based on tokens used
  const { usage } = response
  await deductCredits(
    userId,
    model,
    usage.prompt_tokens,
    usage.completion_tokens,
    feature
  )

  return response
}
```

### 4. Payment Webhook Update

**File:** `app/api/payments/webhook/route.ts`

Update `handlePaymentSuccess` to grant credits:

```typescript
async function handlePaymentSuccess(sessionData: any) {
  // ... existing code ...

  const creditsToAdd = tierConfig.credits + tierConfig.bonusCredits

  // Add credits to user
  await addCredits(user_id, creditsToAdd, 'tier_purchase')

  // Update payment event with credits info
  await supabase
    .from('payment_events')
    .update({ credits_granted: creditsToAdd })
    .eq('session_id', session_id)
}
```

### 5. New Recharge Endpoint

**File:** `app/api/credits/recharge/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // Similar to create-checkout, but for credit top-ups
  // Could offer: 50K credits for $9.99, 100K for $19.99, etc.
  // Reuse existing Dodo checkout logic
}
```

### 6. User Experience

**Show in UI:**
- Current credit balance (real-time)
- Credit cost before making LLM call
- Usage history/activity log
- "Buy More Credits" button → Dodo checkout for credit packages

**Error Handling:**
- 402 Payment Required: insufficient credits
- Show message: "You need X more credits. [Buy Credits]"

## Workflow: Credit Deduction

```
User makes LLM request
  ↓
[Check] Get user's credit balance from user_profiles
  ↓
[Calculate] Estimate cost based on model + prompt length
  ↓
[Validate] sufficient balance? If NO → return 402 error
  ↓
[Call] Send request to OpenRouter
  ↓
[Extract] Get prompt_tokens, completion_tokens from response
  ↓
[Calculate] Actual credit cost = (prompt_tokens × input_rate + completion_tokens × output_rate) / 1000
  ↓
[Deduct] Update user_profiles.credits_available -= cost
  ↓
[Log] Insert record to credit_usage_logs (audit trail)
  ↓
[Return] Response to user with remaining credits
```

## Workflow: Manual Recharge

```
User clicks "Buy More Credits"
  ↓
[Show] Credit packages (e.g., 50K for $9.99, 100K for $19.99)
  ↓
[Checkout] Redirect to Dodo checkout (reuse existing flow)
  ↓
[Webhook] Dodo sends payment.completed event
  ↓
[Credit] Call addCredits(userId, creditsToAdd, 'manual_recharge')
  ↓
[Update] Refresh user balance in UI
```

## Database Migrations

Three new migrations needed:
1. Create `model_pricing` table
2. Create `credit_usage_logs` table
3. Add fields to `user_profiles` (total_credits, credits_available, credits_used)

## Error Handling & Edge Cases

| Scenario | Handling |
|----------|----------|
| Insufficient credits | Return 402 with message. Don't deduct. User must recharge. |
| Model not in pricing table | Log error. Continue call (fail open). Deduct 0 credits. |
| Token count missing from response | Log warning. Estimate based on response length. Deduct estimated cost. |
| Webhook fails after credit check | Refund credits manually or flag for support. |
| User balance goes negative | Should not happen. Database constraint or logic prevents it. |
| Concurrent requests | Lock on user row during deduction to prevent double-spend. |

## Testing Strategy

- Unit tests: `calculateCreditsNeeded()`, `checkCreditBalance()`
- Integration tests: Full credit deduction flow with mock OpenRouter
- E2E tests: User purchases tier → makes LLM call → credits deducted → balance updates
- Edge cases: Insufficient credits, missing model pricing, negative balance

## Monitoring & Analytics

Extend existing `payment_analytics` to include:
- Total credits issued per day
- Total credits used per day
- Average credits per user
- Popular models (by credit usage)
- Users at risk (low balance)

## Future Enhancements

1. **Auto-recharge**: Set threshold to auto-charge when balance < 10K credits
2. **Tiered pricing**: Different rates for different user tiers (e.g., pro gets 20% discount)
3. **Model recommendations**: Suggest cheaper models if user is low on credits
4. **Credit expiration**: Expire unused credits after 12 months
5. **Shared team pools**: Organizations share a credit pool
6. **Usage alerts**: Notify when user exceeds spending threshold

## Files to Create/Modify

**Create:**
- `lib/models-pricing.ts` - Model pricing configuration
- `lib/credits-manager.ts` - Credit management service
- `app/api/credits/recharge/route.ts` - Manual recharge endpoint
- `supabase/migrations/add_credit_usage_tracking.sql` - Database schema

**Modify:**
- `app/api/payments/webhook/route.ts` - Grant credits on successful payment
- `lib/constants.ts` - Add credit allotments to TIER_CONFIGS
- Existing LLM call handler - Integrate credit deduction
- UI components - Show credit balance, add "Buy Credits" button

## Success Criteria

- ✅ Credits deducted accurately per model/token
- ✅ Users cannot exceed available credits
- ✅ Manual recharge works via Dodo
- ✅ Usage history visible to users
- ✅ No double-charging or negative balances
- ✅ All errors logged for debugging
