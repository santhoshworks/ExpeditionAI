# Quick Demo Setup Guide

## Problem
You're seeing "Expedition Not Found" because the demo expedition hasn't been created yet.

## Quick Fix (3 Steps)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**

### Step 2: Run This Query
Copy and paste this into the SQL Editor:

```sql
-- Find one of your existing expeditions
SELECT id, title FROM expeditions LIMIT 5;
```

Copy one of the expedition IDs from the results.

### Step 3: Make It Public
Replace `YOUR_EXPEDITION_ID_HERE` with the ID you copied, then run:

```sql
UPDATE expeditions 
SET 
  is_public = true,
  public_slug = 'demo-expedition',
  public_description = 'Try ExpeditionAI with this interactive demo!'
WHERE id = 'YOUR_EXPEDITION_ID_HERE';

-- Get the ID to use
SELECT id FROM expeditions WHERE public_slug = 'demo-expedition';
```

Copy the ID from the result.

### Step 4: Update the Code
Open `app/explore/page.tsx` and find line ~159:

```tsx
<Link href="/demo/expedition/DEMO_EXPEDITION_ID">
```

Replace `DEMO_EXPEDITION_ID` with your actual expedition ID.

### Step 5: Test
Go to: `http://localhost:3000/demo/expedition/YOUR_EXPEDITION_ID`

## Alternative: Use Any Public Expedition

If you already have public expeditions, you can use them directly:

1. Go to `http://localhost:3000/explore`
2. Click "Try Demo Mode" on any expedition card
3. It will take you to the demo page for that expedition

## Troubleshooting

**Still seeing "Expedition Not Found"?**
- Make sure the expedition `is_public = true`
- Check that you're using the correct expedition ID
- Verify the expedition has at least one trail

**No expeditions exist?**
1. Sign up/login to your app
2. Create an expedition
3. Then follow the steps above to make it public

## Need Help?
Check the full setup guide in `docs/DEMO_SETUP.md`
