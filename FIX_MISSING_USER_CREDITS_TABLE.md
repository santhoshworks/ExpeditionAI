# Fix: Missing user_credits Table

## Problem
The `user_credits` table doesn't exist in your database, causing the error:
```
"Model Gemini 2.0 Flash requires a higher tier. Please upgrade your plan."
```

## Solution
You need to run the migration to create the `user_credits` table.

## Steps to Fix

### Method 1: Supabase Dashboard (Easiest)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/ekvcpvbyruwzvnzjxyyz/sql
   - Or navigate: Dashboard → Your Project → SQL Editor

2. **Create New Query**
   - Click "New Query" button

3. **Copy the Migration SQL**
   - Open the file: `supabase/migrations/002_user_credits.sql`
   - Copy ALL the content (entire file)

4. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

5. **Verify Success**
   - Go to Table Editor
   - You should now see `user_credits` and `credit_transactions` tables

6. **Refresh Your App**
   - Go back to your app: http://localhost:3000
   - The error should be gone!

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (if not already linked)
npx supabase link --project-ref ekvcpvbyruwzvnzjxyyz

# Push migrations
npx supabase db push
```

## What This Migration Creates

1. **user_tier enum**: 'free', 'basic', 'pro'
2. **user_credits table**: Stores user tier, credits, and daily trail count
3. **credit_transactions table**: Audit trail for all credit changes
4. **Functions**:
   - `deduct_credits()` - Atomically deduct credits
   - `add_credits()` - Add credits to account
   - `increment_trail_count()` - Track daily trail usage
   - `upgrade_user_tier()` - Handle tier upgrades
5. **Trigger**: Automatically creates user_credits row on signup
6. **RLS Policies**: Security policies for data access

## After Migration

Your user will automatically get:
- **Tier**: free
- **Credits**: 0
- **Daily Trails**: 15/day limit

You can then:
- Use the tier override for testing: `http://localhost:3000?tier=pro`
- Or upgrade your actual tier through the payment flow

## Verify It Worked

Run this in your browser console after migration:
```javascript
// Check your current tier
fetch('/api/user/credits')
  .then(r => r.json())
  .then(console.log)
```

Or use the diagnostic script:
```bash
node scripts/check-user-credits.js
```

## Need Help?

If you get any errors during migration, check:
1. Do you have permission to run SQL in Supabase?
2. Are there any conflicting table names?
3. Check the Supabase logs for detailed error messages
