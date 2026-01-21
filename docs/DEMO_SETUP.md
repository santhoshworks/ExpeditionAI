# Demo Mode Setup Guide

This guide explains how to set up and use the demo/anonymous user experience in ExpeditionAI.

## Overview

The demo mode allows anonymous users to:
- ✅ Explore public expeditions without signing up
- ✅ Chat with AI (limited to 10 messages per session)
- ✅ Generate up to 5 temporary trails
- ✅ View the interactive knowledge map
- ❌ Save progress (resets on page refresh)
- ❌ Access Quiz, Journal, or other authenticated features

## Setup Instructions

### 1. Run Database Migrations

Apply the migrations in order:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase SQL Editor:
# 1. add_anonymous_expeditions_cleanup.sql
# 2. create_demo_expedition.sql (update YOUR_ADMIN_USER_ID first)
```

### 2. Create Demo Expedition

Edit `supabase/migrations/create_demo_expedition.sql`:

1. Replace `YOUR_ADMIN_USER_ID` with an actual user ID from your `profiles` table
2. Run the migration in Supabase SQL Editor
3. Note the expedition ID returned

### 3. Update Demo Links

Replace `DEMO_EXPEDITION_ID` in the following files with your actual demo expedition ID:

**File: `app/explore/page.tsx`** (line ~159)
```tsx
<Link href="/demo/expedition/YOUR_EXPEDITION_ID_HERE">
```

### 4. Configure Environment Variables

Add to `.env.local`:

```bash
# Cron Job Secret (for cleanup tasks)
CRON_SECRET=your_random_secret_key_here
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 5. Deploy Cleanup Cron Job

The `vercel.json` file is already configured to run cleanup daily at 2 AM UTC.

When you deploy to Vercel:
1. Add `CRON_SECRET` to your environment variables
2. The cron job will automatically start running
3. Monitor in Vercel Dashboard → Functions → `/api/cleanup-anonymous`

## User Flow

### Landing Page → Demo

1. **Landing Page** (`/`)
   - Hero section has "Try Interactive Demo" button
   - Links to `/explore`

2. **Explore Page** (`/explore`)
   - Shows all public expeditions
   - Prominent demo banner at top
   - Each expedition card has "Try Demo Mode" button
   - Links to `/demo/expedition/[id]`

3. **Demo Expedition Page** (`/demo/expedition/[id]`)
   - Full expedition interface
   - Demo mode banner at top
   - Limited features (10 messages, 5 trails)
   - "Sign Up" CTAs for restricted actions

### Demo Page Features

**Enabled:**
- ✅ View expedition and trails
- ✅ Interactive chat (10 message limit)
- ✅ Generate trails (5 trail limit)
- ✅ View knowledge map
- ✅ Navigate between trails

**Disabled (shows "Sign Up" prompt):**
- ❌ Quiz challenges
- ❌ Journal export
- ❌ Delete trails
- ❌ Save progress

## Testing Locally

### Test Demo Flow

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   ```
   http://localhost:3000
   ```

3. Click "Try Interactive Demo"

4. Explore the demo expedition

### Test Cleanup API

```bash
# Trigger cleanup manually
curl -X POST http://localhost:3000/api/cleanup-anonymous \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Check health
curl http://localhost:3000/api/cleanup-anonymous
```

## Monitoring

### Check Demo Usage

Query Supabase to see demo activity:

```sql
-- Count active demo sessions (trails created in last 24h)
SELECT COUNT(DISTINCT expedition_id) as active_demos
FROM trails
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND expedition_id IN (
    SELECT id FROM expeditions WHERE is_anonymous = true
  );
```

### Monitor Cleanup

Check Vercel logs:
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to Functions
4. Select `/api/cleanup-anonymous`
5. View execution logs

## Customization

### Change Demo Limits

Edit `app/demo/expedition/[id]/page.tsx`:

```tsx
// Line ~283
maxMessages={10}  // Change message limit

// Line ~82
if (localTrails.length + topics.length > 5)  // Change trail limit
```

### Change Cleanup Period

Edit `supabase/migrations/add_anonymous_expeditions_cleanup.sql`:

```sql
-- Line ~33
WHERE anonymous_created_at < NOW() - INTERVAL '30 days'
-- Change '30 days' to your preferred period
```

### Change Cron Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cleanup-anonymous",
      "schedule": "0 2 * * *"  // Change to your preferred schedule
    }
  ]
}
```

Schedule format: `minute hour day month dayOfWeek` (UTC)

## Troubleshooting

### Demo page shows "Expedition not found"

1. Check if expedition exists and is public:
   ```sql
   SELECT id, title, is_public FROM expeditions WHERE id = 'YOUR_ID';
   ```

2. Verify RLS policies allow anonymous read:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'expeditions';
   ```

### Chat not working in demo mode

1. Check API endpoint is correct (`/api/chat/demo`)
2. Verify OpenRouter API key is set
3. Check browser console for errors

### Cleanup not running

1. Verify `CRON_SECRET` is set in Vercel
2. Check Vercel cron job is enabled
3. Manually trigger to test:
   ```bash
   curl -X POST https://your-domain.com/api/cleanup-anonymous \
     -H "Authorization: Bearer YOUR_SECRET"
   ```

## Security Notes

- ✅ Demo mode uses free AI models to save costs
- ✅ No database writes for messages (ephemeral only)
- ✅ Rate limiting prevents abuse
- ✅ Cleanup removes old data automatically
- ⚠️ Keep `CRON_SECRET` secure
- ⚠️ Monitor API usage for abuse

## Next Steps

1. Create your demo expedition
2. Update demo links with actual expedition ID
3. Test the full flow locally
4. Deploy to production
5. Monitor usage and adjust limits as needed

For more details, see:
- `docs/ANONYMOUS_CLEANUP.md` - Cleanup system documentation
- `app/demo/expedition/[id]/page.tsx` - Demo page implementation
- `app/api/chat/demo/route.ts` - Demo chat API
