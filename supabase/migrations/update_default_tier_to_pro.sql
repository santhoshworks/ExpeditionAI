-- Update default tier to pro for all new users
-- This ensures users can access all models including Gemini 2.0 Flash

-- Update system configuration to set default tier to pro
UPDATE system_config 
SET value = '"pro"', updated_at = NOW()
WHERE key = 'default_user_tier';

-- Update default credits to give pro tier credits
UPDATE system_config 
SET value = '{"free": 0, "basic": 200, "pro": 700}', updated_at = NOW()
WHERE key = 'default_tier_credits';

-- Update existing users who are on free tier to pro tier (optional - for testing)
-- Uncomment the following lines if you want to upgrade existing free users
-- UPDATE user_credits 
-- SET tier = 'pro', credits = 700, updated_at = NOW()
-- WHERE tier = 'free';

-- Verify the changes
SELECT key, value, updated_at FROM system_config 
WHERE key IN ('default_user_tier', 'default_tier_credits');