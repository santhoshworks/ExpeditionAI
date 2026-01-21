# Demo Creation Flow - Complete Implementation

## 🎯 What Changed

Instead of showing pre-made demo expeditions, users can now **create their own** temporary expeditions on any topic!

## 🚀 User Flow

### 1. Landing Page (`/`)
- User clicks **"Try Interactive Demo"** button
- Redirects to `/demo/create`

### 2. Demo Creation Page (`/demo/create`)
- Beautiful form asking "What do you want to learn?"
- User enters any topic (e.g., "Machine Learning", "Ancient Rome", "Quantum Physics")
- Suggested example topics for inspiration
- Shows demo limitations (10 messages, 5 trails, no persistence)

### 3. API Creates Temporary Expedition
- POST to `/api/demo/create-expedition`
- Creates expedition marked as `is_anonymous = true`
- Creates base camp trail
- Returns expedition ID

### 4. Redirect to Demo Expedition
- User is taken to `/demo/expedition/[new-id]`
- Full expedition interface with demo limitations
- Can chat, generate trails, view map
- Progress not saved (resets on refresh)

### 5. Automatic Cleanup
- After 30 days, the cron job deletes these expeditions
- Keeps database clean

## 📁 Files Created

### New Pages
- `app/demo/create/page.tsx` - Demo creation form
- `app/demo/expedition/[id]/page.tsx` - Demo expedition viewer (updated)

### New API
- `app/api/demo/create-expedition/route.ts` - Creates temporary expeditions

### Migrations
- `supabase/migrations/add_anonymous_expeditions_cleanup.sql` - Adds is_anonymous columns
- `supabase/migrations/create_anonymous_user.sql` - Creates demo user (optional)

### Updated
- `app/page.tsx` - "Try Demo" → `/demo/create`
- `app/explore/page.tsx` - Banner → "Create Demo Expedition"

## 🔧 Setup Required

### 1. Run Migrations

In Supabase SQL Editor:

```sql
-- 1. Add anonymous expedition columns
-- Run: add_anonymous_expeditions_cleanup.sql

-- 2. (Optional) Create anonymous user
-- Run: create_anonymous_user.sql
-- OR just use user_id: null in the API
```

### 2. Update RLS Policies

Make sure anonymous users can create expeditions:

```sql
-- Allow anonymous expedition creation
CREATE POLICY "Allow anonymous expedition creation" ON expeditions
  FOR INSERT
  WITH CHECK (is_anonymous = true);

-- Allow anonymous trail creation
CREATE POLICY "Allow anonymous trail creation" ON trails
  FOR INSERT
  WITH CHECK (
    expedition_id IN (
      SELECT id FROM expeditions WHERE is_anonymous = true
    )
  );
```

### 3. Test It!

1. Go to `http://localhost:3000`
2. Click "Try Interactive Demo"
3. Enter a topic (e.g., "Photosynthesis")
4. Click "Start Exploring"
5. You should be redirected to your new demo expedition!

## 🎨 Features

### Demo Creation Page
- ✅ Clean, beautiful UI
- ✅ Example topic suggestions
- ✅ Shows demo limitations upfront
- ✅ Loading state during creation
- ✅ Error handling

### Demo Limitations
- 10 AI messages max
- 5 trail generations max
- No persistence (resets on refresh)
- No Quiz, Journal, or other auth features
- "Sign Up" prompts for restricted actions

## 🔄 Alternative: Explore Page

Users can still:
1. Go to `/explore`
2. Browse public expeditions
3. Click "Try Demo Mode" on any expedition
4. Explore someone else's expedition in demo mode

## 📊 Monitoring

Track demo usage:

```sql
-- Count demo expeditions created today
SELECT COUNT(*) 
FROM expeditions 
WHERE is_anonymous = true 
  AND anonymous_created_at > NOW() - INTERVAL '24 hours';

-- Most popular demo topics
SELECT title, COUNT(*) as count
FROM expeditions
WHERE is_anonymous = true
GROUP BY title
ORDER BY count DESC
LIMIT 10;
```

## 🎯 Next Steps

1. Run the migrations
2. Test the flow
3. Optionally customize the demo creation page
4. Monitor usage and adjust limits as needed

The demo creation flow is now complete! 🎉
