-- Migration: Add learner context to expeditions
-- Adds learning_purpose and learner_level columns for personalized coaching

-- Add learning_purpose column
-- Values: 'interview' | 'exam' | 'research' | 'work' | 'curiosity' | 'teaching' | 'building' | NULL
ALTER TABLE public.expeditions
ADD COLUMN IF NOT EXISTS learning_purpose TEXT;

-- Add learner_level column
-- Values: 'beginner' | 'familiar' | 'intermediate' | 'advanced' | NULL
ALTER TABLE public.expeditions
ADD COLUMN IF NOT EXISTS learner_level TEXT;

-- Add check constraints to ensure valid values
ALTER TABLE public.expeditions
ADD CONSTRAINT valid_learning_purpose
CHECK (learning_purpose IS NULL OR learning_purpose IN (
  'interview',
  'exam',
  'research',
  'work',
  'curiosity',
  'teaching',
  'building'
));

ALTER TABLE public.expeditions
ADD CONSTRAINT valid_learner_level
CHECK (learner_level IS NULL OR learner_level IN (
  'beginner',
  'familiar',
  'intermediate',
  'advanced'
));

-- Add index for potential filtering by learning context
CREATE INDEX IF NOT EXISTS idx_expeditions_learning_purpose
ON public.expeditions(learning_purpose)
WHERE learning_purpose IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expeditions_learner_level
ON public.expeditions(learner_level)
WHERE learner_level IS NOT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN public.expeditions.learning_purpose IS 'The learner''s goal: interview prep, exam study, research, work application, personal curiosity, teaching others, or building something';
COMMENT ON COLUMN public.expeditions.learner_level IS 'The learner''s current proficiency level: beginner (no prior knowledge), familiar (knows basics), intermediate (solid foundation), advanced (expert level)';
