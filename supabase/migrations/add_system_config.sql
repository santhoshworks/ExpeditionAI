-- System configuration table for admin-configurable settings
-- Migration: add_system_config.sql

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default tier configuration
INSERT INTO system_config (key, value, description) VALUES 
('default_user_tier', '"pro"', 'Default tier assigned to new users (free, basic, pro)'),
('default_tier_credits', '{"free": 0, "basic": 50, "pro": 150}', 'Default credits given to new users by tier')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can modify, everyone can read
CREATE POLICY "Anyone can read system config"
  ON system_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify system config"
  ON system_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create indexes
CREATE INDEX idx_system_config_key ON system_config(key);

-- Function to get system config value
CREATE OR REPLACE FUNCTION get_system_config(config_key TEXT)
RETURNS JSONB AS $$
DECLARE
  config_value JSONB;
BEGIN
  SELECT value INTO config_value
  FROM system_config
  WHERE key = config_key;
  
  RETURN COALESCE(config_value, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated function to create user credits row on signup with configurable default tier
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
DECLARE
  default_tier TEXT := 'free';  -- Fallback default
  default_credits JSONB;
  tier_credits INTEGER := 0;    -- Fallback default
  config_exists BOOLEAN;
BEGIN
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

    -- Use fallback if not found
    default_tier := COALESCE(default_tier, 'free');

    -- Get default credits configuration
    SELECT value INTO default_credits
    FROM system_config
    WHERE key = 'default_tier_credits';

    -- Extract credits for the default tier (with fallback)
    IF default_credits IS NOT NULL THEN
      tier_credits := COALESCE((default_credits->>default_tier)::INTEGER, 0);
    END IF;
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

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, still create the user with basic defaults
    -- This ensures user signup doesn't fail due to credit system issues
    BEGIN
      INSERT INTO public.user_credits (user_id, credits, tier, trails_today)
      VALUES (NEW.id, 0, 'free', 0)
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log but don't fail - user creation is more important
        RAISE WARNING 'Failed to create user credits for %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update trigger (recreate to use new function)
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();