# Demo Creation Troubleshooting

## Error: "Failed to create demo"

This error usually happens for one of these reasons:

### 1. RLS Policies Blocking Anonymous Users

**Quick Fix:** Run this in Supabase SQL Editor:

```sql
-- Allow anonymous users to create expeditions
CREATE POLICY "Allow demo expedition creation" ON public.expeditions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to create trails
CREATE POLICY "Allow demo trail creation" ON public.trails
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

Or run the file: `FIX_DEMO_RLS.sql`

### 2. Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try creating demo again
4. Look for error details

### 3. Check Server Logs

In your terminal where `npm run dev` is running, look for errors like:
- "Error creating demo expedition"
- "Error creating base camp"

### 4. Verify Supabase Connection

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 5. Test Supabase Directly

In Supabase SQL Editor:

```sql
-- Test if you can insert
INSERT INTO expeditions (title, description, is_public)
VALUES ('Test Demo', 'Test', false)
RETURNING id;

-- If that works, delete it
DELETE FROM expeditions WHERE title = 'Test Demo';
```

### 6. Check Existing Policies

```sql
-- See all policies on expeditions table
SELECT * FROM pg_policies WHERE tablename = 'expeditions';

-- See all policies on trails table
SELECT * FROM pg_policies WHERE tablename = 'trails';
```

## Common Solutions

### Solution A: Permissive RLS (Quick Fix)

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can only view their own expeditions" ON expeditions;
DROP POLICY IF EXISTS "Users can only create their own expeditions" ON expeditions;

-- Add permissive policies
CREATE POLICY "Allow all expedition operations" ON expeditions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all trail operations" ON trails
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

### Solution B: Specific Demo Policies (Better)

```sql
-- Allow demo expeditions (no user_id required)
CREATE POLICY "Allow demo expedition creation" ON expeditions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR is_anonymous = true);

-- Allow demo trail creation
CREATE POLICY "Allow demo trail creation" ON trails
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    expedition_id IN (
      SELECT id FROM expeditions WHERE user_id IS NULL OR is_anonymous = true
    )
  );
```

## Still Not Working?

1. **Share the exact error message** from browser console
2. **Check server logs** in terminal
3. **Verify RLS policies** are applied
4. **Test Supabase connection** with SQL insert

## Quick Test

Try this in browser console on `/demo/create`:

```javascript
fetch('/api/demo/create-expedition', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'Test Topic' })
})
.then(r => r.json())
.then(console.log)
```

This will show the exact error response.
