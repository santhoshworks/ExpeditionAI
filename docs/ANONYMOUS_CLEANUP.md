# Anonymous Expedition Cleanup

This document explains the automatic cleanup system for anonymous/demo expeditions.

## Overview

Anonymous expeditions created through the demo mode (`/demo/expedition/[id]`) are automatically deleted after 30 days to prevent database bloat and maintain performance.

## Database Schema

The migration `add_anonymous_expeditions_cleanup.sql` adds:

- `is_anonymous` (boolean): Marks expeditions created in demo mode
- `anonymous_created_at` (timestamp): Tracks when the anonymous expedition was created

## Cleanup Process

### Automatic Cleanup (Recommended)

The system uses **Vercel Cron** to run cleanup daily at 2 AM UTC:

1. Vercel triggers `/api/cleanup-anonymous` based on `vercel.json` configuration
2. The API endpoint calls the database function `schedule_anonymous_cleanup()`
3. Expeditions older than 30 days are deleted (cascading to trails and messages)

### Manual Cleanup

You can also trigger cleanup manually:

```bash
# Using curl with the CRON_SECRET
curl -X POST https://your-domain.com/api/cleanup-anonymous \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or via Supabase SQL Editor:

```sql
SELECT * FROM schedule_anonymous_cleanup();
```

## Environment Variables

Add to your `.env.local`:

```bash
CRON_SECRET=your_random_secret_key_here
```

**Important**: Use a strong random string for `CRON_SECRET` to prevent unauthorized cleanup triggers.

## Vercel Cron Configuration

The `vercel.json` file configures the cron job:

```json
{
  "crons": [
    {
      "path": "/api/cleanup-anonymous",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Schedule format: `minute hour day month dayOfWeek` (UTC)
- `0 2 * * *` = Every day at 2:00 AM UTC

## Monitoring

Check cleanup logs in Vercel dashboard:
1. Go to your project → Deployments → Functions
2. Select `/api/cleanup-anonymous`
3. View execution logs

## Testing

Test the cleanup endpoint locally:

```bash
# Start dev server
npm run dev

# Trigger cleanup (in another terminal)
curl -X POST http://localhost:3000/api/cleanup-anonymous \
  -H "Authorization: Bearer your_local_secret"
```

## Database Functions

### `mark_expedition_anonymous(expedition_id UUID)`
Marks an expedition as anonymous (currently not used in demo mode, but available for future use).

### `cleanup_old_anonymous_expeditions()`
Deletes anonymous expeditions older than 30 days. Returns count of deleted expeditions.

### `schedule_anonymous_cleanup()`
Wrapper function that calls cleanup and returns JSON result. Used by the API endpoint.

## Migration

Run the migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase dashboard SQL Editor
```

## Notes

- Deletion is **cascading** - all trails, messages, and related data are also deleted
- The 30-day period starts from `anonymous_created_at`, not `created_at`
- Public expeditions (`is_public = true`) are NOT affected by this cleanup
- The cleanup is **permanent** and cannot be undone
