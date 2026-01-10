-- User credits and tier management
-- Migration: 002_user_credits.sql

-- Create enum for user tiers
CREATE TYPE user_tier AS ENUM ('free', 'basic', 'pro');

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  credits DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  tier user_tier DEFAULT 'free' NOT NULL,
  trails_today INTEGER DEFAULT 0 NOT NULL,
  last_trail_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create credit_transactions table for audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- positive for additions, negative for deductions
  type VARCHAR(20) NOT NULL CHECK (type IN ('deduct', 'add', 'purchase', 'bonus')),
  model_id VARCHAR(100),
  trail_id UUID REFERENCES trails(id) ON DELETE SET NULL,
  description TEXT,
  balance_after DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for credit_transactions
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Function to create user credits row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits, tier, trails_today)
  VALUES (NEW.id, 0, 'free', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create credits row on new user
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_current_credits DECIMAL;
  v_new_credits DECIMAL;
BEGIN
  -- Lock the row and get current credits
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User credits not found'
    );
  END IF;

  -- Check if enough credits
  IF v_current_credits < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'required', p_amount,
      'available', v_current_credits
    );
  END IF;

  -- Deduct credits
  v_new_credits := v_current_credits - p_amount;

  UPDATE user_credits
  SET credits = v_new_credits,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'credits_deducted', p_amount,
    'remaining_credits', v_new_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_new_credits DECIMAL;
BEGIN
  UPDATE user_credits
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_credits;

  IF NOT FOUND THEN
    -- Create the row if it doesn't exist
    INSERT INTO user_credits (user_id, credits, tier)
    VALUES (p_user_id, p_amount, 'free')
    RETURNING credits INTO v_new_credits;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment trail count for free tier daily limit
CREATE OR REPLACE FUNCTION increment_trail_count(
  p_user_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_credits
  SET
    trails_today = CASE
      WHEN last_trail_date = p_date THEN trails_today + 1
      ELSE 1
    END,
    last_trail_date = p_date,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create row if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, trails_today, last_trail_date)
    VALUES (p_user_id, 1, p_date);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade user tier
CREATE OR REPLACE FUNCTION upgrade_user_tier(
  p_user_id UUID,
  p_new_tier user_tier,
  p_credits_to_add DECIMAL
)
RETURNS JSONB AS $$
DECLARE
  v_new_credits DECIMAL;
BEGIN
  UPDATE user_credits
  SET
    tier = p_new_tier,
    credits = credits + p_credits_to_add,
    trails_today = 0,
    last_trail_date = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING credits INTO v_new_credits;

  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, tier, credits)
    VALUES (p_user_id, p_new_tier, p_credits_to_add)
    RETURNING credits INTO v_new_credits;
  END IF;

  -- Log the purchase
  INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
  VALUES (
    p_user_id,
    p_credits_to_add,
    'purchase',
    'Upgraded to ' || p_new_tier::text || ' tier',
    v_new_credits
  );

  RETURN jsonb_build_object(
    'success', true,
    'new_tier', p_new_tier,
    'new_balance', v_new_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users to have credits row (run once)
INSERT INTO user_credits (user_id, credits, tier, trails_today)
SELECT id, 0, 'free', 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;
