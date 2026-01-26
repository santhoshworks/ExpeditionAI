-- Fix the new user tier assignment trigger
-- This ensures new users get the pro tier correctly

-- First, let's make sure the system config is correct
INSERT INTO system_config (key, value, description) VALUES 
('default_user_tier', '"pro"', 'Default tier assigned to new users (free, basic, pro)'),
('default_tier_credits', '{"free": 0, "basic": 200, "pro": 700}', 'Default credits given to new users by tier')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Create an improved trigger function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  default_tier TEXT := 'pro';  -- Default to pro instead of free
  default_credits JSONB;
  tier_credits INTEGER := 700;  -- Default to pro credits
  config_exists BOOLEAN;
BEGIN
  -- Log the start of user creation
  RAISE NOTICE 'Creating user credits for user: %', NEW.id;

  -- Check if system_config table exists and has our config
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'system_config'
  ) INTO config_exists;

  IF config_exists THEN
    -- Get default tier from system config
    SELECT TRIM(BOTH '"' FROM value::text) INTO default_tier
    FROM system_config
    WHERE key = 'default_user_tier';

    -- Use pro as fallback if not found
    default_tier := COALESCE(default_tier, 'pro');

    -- Get default credits configuration
    SELECT value INTO default_credits
    FROM system_config
    WHERE key = 'default_tier_credits';

    -- Extract credits for the default tier (with pro fallback)
    IF default_credits IS NOT NULL THEN
      tier_credits := COALESCE((default_credits->>default_tier)::INTEGER, 700);
    END IF;

    -- Log what we're using
    RAISE NOTICE 'Using tier: %, credits: %', default_tier, tier_credits;
  ELSE
    -- Log that we're using defaults
    RAISE NOTICE 'No system config found, using defaults: tier=pro, credits=700';
  END IF;

  -- Insert user credits with configurable defaults
  INSERT INTO public.user_credits (user_id, credits, tier, trails_today)
  VALUES (NEW.id, tier_credits, default_tier::user_tier, 0);

  -- Log the user creation with tier assignment
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
    'Welcome bonus for ' || default_tier || ' tier signup',
    tier_credits
  );

  RAISE NOTICE 'Successfully created user credits: tier=%, credits=%', default_tier, tier_credits;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    RAISE WARNING 'Error in handle_new_user_credits for user %: %', NEW.id, SQLERRM;
    
    -- If anything fails, still create the user with pro defaults (not free)
    -- This ensures user signup doesn't fail due to credit system issues
    BEGIN
      INSERT INTO public.user_credits (user_id, credits, tier, trails_today)
      VALUES (NEW.id, 700, 'pro', 0)
      ON CONFLICT (user_id) DO NOTHING;
      
      RAISE NOTICE 'Created fallback user credits with pro tier';
    EXCEPTION
      WHEN OTHERS THEN
        -- Log but don't fail - user creation is more important
        RAISE WARNING 'Failed to create fallback user credits for %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to use the updated function
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Verify the configuration
SELECT 
  'Configuration Check' as check_type,
  key, 
  value 
FROM system_config 
WHERE key IN ('default_user_tier', 'default_tier_credits')

UNION ALL

SELECT 
  'Trigger Check' as check_type,
  'trigger_exists' as key,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created_credits'
  ) THEN 'true' ELSE 'false' END as value;