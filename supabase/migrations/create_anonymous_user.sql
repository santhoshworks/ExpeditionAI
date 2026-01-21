-- Create anonymous user for demo expeditions
-- This user will own all temporary demo expeditions

-- Insert anonymous user (if not exists)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anonymous@expeditionai.demo',
  '',
  NOW(),
  NOW(),
  NOW(),
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create profile for anonymous user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  default_model,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'anonymous@expeditionai.demo',
  'Demo User',
  'gpt-4o-mini',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create credits for anonymous user (not really used, but for consistency)
INSERT INTO public.user_credits (
  user_id,
  credits,
  tier,
  trails_today,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  0,
  'free',
  0,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Verify
SELECT id, email, full_name FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000000';
