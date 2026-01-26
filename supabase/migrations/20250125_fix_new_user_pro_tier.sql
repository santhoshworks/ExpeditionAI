-- =============================================================================
-- FIX: Ensure new users get PRO tier with 700 credits
-- =============================================================================
-- This migration fixes the issue where new users were getting 'free' tier
-- instead of 'pro' tier for beta testing.
--
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

-- Step 1: Ensure system_config table exists
-- =============================================================================
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on system_config
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read config
DROP POLICY IF EXISTS "Anyone can read system config" ON system_config;
CREATE POLICY "Anyone can read system config"
  ON system_config FOR SELECT
  TO authenticated
  USING (true);

-- Step 2: Insert or update the configuration for pro tier
-- =============================================================================
INSERT INTO system_config (key, value, description) VALUES
  ('default_user_tier', '"pro"', 'Default tier assigned to new users (free, basic, pro)'),
  ('default_tier_credits', '{"free": 0, "basic": 200, "pro": 700}', 'Default credits given to new users by tier')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Step 3: Create helper function to get system config
-- =============================================================================
CREATE OR REPLACE FUNCTION get_system_config(config_key TEXT)
RETURNS JSONB AS $$
DECLARE
  config_value JSONB;
BEGIN
  SELECT value INTO config_value
  FROM system_config
  WHERE key = config_key;

  RETURN config_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Replace the trigger function with the FIXED version
-- =============================================================================
-- This is the KEY fix - the trigger function now reads from system_config
-- and defaults to 'pro' tier with 700 credits

CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  default_tier TEXT := 'pro';  -- HARDCODED DEFAULT: pro (not free!)
  default_credits JSONB;
  tier_credits INTEGER := 700;  -- HARDCODED DEFAULT: 700 credits
  config_tier TEXT;
  config_credits JSONB;
BEGIN
  -- Try to get configuration from system_config table
  BEGIN
    -- Get default tier from system config
    SELECT TRIM(BOTH '"' FROM value::text) INTO config_tier
    FROM system_config
    WHERE key = 'default_user_tier';

    IF config_tier IS NOT NULL AND config_tier != '' THEN
      default_tier := config_tier;
    END IF;

    -- Get default credits configuration
    SELECT value INTO config_credits
    FROM system_config
    WHERE key = 'default_tier_credits';

    IF config_credits IS NOT NULL THEN
      tier_credits := COALESCE((config_credits->>default_tier)::INTEGER, 700);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- If anything fails reading config, use hardcoded pro defaults
      default_tier := 'pro';
      tier_credits := 700;
  END;

  -- Create the user_credits record with the determined tier and credits
  INSERT INTO public.user_credits (user_id, credits, tier, trails_today)
  VALUES (NEW.id, tier_credits, default_tier::user_tier, 0);

  -- Create an audit transaction record
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  ) VALUES (
    NEW.id,
    tier_credits,
    'bonus',
    'Welcome bonus - ' || default_tier || ' tier beta access',
    tier_credits
  );

  RETURN NEW;

EXCEPTION
  WHEN OTHERS THEN
    -- Ultimate fallback: if anything fails, still create user with pro tier
    -- This ensures user signup NEVER fails due to credit system issues
    BEGIN
      INSERT INTO public.user_credits (user_id, credits, tier, trails_today)
      VALUES (NEW.id, 700, 'pro', 0)
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Silently fail - user creation is more important than credits
        NULL;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the trigger to use the updated function
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Step 6: Verification queries (run these after to confirm it worked)
-- =============================================================================
-- Check configuration is correct:
SELECT
  'Configuration' as check_type,
  key,
  value::text as value
FROM system_config
WHERE key IN ('default_user_tier', 'default_tier_credits')
ORDER BY key;

-- Check trigger exists:
SELECT
  'Trigger' as check_type,
  trigger_name as key,
  'exists' as value
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_credits';

-- Check recent users (to see if previous users got free tier):
SELECT
  'Recent Users' as info,
  tier,
  credits,
  created_at
FROM user_credits
ORDER BY created_at DESC
LIMIT 5;

-- =============================================================================
-- OPTIONAL: Upgrade existing free tier users to pro for beta
-- Uncomment and run separately if you want to upgrade existing users
-- =============================================================================
-- UPDATE user_credits
-- SET
--   tier = 'pro',
--   credits = credits + 700,
--   updated_at = NOW()
-- WHERE tier = 'free';
--
-- INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
-- SELECT
--   user_id,
--   700,
--   'bonus',
--   'Beta upgrade: free to pro tier',
--   credits + 700
-- FROM user_credits
-- WHERE tier = 'pro' AND created_at < NOW() - INTERVAL '1 minute';
