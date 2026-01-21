-- Add public sharing functionality to expeditions
ALTER TABLE public.expeditions 
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN public_slug TEXT UNIQUE,
ADD COLUMN public_description TEXT,
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN last_viewed_at TIMESTAMPTZ;

-- Create index for public expeditions
CREATE INDEX idx_expeditions_public ON public.expeditions(is_public, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX idx_expeditions_slug ON public.expeditions(public_slug) WHERE public_slug IS NOT NULL;

-- Create public view policy
CREATE POLICY "Public expeditions are viewable by everyone" ON public.expeditions
  FOR SELECT USING (is_public = TRUE);

-- Create public trails policy
CREATE POLICY "Public trails are viewable by everyone" ON public.trails
  FOR SELECT USING (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE is_public = TRUE
    )
  );

-- Create public messages policy
CREATE POLICY "Public messages are viewable by everyone" ON public.messages
  FOR SELECT USING (
    trail_id IN (
      SELECT t.id FROM public.trails t
      JOIN public.expeditions e ON t.expedition_id = e.id
      WHERE e.is_public = TRUE
    )
  );

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_expedition_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure it's not empty
  IF base_slug = '' THEN
    base_slug := 'expedition';
  END IF;
  
  -- Check for uniqueness
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.expeditions WHERE public_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_expedition_views(expedition_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.expeditions 
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = NOW()
  WHERE public_slug = expedition_slug AND is_public = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;