-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  default_model TEXT DEFAULT 'anthropic/claude-3.5-sonnet',
  openrouter_api_key TEXT, -- encrypted, for BYOK users
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- EXPEDITIONS (Learning Sessions)
-- ============================================
CREATE TABLE public.expeditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_expeditions_user_id ON public.expeditions(user_id);
CREATE INDEX idx_expeditions_updated_at ON public.expeditions(updated_at DESC);

-- RLS
ALTER TABLE public.expeditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own expeditions" ON public.expeditions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRAILS (Conversation Threads)
-- ============================================
CREATE TABLE public.trails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  parent_trail_id UUID REFERENCES public.trails(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_text TEXT, -- The text that spawned this trail
  is_flagged BOOLEAN DEFAULT FALSE,
  is_base_camp BOOLEAN DEFAULT FALSE, -- True for the root trail
  position INTEGER DEFAULT 0, -- For ordering siblings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trails_expedition_id ON public.trails(expedition_id);
CREATE INDEX idx_trails_parent_id ON public.trails(parent_trail_id);

-- RLS (via expedition ownership)
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD trails in own expeditions" ON public.trails
  FOR ALL USING (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trail_id UUID NOT NULL REFERENCES public.trails(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT, -- Which LLM was used (for assistant messages)
  tokens_used INTEGER, -- Track usage
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_trail_id ON public.messages(trail_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD messages in own trails" ON public.messages
  FOR ALL USING (
    trail_id IN (
      SELECT t.id FROM public.trails t
      JOIN public.expeditions e ON t.expedition_id = e.id
      WHERE e.user_id = auth.uid()
    )
  );

-- ============================================
-- JOURNALS (Generated Summaries)
-- ============================================
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expedition_id UUID NOT NULL REFERENCES public.expeditions(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Markdown content
  trail_ids UUID[], -- Which trails were included
  model TEXT, -- Which model generated it
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD journals in own expeditions" ON public.journals
  FOR ALL USING (
    expedition_id IN (
      SELECT id FROM public.expeditions WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_expeditions_updated_at
  BEFORE UPDATE ON public.expeditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trails_updated_at
  BEFORE UPDATE ON public.trails
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VIEWS (Optional, for convenience)
-- ============================================

-- Trail with message count
CREATE VIEW public.trails_with_counts AS
SELECT
  t.*,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM public.trails t
LEFT JOIN public.messages m ON t.id = m.trail_id
GROUP BY t.id;

-- Expedition with stats
CREATE VIEW public.expeditions_with_stats AS
SELECT
  e.*,
  COUNT(DISTINCT t.id) as trail_count,
  COUNT(DISTINCT m.id) as message_count,
  COUNT(DISTINCT CASE WHEN t.is_flagged THEN t.id END) as flagged_count
FROM public.expeditions e
LEFT JOIN public.trails t ON e.id = t.expedition_id
LEFT JOIN public.messages m ON t.id = m.trail_id
GROUP BY e.id;
