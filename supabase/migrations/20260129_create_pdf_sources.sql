-- Create pdf_sources table to track PDF uploads and content mapping
CREATE TABLE public.pdf_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  pdf_filename TEXT NOT NULL,
  page_start INTEGER,
  page_end INTEGER,
  section_title TEXT,
  extracted_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups by expedition
CREATE INDEX idx_pdf_sources_expedition_id ON public.pdf_sources(expedition_id);
CREATE INDEX idx_pdf_sources_trail_id ON public.pdf_sources(trail_id);

-- Enable RLS
ALTER TABLE public.pdf_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: users can only see their own expedition's PDFs
CREATE POLICY "Users can view their own PDF sources"
  ON public.pdf_sources FOR SELECT
  USING (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );

-- Create RLS policy: users can only insert into their expeditions
CREATE POLICY "Users can insert PDF sources for their expeditions"
  ON public.pdf_sources FOR INSERT
  WITH CHECK (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );
