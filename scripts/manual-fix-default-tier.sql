-- Manual fix for default tier configuration
-- Run this in your Supabase SQL Editor

-- 1. Check current configuration
SELECT 
  key, 
  value, 
  updated_at,
  description
FROM system_config 
WHERE key IN ('default_user_tier', 'default_tier_credits')
ORDER BY key;

-- 2. Update default tier to pro
UPDATE system_config 
SET 
  value = '"pro"',
  updated_at = NOW()
WHERE key = 'default_user_tier';

-- 3. Update default credits (pro tier gets 700 credits)
UPDATE system_config 
SET 
  value = '{"free": 0, "basic": 200, "pro": 700}',
  updated_at = NOW()
WHERE key = 'default_tier_credits';

-- 4. Verify the changes
SELECT 
  key, 
  value, 
  updated_at
FROM system_config 
WHERE key IN ('default_user_tier', 'default_tier_credits')
ORDER BY key;

-- 5. Test the function that the trigger uses
SELECT get_system_config('default_user_tier') as default_tier;
SELECT get_system_config('default_tier_credits') as default_credits;

-- 6. Check recent users to see their tiers
SELECT 
  user_id,
  tier,
  credits,
  created_at
FROM user_credits 
ORDER BY created_at DESC 
LIMIT 10;

-- 7. Optional: Update existing free users to pro (uncomment if needed)
-- UPDATE user_credits 
-- SET 
--   tier = 'pro',
--   credits = 700,
--   updated_at = NOW()
-- WHERE tier = 'free';

-- 8. Verify trigger function works by checking its definition
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user_credits'
AND routine_schema = 'public';

-- Expected results:
-- - default_user_tier should be "pro" (with quotes)
-- - default_tier_credits should be {"free": 0, "basic": 200, "pro": 700}
-- - New users should get pro tier with 700 credits