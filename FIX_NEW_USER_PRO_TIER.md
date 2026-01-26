# Fix: New Users Not Getting Pro Tier

## Problem
New users are getting `free` tier instead of `pro` tier when they sign up.

## Root Cause
The database trigger `handle_new_user_credits()` was never updated from the original version that assigns `free` tier. The migration file `fix_new_user_tier_trigger.sql` exists but was not applied to the production Supabase database.

## Solution

### Step 1: Apply the Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of:
   ```
   supabase/migrations/20250125_fix_new_user_pro_tier.sql
   ```
6. Click **Run** (or press Cmd+Enter / Ctrl+Enter)

### Step 2: Verify the Fix

After running the migration, run this verification query in the SQL Editor:

```sql
-- Check configuration is correct
SELECT key, value FROM system_config
WHERE key IN ('default_user_tier', 'default_tier_credits');

-- Expected output:
-- default_user_tier | "pro"
-- default_tier_credits | {"free": 0, "basic": 200, "pro": 700}

-- Check trigger function exists
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'handle_new_user_credits' AND routine_schema = 'public';

-- Check recent users
SELECT tier, credits, created_at FROM user_credits
ORDER BY created_at DESC LIMIT 5;
```

### Step 3: Test with a New User

1. Sign out of the app
2. Create a new test account with a different email
3. After signup, check your tier in the dashboard
4. Verify you have 700 credits and `pro` tier

### Step 4: (Optional) Upgrade Existing Free Users

If you have existing users stuck on `free` tier, run this in SQL Editor:

```sql
-- First, check who needs upgrading
SELECT user_id, tier, credits FROM user_credits WHERE tier = 'free';

-- Upgrade them to pro with 700 credits
UPDATE user_credits
SET
  tier = 'pro',
  credits = 700,
  updated_at = NOW()
WHERE tier = 'free';

-- Create audit trail
INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
SELECT
  user_id,
  700,
  'bonus',
  'Beta upgrade: free to pro tier',
  700
FROM user_credits
WHERE tier = 'pro' AND credits = 700;
```

## Files Changed

- `supabase/migrations/20250125_fix_new_user_pro_tier.sql` - New migration file with the complete fix
- `.env.local` - Added `DEFAULT_USER_TIER=pro` and `ENABLE_ADMIN_TIER_CONFIG=true`

## Technical Details

The trigger function `handle_new_user_credits()` is called automatically when a new user signs up via Supabase Auth. It:

1. Reads the default tier from `system_config` table (defaults to 'pro')
2. Gets the credits for that tier (700 for pro)
3. Creates a `user_credits` record with the tier and credits
4. Creates an audit record in `credit_transactions`

The fix ensures:
- Hardcoded fallback is 'pro' with 700 credits (not 'free' with 0)
- Configuration can be changed via admin panel
- Error handling ensures user signup never fails due to credit system issues
