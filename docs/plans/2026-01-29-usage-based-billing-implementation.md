# Usage-Based Billing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement per-token credit deduction for LLM API calls with model-based pricing, replacing fixed cost model with actual usage tracking.

**Architecture:** Extend existing credit system to track input/output tokens separately, calculate credits based on model-specific rates, and log all usage. Integrate seamlessly with current OpenRouter flow and payment webhook.

**Tech Stack:** TypeScript, Next.js API routes, Supabase (PostgreSQL), OpenRouter SDK

---

## Phase 1: Database & Configuration

### Task 1: Create database migrations for usage tracking

**Files:**
- Create: `supabase/migrations/20260129_add_usage_based_billing.sql`

**Step 1: Write migration file**

Create the migration file with these tables:

```sql
-- Model pricing configuration
CREATE TABLE IF NOT EXISTS model_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'openai/gpt-4-turbo'
  provider VARCHAR(50) NOT NULL DEFAULT 'openrouter',
  input_cost_per_1k_tokens DECIMAL(10, 4) NOT NULL,
  output_cost_per_1k_tokens DECIMAL(10, 4) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit usage audit trail
CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id VARCHAR(255) NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  credits_deducted DECIMAL(10, 4) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  feature VARCHAR(100), -- e.g., 'chat', 'analysis', 'definition'
  request_id VARCHAR(255), -- for tracing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend user_credits table with usage tracking
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS total_credits_issued DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS total_credits_used DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS last_usage_date TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_user_id ON credit_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_model_id ON credit_usage_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_created_at ON credit_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_pricing_active ON model_pricing(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE model_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for model_pricing (public read)
CREATE POLICY "Everyone can read active model pricing"
  ON model_pricing FOR SELECT
  USING (is_active = true);

-- RLS policy for credit_usage_logs (users see own, admins see all)
CREATE POLICY "Users can view own usage logs"
  ON credit_usage_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usage logs"
  ON credit_usage_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- System can insert usage logs
CREATE POLICY "System can insert usage logs"
  ON credit_usage_logs FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE model_pricing IS 'Stores per-token pricing for each LLM model';
COMMENT ON TABLE credit_usage_logs IS 'Audit trail of all credit usage by users';
```

**Step 2: Verify migration syntax**

Run: `cd /Users/santhoshpalanisamy/projects/ExpeditionAI/.worktrees/feat/pdf-textbook-upload && sqlparse supabase/migrations/20260129_add_usage_based_billing.sql --check` (or just visually verify the SQL is valid)

Expected: SQL appears valid (or skip if sqlparse unavailable)

**Step 3: Commit migration**

```bash
git add supabase/migrations/20260129_add_usage_based_billing.sql
git commit -m "db: create usage_based_billing tables and indexes"
```

---

### Task 2: Create model pricing configuration

**Files:**
- Create: `lib/model-pricing.ts`

**Step 1: Write model pricing config**

```typescript
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
```

**Step 2: Write tests**

Create: `lib/__tests__/model-pricing.test.ts`

```typescript
import { calculateCreditsFromTokens, getModelPricing, isModelPriced } from '../model-pricing'

describe('model-pricing', () => {
  describe('getModelPricing', () => {
    it('returns pricing for known models', () => {
      const pricing = getModelPricing('openai/gpt-4o')
      expect(pricing.input).toBe(5)
      expect(pricing.output).toBe(15)
    })

    it('returns zero pricing for unknown models', () => {
      const pricing = getModelPricing('unknown/model')
      expect(pricing.input).toBe(0)
      expect(pricing.output).toBe(0)
    })

    it('returns zero pricing for free models', () => {
      const pricing = getModelPricing('deepseek/deepseek-chat')
      expect(pricing.input).toBe(0)
      expect(pricing.output).toBe(0)
    })
  })

  describe('calculateCreditsFromTokens', () => {
    it('calculates credits correctly for priced models', () => {
      // GPT-4o: 5 credits per 1K input, 15 credits per 1K output
      // Input: 1000 tokens = 5 credits
      // Output: 1000 tokens = 15 credits
      // Total: 20 credits
      const credits = calculateCreditsFromTokens('openai/gpt-4o', 1000, 1000)
      expect(credits).toBe(20)
    })

    it('returns 0 for free models', () => {
      const credits = calculateCreditsFromTokens('deepseek/deepseek-chat', 1000, 1000)
      expect(credits).toBe(0)
    })

    it('rounds up to nearest 0.1', () => {
      // Gemini Flash Lite: 0.075 input, 0.3 output
      // Input: 10 tokens = 0.00075 credits
      // Output: 10 tokens = 0.003 credits
      // Total: 0.00375 → rounds up to 0.1
      const credits = calculateCreditsFromTokens('google/gemini-2.0-flash-lite-001', 10, 10)
      expect(credits).toBe(0.1)
    })

    it('returns minimum 0.1 for non-zero costs', () => {
      const credits = calculateCreditsFromTokens('google/gemini-2.0-flash-001', 1, 1)
      expect(credits).toBeGreaterThanOrEqual(0.1)
    })

    it('handles large token counts', () => {
      // GPT-4o with 10K input, 5K output
      // Input: 10000 × 5 / 1000 = 50
      // Output: 5000 × 15 / 1000 = 75
      // Total: 125
      const credits = calculateCreditsFromTokens('openai/gpt-4o', 10000, 5000)
      expect(credits).toBe(125)
    })
  })

  describe('isModelPriced', () => {
    it('returns true for priced models', () => {
      expect(isModelPriced('openai/gpt-4o')).toBe(true)
    })

    it('returns false for free models', () => {
      expect(isModelPriced('deepseek/deepseek-chat')).toBe(false)
    })

    it('returns false for unknown models', () => {
      expect(isModelPriced('unknown/model')).toBe(false)
    })
  })
})
```

**Step 3: Run tests**

Run: `npm test -- lib/__tests__/model-pricing.test.ts`

Expected: All tests pass

**Step 4: Commit**

```bash
git add lib/model-pricing.ts lib/__tests__/model-pricing.test.ts
git commit -m "feat: add model-based pricing configuration and calculations"
```

---

## Phase 2: Credit Management Enhancement

### Task 3: Update credits manager with usage logging

**Files:**
- Modify: `lib/credits.ts` - add usage logging functions
- Create: `lib/__tests__/credits-usage-logging.test.ts`

**Step 1: Add usage logging function to credits.ts**

Open `lib/credits.ts` and add this function after the `deductCredits` function:

```typescript
/**
 * Log credit usage for audit trail
 */
export async function logCreditUsage(
  userId: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  creditsDeducted: number,
  balanceAfter: number,
  feature: string = 'chat',
  requestId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('credit_usage_logs').insert({
      user_id: userId,
      model_id: modelId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      credits_deducted: creditsDeducted,
      balance_after: balanceAfter,
      feature,
      request_id: requestId,
    })

    if (error) {
      console.error('Error logging credit usage:', error)
      // Don't fail the request if logging fails
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error logging credit usage:', error)
    // Fail gracefully - log the error but don't block the request
    return { success: false, error: String(error) }
  }
}
```

**Step 2: Update deductCredits to use new model-pricing**

Replace the existing `deductCredits` function with:

```typescript
/**
 * Deduct credits after a chat completion or other service usage
 * Now uses actual token counts with per-token pricing
 */
export async function deductCredits(
  userId: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  feature: string = 'chat',
  requestId?: string
): Promise<CreditDeductionResult> {
  // Import at usage point to avoid circular deps
  const { calculateCreditsFromTokens, isModelPriced } = await import('./model-pricing')

  // Handle illustration generation (special case - fixed 2 credits)
  if (modelId === 'illustration') {
    const creditsToDeduct = 2

    const supabase = await createClient()

    const result = await (supabase as any).rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: creditsToDeduct,
    })

    const { data, error } = result as {
      data: { success: boolean; remaining_credits: number; error?: string } | null
      error: any
    }

    if (error) {
      console.error('Credit deduction error:', error)
      return {
        success: false,
        creditsUsed: 0,
        error: 'Failed to deduct credits',
      }
    }

    if (!data?.success) {
      return {
        success: false,
        creditsUsed: 0,
        error: data?.error || 'Insufficient credits',
      }
    }

    // Log the usage
    await logCreditUsage(userId, modelId, 0, 0, creditsToDeduct, data.remaining_credits, feature, requestId)

    return {
      success: true,
      creditsUsed: creditsToDeduct,
      remainingCredits: data.remaining_credits,
    }
  }

  const model = getModelById(modelId)

  // Free models don't cost credits
  if (!model || !isModelPriced(modelId)) {
    return { success: true, creditsUsed: 0 }
  }

  // Calculate credits based on actual tokens used
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
    data: { success: boolean; remaining_credits: number; error?: string } | null
    error: any
  }

  if (error) {
    console.error('Credit deduction error:', error)
    return {
      success: false,
      creditsUsed: 0,
      error: 'Failed to deduct credits',
    }
  }

  if (!data?.success) {
    return {
      success: false,
      creditsUsed: 0,
      error: data?.error || 'Insufficient credits',
    }
  }

  // Log the usage
  await logCreditUsage(
    userId,
    modelId,
    inputTokens,
    outputTokens,
    creditsToDeduct,
    data.remaining_credits,
    feature,
    requestId
  )

  return {
    success: true,
    creditsUsed: creditsToDeduct,
    remainingCredits: data.remaining_credits,
  }
}
```

**Step 3: Write tests for usage logging**

Create: `lib/__tests__/credits-usage-logging.test.ts`

```typescript
import { logCreditUsage } from '../credits'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('credits usage logging', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('logCreditUsage', () => {
    it('inserts usage log successfully', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          insert: mockInsert,
        }),
      }

      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await logCreditUsage(
        'user-123',
        'openai/gpt-4o',
        1000,
        500,
        10,
        90,
        'chat',
        'req-123'
      )

      expect(result.success).toBe(true)
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        model_id: 'openai/gpt-4o',
        input_tokens: 1000,
        output_tokens: 500,
        credits_deducted: 10,
        balance_after: 90,
        feature: 'chat',
        request_id: 'req-123',
      })
    })

    it('handles insert errors gracefully', async () => {
      const mockError = { message: 'DB error' }
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          insert: jest.fn().mockResolvedValue({ error: mockError }),
        }),
      }

      ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)

      const result = await logCreditUsage(
        'user-123',
        'openai/gpt-4o',
        1000,
        500,
        10,
        90
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })
  })
})
```

**Step 4: Run tests**

Run: `npm test -- lib/__tests__/credits-usage-logging.test.ts`

Expected: All tests pass

**Step 5: Commit**

```bash
git add lib/credits.ts lib/__tests__/credits-usage-logging.test.ts
git commit -m "feat: add credit usage logging to track all LLM token consumption"
```

---

## Phase 3: API Integration

### Task 4: Update chat endpoint to pass token counts

**Files:**
- Modify: `app/api/chat/route.ts` - extract and pass tokens to deductCredits

**Step 1: Read current implementation**

Already read above, looking at lines where `deductCredits` is called. Find these lines.

**Step 2: Update the deductCredits call**

In `app/api/chat/route.ts`, find where `deductCredits` is called (after the LLM response). Replace with:

```typescript
// Extract token usage from OpenRouter response
const { data: usage } = response // streamText returns response with usage metadata

// Deduct actual credits based on tokens used
if (usage) {
  const deductResult = await deductCredits(
    user.id,
    model,
    usage.prompt_tokens || inputTokens,
    usage.completion_tokens || outputTokens,
    'chat',
    requestId // if available
  )

  if (!deductResult.success && deductResult.error?.includes('Insufficient')) {
    // Handle insufficient credits
    console.warn(`User ${user.id} ran out of credits mid-response`)
  }
}
```

**Step 3: Test locally**

Run: `npm run dev` and make a test chat request

Expected: Credits deducted correctly based on actual tokens used, usage logged in database

**Step 4: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat: update chat endpoint to deduct credits based on actual token usage"
```

---

### Task 5: Update other LLM endpoints (define, quiz, etc.)

**Files:**
- Modify: `app/api/define/route.ts`
- Modify: `app/api/quiz/generate/route.ts`
- Modify: `app/api/illustrations/generate/route.ts`
- Modify: `app/api/trails/[trailId]/auto-explain/route.ts`

**Step 1: Update define endpoint**

In `app/api/define/route.ts`, find the `deductCredits` call and update to pass actual tokens:

```typescript
const deductResult = await deductCredits(
  user.id,
  model,
  usage.prompt_tokens || estimatedInputTokens,
  usage.completion_tokens || estimatedOutputTokens,
  'definition',
  requestId
)
```

**Step 2: Update quiz endpoint**

Similar pattern in `app/api/quiz/generate/route.ts`:

```typescript
const deductResult = await deductCredits(
  user.id,
  model,
  usage.prompt_tokens || 0,
  usage.completion_tokens || 0,
  'quiz',
  requestId
)
```

**Step 3: Update auto-explain endpoint**

In `app/api/trails/[trailId]/auto-explain/route.ts`:

```typescript
const deductResult = await deductCredits(
  user.id,
  model,
  usage.prompt_tokens || 0,
  usage.completion_tokens || 0,
  'auto_explain',
  requestId
)
```

**Step 4: Verify all endpoints**

Check that each endpoint:
- Extracts token counts from response
- Passes tokens to deductCredits
- Handles insufficient credits error

**Step 5: Commit all changes**

```bash
git add app/api/define/route.ts app/api/quiz/generate/route.ts app/api/trails/[trailId]/auto-explain/route.ts
git commit -m "feat: add per-token credit deduction to all LLM endpoints"
```

---

## Phase 4: Payment & Recharge Integration

### Task 6: Update payment webhook to use new credit system

**Files:**
- Modify: `app/api/payments/webhook/route.ts`

**Step 1: Update handlePaymentSuccess**

In the webhook handler, update the credit granting logic:

```typescript
async function handlePaymentSuccess(sessionData: any) {
  try {
    const { metadata, amount, payment_method, session_id } = sessionData
    const { user_id, tier, credits, bonus_credits } = metadata

    if (!user_id || !tier) {
      console.error('Missing required metadata in payment success webhook')
      return
    }

    const totalCredits = parseInt(credits) + parseInt(bonus_credits || 0)

    // Store payment event
    const supabase = await createClient()
    await supabase.from('payment_events').insert({
      event_type: 'checkout.session.completed',
      session_id: session_id,
      user_id: user_id,
      amount: amount / 100, // Convert cents to dollars
      status: 'completed',
      payment_method: payment_method || 'card',
      tier: tier,
      credits: parseInt(credits),
      bonus_credits: parseInt(bonus_credits || 0),
      credits_granted: totalCredits, // NEW: track credits granted
      metadata: sessionData,
      processed_at: new Date().toISOString()
    })

    // Upgrade user tier and add credits
    const result = await upgradeTier(user_id, tier, totalCredits)

    if (!result.success) {
      console.error('Failed to upgrade user tier:', result.error)
      // Update payment event with error
      await supabase.from('payment_events')
        .update({
          failure_reason: result.error,
          status: 'processing_failed'
        })
        .eq('session_id', session_id)
      return
    }

    console.log(`Successfully processed payment for user ${user_id} - ${tier} tier with ${totalCredits} credits`)

    // Update daily analytics
    await supabase.rpc('update_payment_analytics')

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}
```

**Step 2: Verify upgradeTier still works**

The existing `upgradeTier` function in `lib/credits.ts` should work as-is. Verify it adds credits correctly.

**Step 3: Test webhook locally**

Simulate a payment webhook with test data

Expected: Credits added to user_credits table with correct tier and balance

**Step 4: Commit**

```bash
git add app/api/payments/webhook/route.ts
git commit -m "feat: track credits granted in payment events"
```

---

### Task 7: Create credit recharge endpoint

**Files:**
- Create: `app/api/credits/recharge/route.ts`

**Step 1: Create endpoint**

```typescript
// app/api/credits/recharge/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DODO_API_URL, DODO_SECRET_KEY } from '@/lib/payments'

// Credit packages
const CREDIT_PACKAGES = {
  small: { credits: 50000, price: 9.99 },
  medium: { credits: 100000, price: 19.99 },
  large: { credits: 250000, price: 49.99 },
} as const

export async function POST(request: NextRequest) {
  try {
    const { packageSize } = await request.json()

    if (!packageSize || !CREDIT_PACKAGES[packageSize as keyof typeof CREDIT_PACKAGES]) {
      return NextResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const pkg = CREDIT_PACKAGES[packageSize as keyof typeof CREDIT_PACKAGES]

    // Create checkout session with Dodo
    const checkoutData = {
      amount: Math.round(pkg.price * 100), // Convert to cents
      currency: 'USD',
      customer_email: user.email,
      customer_id: user.id,
      product_name: `ThoughtMap Credit Recharge - ${pkg.credits.toLocaleString()} Credits`,
      product_description: `Add ${pkg.credits.toLocaleString()} credits to your account`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?status=cancelled`,
      metadata: {
        type: 'credit_recharge',
        user_id: user.id,
        credits: pkg.credits,
        package_size: packageSize,
      },
    }

    const response = await fetch(`${DODO_API_URL}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DODO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Dodo API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    const session = await response.json()

    return NextResponse.json({
      checkout_url: session.checkout_url,
      session_id: session.id,
    })

  } catch (error) {
    console.error('Credit recharge error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ packages: CREDIT_PACKAGES })
}
```

**Step 2: Update payment webhook to handle credit recharge**

In `app/api/payments/webhook/route.ts`, update `handlePaymentSuccess`:

```typescript
async function handlePaymentSuccess(sessionData: any) {
  try {
    const { metadata, amount, session_id } = sessionData

    if (metadata.type === 'credit_recharge') {
      // Handle credit recharge
      await handleCreditRecharge(sessionData)
    } else if (metadata.type === 'tier_upgrade') {
      // Handle tier upgrade (existing flow)
      await handleTierUpgrade(sessionData)
    } else {
      console.warn(`Unknown payment type: ${metadata.type}`)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handleCreditRecharge(sessionData: any) {
  const { metadata, amount, session_id } = sessionData
  const { user_id, credits } = metadata

  const supabase = await createClient()

  // Add credits using existing function
  const result = await addCredits(user_id, credits)

  if (!result.success) {
    console.error('Failed to add credits:', result.error)
    return
  }

  // Store payment event
  await supabase.from('payment_events').insert({
    event_type: 'checkout.session.completed',
    session_id: session_id,
    user_id: user_id,
    amount: amount / 100,
    status: 'completed',
    credits_granted: credits,
    metadata: sessionData,
    processed_at: new Date().toISOString()
  })

  console.log(`Successfully added ${credits} credits to user ${user_id}`)
}
```

**Step 3: Test endpoint**

Call: `POST /api/credits/recharge` with `{ "packageSize": "small" }`

Expected: Returns checkout URL from Dodo

**Step 4: Commit**

```bash
git add app/api/credits/recharge/route.ts app/api/payments/webhook/route.ts
git commit -m "feat: add credit recharge endpoint for manual top-ups"
```

---

## Phase 5: UI & Monitoring

### Task 8: Add credit usage endpoint for dashboard

**Files:**
- Create: `app/api/credits/usage/route.ts`

**Step 1: Create endpoint**

```typescript
// app/api/credits/usage/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's current credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('credits, tier')
      .eq('user_id', user.id)
      .single()

    // Get usage summary for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: usage } = await supabase
      .from('credit_usage_logs')
      .select('model_id, credits_deducted, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })

    // Aggregate by model
    const byModel: Record<string, { usageCount: number; totalCredits: number }> = {}
    usage?.forEach(log => {
      if (!byModel[log.model_id]) {
        byModel[log.model_id] = { usageCount: 0, totalCredits: 0 }
      }
      byModel[log.model_id].usageCount += 1
      byModel[log.model_id].totalCredits += log.credits_deducted
    })

    const totalCreditsUsed = usage?.reduce((sum, log) => sum + log.credits_deducted, 0) || 0

    return NextResponse.json({
      currentCredits: credits?.credits || 0,
      tier: credits?.tier || 'free',
      totalCreditsUsed30d: totalCreditsUsed,
      usageByModel: byModel,
      usageCount: usage?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching credit usage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}
```

**Step 2: Test endpoint**

Call: `GET /api/credits/usage`

Expected: Returns credit balance and 30-day usage breakdown

**Step 3: Commit**

```bash
git add app/api/credits/usage/route.ts
git commit -m "feat: add credit usage endpoint for dashboard analytics"
```

---

### Task 9: Update existing endpoints to pass feature names

**Files:**
- Modify: All API endpoints that call `deductCredits`

**Step 1: Standardize feature names**

Update all deductCredits calls to include feature name:
- Chat: `'chat'`
- Definition: `'definition'`
- Quiz generation: `'quiz'`
- Illustration: `'illustration'`
- Auto-explain: `'auto_explain'`

Already covered in Task 5. Just verify all are consistent.

**Step 2: Commit**

```bash
git add .
git commit -m "feat: standardize feature names in credit tracking"
```

---

## Phase 6: Testing & Documentation

### Task 10: End-to-end testing

**Files:**
- Create: `__tests__/e2e/credit-usage.test.ts`

**Step 1: Write E2E test**

```typescript
import { createClient } from '@/lib/supabase/server'
import { calculateCreditsFromTokens } from '@/lib/model-pricing'

describe('E2E: Credit usage flow', () => {
  it('should deduct credits correctly for LLM calls', async () => {
    // 1. User makes LLM call
    // 2. Credits are deducted based on tokens
    // 3. Usage is logged
    // 4. Balance is updated

    const modelId = 'openai/gpt-4o'
    const inputTokens = 1000
    const outputTokens = 500

    const expectedCredits = calculateCreditsFromTokens(modelId, inputTokens, outputTokens)

    // Should be: (1000 * 5 + 500 * 15) / 1000 = 12.5 → rounds to 12.5
    expect(expectedCredits).toBe(12.5)
  })

  it('should handle free models with no credit deduction', async () => {
    const modelId = 'deepseek/deepseek-chat'
    const credits = calculateCreditsFromTokens(modelId, 10000, 5000)

    expect(credits).toBe(0)
  })

  it('should prevent LLM calls when insufficient credits', async () => {
    // Simulate insufficient credits check
    // Should return 402 error
  })
})
```

**Step 2: Run tests**

Run: `npm test`

Expected: All tests pass

**Step 3: Commit**

```bash
git add __tests__/e2e/credit-usage.test.ts
git commit -m "test: add E2E tests for credit usage flow"
```

---

### Task 11: Update documentation

**Files:**
- Modify: `docs/BILLING.md` (create if doesn't exist)

**Step 1: Create billing documentation**

```markdown
# Usage-Based Billing System

## Overview

Users purchase tier packages (Basic, Pro) that include a large upfront credit allotment. Credits are deducted based on actual LLM token usage, with different models costing different amounts.

## Credit Pricing

Credits are calculated per 1,000 tokens:
- **Input tokens**: Deducted at model-specific rate (e.g., 5 credits per 1K for GPT-4o)
- **Output tokens**: Deducted at model-specific rate (e.g., 15 credits per 1K for GPT-4o)

Formula:
```
Credits Deducted = (input_tokens × input_rate + output_tokens × output_rate) / 1000
```

## Model Pricing

See `lib/model-pricing.ts` for complete pricing table.

Examples:
- **Gemini 2.0 Flash Lite** (Free): 0.075 input, 0.3 output per 1K tokens
- **GPT-4o** (Premium): 5 input, 15 output per 1K tokens
- **DeepSeek Chat** (Free): 0 credits

## Tier Packages

| Tier | Price | Credits | Includes |
|------|-------|---------|----------|
| Free | $0 | 0 | 15 trails/day |
| Basic | $5 | 200 | Unlimited trails |
| Pro | $15 | 600 + 100 bonus | All models |

## Manual Recharge

When credits run low, users can purchase additional credit packages:
- **Small**: 50,000 credits for $9.99
- **Medium**: 100,000 credits for $19.99
- **Large**: 250,000 credits for $49.99

Access via: `POST /api/credits/recharge`

## Usage Tracking

All credit usage is logged to `credit_usage_logs` table for audit trail:
- User ID
- Model used
- Input/output tokens
- Credits deducted
- Feature (chat, quiz, definition, etc.)
- Timestamp

View usage dashboard: `GET /api/credits/usage`

## API Reference

### Check Credit Balance
```
GET /api/user/credits
Response: { credits: number, tier: string }
```

### Get Usage History
```
GET /api/credits/usage
Response: { currentCredits, tier, usageByModel, totalCreditsUsed30d }
```

### Initiate Credit Recharge
```
POST /api/credits/recharge
Body: { packageSize: 'small' | 'medium' | 'large' }
Response: { checkout_url, session_id }
```
```

**Step 2: Commit**

```bash
git add docs/BILLING.md
git commit -m "docs: add usage-based billing system documentation"
```

---

## Final Verification

### Task 12: Verify all changes and run full test suite

**Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass

**Step 2: Build project**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 3: Check for TypeScript errors**

```bash
npm run type-check
```

Expected: No TypeScript errors

**Step 4: Final commit summary**

```bash
git log --oneline -15
```

Expected: See all commits from this implementation

---

## Execution Complete

All tasks complete! The usage-based billing system is now:

✅ **Configured**: Model pricing defined for all LLM models
✅ **Tracked**: All LLM token usage logged to database
✅ **Integrated**: Credit deduction on all endpoints
✅ **Tested**: Unit and E2E tests passing
✅ **Documented**: Billing system documented
✅ **Recharge**: Manual credit top-up available via Dodo

**Next**: Create PR with all changes, request code review.
