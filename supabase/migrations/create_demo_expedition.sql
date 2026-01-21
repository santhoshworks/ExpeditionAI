-- Create a demo expedition for anonymous users to try
-- This should be run manually in Supabase SQL Editor

-- First, create a demo user (or use an existing admin user ID)
-- Replace 'YOUR_ADMIN_USER_ID' with an actual user ID from your profiles table

DO $$
DECLARE
  demo_expedition_id UUID;
  base_camp_id UUID;
BEGIN
  -- Create demo expedition
  INSERT INTO public.expeditions (
    user_id,
    title,
    description,
    is_public,
    public_slug,
    public_description
  ) VALUES (
    'YOUR_ADMIN_USER_ID', -- Replace with actual user ID
    'Introduction to Machine Learning',
    'A comprehensive guide to understanding machine learning fundamentals, algorithms, and applications.',
    true,
    'demo-machine-learning',
    'Try ExpeditionAI with this interactive demo on Machine Learning. Explore concepts, ask questions, and see how visual learning works!'
  ) RETURNING id INTO demo_expedition_id;

  -- Create base camp trail
  INSERT INTO public.trails (
    expedition_id,
    title,
    is_base_camp,
    position
  ) VALUES (
    demo_expedition_id,
    'Introduction to Machine Learning',
    true,
    1
  ) RETURNING id INTO base_camp_id;

  -- Add some initial trails
  INSERT INTO public.trails (expedition_id, parent_trail_id, title, source_text, is_base_camp, position) VALUES
  (demo_expedition_id, base_camp_id, 'What is Machine Learning?', 'Understanding the basics of ML and how computers learn from data', false, 2),
  (demo_expedition_id, base_camp_id, 'Supervised Learning', 'Learning with labeled data to make predictions', false, 3),
  (demo_expedition_id, base_camp_id, 'Unsupervised Learning', 'Finding patterns in unlabeled data', false, 4),
  (demo_expedition_id, base_camp_id, 'Neural Networks', 'Understanding artificial neural networks and deep learning', false, 5);

  -- Output the expedition ID for reference
  RAISE NOTICE 'Demo expedition created with ID: %', demo_expedition_id;
END $$;

-- Query to get the demo expedition ID
SELECT id, title, public_slug FROM public.expeditions WHERE public_slug = 'demo-machine-learning';
