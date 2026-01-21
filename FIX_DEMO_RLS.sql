-- Quick fix: Allow anonymous users to create expeditions
-- Run this in Supabase SQL Editor if you're getting "Failed to create expedition" error

-- 1. Allow INSERT for anonymous users (temporary, for demo)
CREATE POLICY "Allow demo expedition creation" ON public.expeditions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Allow INSERT for trails (for demo expeditions)
CREATE POLICY "Allow demo trail creation" ON public.trails
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. Allow SELECT for demo expeditions
CREATE POLICY "Allow demo expedition read" ON public.expeditions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Allow SELECT for demo trails
CREATE POLICY "Allow demo trail read" ON public.trails
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Note: These are permissive policies for demo purposes
-- In production, you'd want to restrict these more carefully
-- For example, only allow if is_anonymous = true, etc.
