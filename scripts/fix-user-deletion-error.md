# Fix User Deletion Error - Service Role Key Setup

## Problem
The user deletion is failing with a 500 error because the `SUPABASE_SERVICE_ROLE_KEY` environment variable is not set to the actual service role key.

## Current Issue
In your `.env.local` file, you have:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

This is a placeholder value, not the actual service role key needed for admin operations.

## How to Fix

### Step 1: Get Your Service Role Key from Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (ekvcpvbyruwzvnzjxyyz)
3. Go to **Settings** → **API**
4. In the **Project API keys** section, find the **service_role** key
5. Copy the **service_role** key (it starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 2: Update Your Environment File

Replace the placeholder in your `.env.local` file:

```bash
# Before (current - doesn't work)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# After (with your actual service role key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrdmNwdmJ5cnV3enZuemp4eXl6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk4OTc3NywiZXhwIjoyMDgzNTY1Nzc3fQ.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

### Step 3: Restart Your Development Server

After updating the environment variable:

```bash
# Stop your current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 4: Test User Deletion

1. Go to your admin panel
2. Try deleting a user again
3. It should now work properly

## Security Notes

⚠️ **Important**: The service role key has full admin access to your database. 

- **Never commit it to version control**
- **Never expose it in client-side code**
- **Only use it in server-side API routes**
- **Keep your `.env.local` file in `.gitignore`**

## What This Fixes

With the correct service role key, the admin client will be able to:
- Delete users from the `auth.users` table
- Trigger cascade deletions of all related data
- Perform other admin operations

## Verification

After fixing, you should see:
- ✅ User deletion works without errors
- ✅ All related data is properly deleted
- ✅ Success message appears in the admin panel
- ✅ User disappears from the user list

## Alternative Solution (If You Can't Access Supabase Dashboard)

If you can't access the Supabase dashboard, you can also:

1. Use the Supabase CLI:
   ```bash
   npx supabase projects api-keys --project-ref ekvcpvbyruwzvnzjxyyz
   ```

2. Or check your project's environment variables in your hosting platform (Vercel, Netlify, etc.)