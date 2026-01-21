-- Quick setup: Use any existing expedition as demo
-- Run this in Supabase SQL Editor

-- Option 1: Find an existing public expedition
SELECT id, title, is_public, public_slug 
FROM expeditions 
WHERE is_public = true 
LIMIT 1;

-- If no public expeditions exist, make one of your expeditions public:
-- Replace 'YOUR_EXPEDITION_ID' with an actual expedition ID from your account

UPDATE expeditions 
SET 
  is_public = true,
  public_slug = 'demo-expedition',
  public_description = 'Try ExpeditionAI with this interactive demo. Explore, chat, and see how visual learning works!'
WHERE id = 'YOUR_EXPEDITION_ID';

-- Then get the ID:
SELECT id FROM expeditions WHERE public_slug = 'demo-expedition';
