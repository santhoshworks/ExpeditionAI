-- ============================================
-- FLASHCARD SPACED REPETITION SYSTEM (FSRS)
-- Migration to add persistent flashcards with intelligent scheduling
-- Based on FSRS v4 algorithm: https://github.com/open-spaced-repetition/fsrs4anki
-- ============================================

-- ============================================
-- FLASHCARD DECKS
-- Groups of flashcards organized by expedition/trail
-- ============================================
CREATE TABLE public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expedition_id UUID REFERENCES public.expeditions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  card_count INTEGER DEFAULT 0,
  new_cards_per_day INTEGER DEFAULT 20,
  reviews_per_day INTEGER DEFAULT 200,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flashcard_decks_user_id ON public.flashcard_decks(user_id);
CREATE INDEX idx_flashcard_decks_expedition_id ON public.flashcard_decks(expedition_id);

-- RLS
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own flashcard decks" ON public.flashcard_decks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FLASHCARDS
-- Individual cards with FSRS scheduling parameters
-- ============================================
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Card content
  front TEXT NOT NULL,                    -- Question/prompt
  back TEXT NOT NULL,                     -- Answer/explanation
  source_trail_id UUID REFERENCES public.trails(id) ON DELETE SET NULL,
  source_trail_title TEXT,
  source_type TEXT CHECK (source_type IN ('concept', 'question', 'cloze', 'image_occlusion')),
  importance INTEGER DEFAULT 3 CHECK (importance >= 1 AND importance <= 5),

  -- FSRS Memory State
  stability FLOAT DEFAULT 0,              -- S: Days until 90% retrievability
  difficulty FLOAT DEFAULT 5.0,           -- D: Card difficulty (1-10 scale)
  elapsed_days INTEGER DEFAULT 0,         -- Days since last review
  scheduled_days INTEGER DEFAULT 0,       -- Days until next review (interval)
  reps INTEGER DEFAULT 0,                 -- Total number of reviews
  lapses INTEGER DEFAULT 0,               -- Times forgotten (rating = Again)
  state TEXT DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning')),

  -- Scheduling
  due_date TIMESTAMPTZ DEFAULT NOW(),     -- When card is due for review
  last_review_date TIMESTAMPTZ,           -- When card was last reviewed

  -- Metadata
  is_suspended BOOLEAN DEFAULT FALSE,     -- Temporarily remove from review
  is_buried BOOLEAN DEFAULT FALSE,        -- Hidden until next day
  tags TEXT[],                            -- For filtering/organizing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX idx_flashcards_due_date ON public.flashcards(due_date);
CREATE INDEX idx_flashcards_state ON public.flashcards(state);
CREATE INDEX idx_flashcards_source_trail ON public.flashcards(source_trail_id);
CREATE INDEX idx_flashcards_due_not_suspended ON public.flashcards(user_id, due_date)
  WHERE is_suspended = FALSE AND is_buried = FALSE;

-- RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own flashcards" ON public.flashcards
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FLASHCARD REVIEWS
-- History of all reviews for analytics and algorithm tuning
-- ============================================
CREATE TABLE public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Review input
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),  -- 1=Again, 2=Hard, 3=Good, 4=Easy

  -- State before review
  state_before TEXT NOT NULL,
  stability_before FLOAT,
  difficulty_before FLOAT,
  elapsed_days INTEGER,

  -- State after review (computed by FSRS)
  state_after TEXT NOT NULL,
  stability_after FLOAT NOT NULL,
  difficulty_after FLOAT NOT NULL,
  scheduled_days INTEGER NOT NULL,        -- New interval

  -- Timing
  review_duration_ms INTEGER,             -- How long user spent on card
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_flashcard_reviews_flashcard_id ON public.flashcard_reviews(flashcard_id);
CREATE INDEX idx_flashcard_reviews_user_id ON public.flashcard_reviews(user_id);
CREATE INDEX idx_flashcard_reviews_reviewed_at ON public.flashcard_reviews(reviewed_at);

-- RLS
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own flashcard reviews" ON public.flashcard_reviews
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- USER SRS SETTINGS
-- Per-user FSRS configuration and preferences
-- ============================================
CREATE TABLE public.user_srs_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- FSRS Parameters (v4 defaults)
  -- Can be personalized via optimizer later
  fsrs_parameters FLOAT[] DEFAULT ARRAY[
    0.4, 0.6, 2.4, 5.8,           -- w0-w3: Initial stability for each rating
    4.93, 0.94, 0.86, 0.01,       -- w4-w7: Difficulty parameters
    1.49, 0.14, 0.94, 2.18,       -- w8-w11: Recall stability params
    0.05, 0.34, 1.26, 0.29, 2.61  -- w12-w16: Forget stability params
  ],

  -- Retention target (default 90%)
  desired_retention FLOAT DEFAULT 0.9 CHECK (desired_retention >= 0.7 AND desired_retention <= 0.99),

  -- Study limits
  max_new_cards_per_day INTEGER DEFAULT 20,
  max_reviews_per_day INTEGER DEFAULT 200,

  -- Catch-up settings
  vacation_mode BOOLEAN DEFAULT FALSE,
  vacation_start_date TIMESTAMPTZ,
  catch_up_enabled BOOLEAN DEFAULT TRUE,
  catch_up_days INTEGER DEFAULT 7,        -- Spread overdue cards over N days

  -- Learning steps (in minutes)
  learning_steps INTEGER[] DEFAULT ARRAY[1, 10],
  relearning_steps INTEGER[] DEFAULT ARRAY[10],

  -- UI preferences
  show_review_time BOOLEAN DEFAULT TRUE,
  show_next_review_date BOOLEAN DEFAULT TRUE,
  auto_advance BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_srs_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own SRS settings" ON public.user_srs_settings
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- STUDY SESSIONS
-- Track daily study activity
-- ============================================
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES public.flashcard_decks(id) ON DELETE SET NULL,

  -- Session stats
  cards_studied INTEGER DEFAULT 0,
  new_cards INTEGER DEFAULT 0,
  review_cards INTEGER DEFAULT 0,
  again_count INTEGER DEFAULT 0,          -- Rating 1
  hard_count INTEGER DEFAULT 0,           -- Rating 2
  good_count INTEGER DEFAULT 0,           -- Rating 3
  easy_count INTEGER DEFAULT 0,           -- Rating 4

  -- Timing
  total_time_ms INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_started_at ON public.study_sessions(started_at);

-- RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own study sessions" ON public.study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get due cards count for a user
CREATE OR REPLACE FUNCTION get_due_cards_count(p_user_id UUID)
RETURNS TABLE (
  total_due BIGINT,
  new_count BIGINT,
  learning_count BIGINT,
  review_count BIGINT,
  overdue_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE due_date <= NOW()) as total_due,
    COUNT(*) FILTER (WHERE state = 'new') as new_count,
    COUNT(*) FILTER (WHERE state IN ('learning', 'relearning') AND due_date <= NOW()) as learning_count,
    COUNT(*) FILTER (WHERE state = 'review' AND due_date <= NOW() AND due_date > NOW() - INTERVAL '1 day') as review_count,
    COUNT(*) FILTER (WHERE state = 'review' AND due_date < NOW() - INTERVAL '1 day') as overdue_count
  FROM public.flashcards
  WHERE user_id = p_user_id
    AND is_suspended = FALSE
    AND is_buried = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get next review cards with smart catch-up
CREATE OR REPLACE FUNCTION get_review_queue(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF public.flashcards AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.flashcards
  WHERE user_id = p_user_id
    AND is_suspended = FALSE
    AND is_buried = FALSE
    AND due_date <= NOW()
  ORDER BY
    -- Priority: Learning > Relearning > Overdue Review > New
    CASE state
      WHEN 'learning' THEN 1
      WHEN 'relearning' THEN 2
      WHEN 'review' THEN 3
      WHEN 'new' THEN 4
    END,
    -- Within review cards, prioritize most overdue
    due_date ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update deck card count trigger
CREATE OR REPLACE FUNCTION update_deck_card_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.flashcard_decks
    SET card_count = card_count + 1, updated_at = NOW()
    WHERE id = NEW.deck_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.flashcard_decks
    SET card_count = card_count - 1, updated_at = NOW()
    WHERE id = OLD.deck_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deck_count_on_card_change
  AFTER INSERT OR DELETE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION update_deck_card_count();

-- Triggers for updated_at
CREATE TRIGGER update_flashcard_decks_updated_at
  BEFORE UPDATE ON public.flashcard_decks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_srs_settings_updated_at
  BEFORE UPDATE ON public.user_srs_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- User's flashcard statistics
CREATE VIEW public.user_flashcard_stats AS
SELECT
  f.user_id,
  COUNT(*) as total_cards,
  COUNT(*) FILTER (WHERE state = 'new') as new_cards,
  COUNT(*) FILTER (WHERE state = 'learning') as learning_cards,
  COUNT(*) FILTER (WHERE state = 'review') as review_cards,
  COUNT(*) FILTER (WHERE state = 'relearning') as relearning_cards,
  COUNT(*) FILTER (WHERE due_date <= NOW() AND is_suspended = FALSE) as due_today,
  AVG(stability) as avg_stability,
  AVG(difficulty) as avg_difficulty,
  SUM(reps) as total_reviews
FROM public.flashcards f
GROUP BY f.user_id;

-- Daily review forecast (next 30 days)
CREATE OR REPLACE FUNCTION get_review_forecast(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  forecast_date DATE,
  due_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(due_date) as forecast_date,
    COUNT(*) as due_count
  FROM public.flashcards
  WHERE user_id = p_user_id
    AND is_suspended = FALSE
    AND due_date > NOW()
    AND due_date <= NOW() + (p_days || ' days')::INTERVAL
  GROUP BY DATE(due_date)
  ORDER BY forecast_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
