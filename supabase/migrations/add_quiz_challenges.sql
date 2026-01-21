-- Create quiz challenges table
CREATE TABLE IF NOT EXISTS quiz_challenges (
  id TEXT PRIMARY KEY,
  expedition_id UUID NOT NULL REFERENCES expeditions(id) ON DELETE CASCADE,
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenger_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_quiz_challenges_expedition_id ON quiz_challenges(expedition_id);
CREATE INDEX idx_quiz_challenges_challenger_id ON quiz_challenges(challenger_id);
CREATE INDEX idx_quiz_challenges_created_at ON quiz_challenges(created_at DESC);

-- Add RLS policies
ALTER TABLE quiz_challenges ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view challenges for public expeditions
CREATE POLICY "Public challenges are viewable by everyone" ON quiz_challenges
  FOR SELECT USING (
    expedition_id IN (
      SELECT id FROM expeditions WHERE is_public = TRUE
    )
  );

-- Policy: Users can create challenges for expeditions they have access to
CREATE POLICY "Users can create challenges for accessible expeditions" ON quiz_challenges
  FOR INSERT WITH CHECK (
    expedition_id IN (
      SELECT id FROM expeditions 
      WHERE user_id = auth.uid() OR is_public = TRUE
    )
  );

-- Policy: Users can view their own challenges
CREATE POLICY "Users can view their own challenges" ON quiz_challenges
  FOR SELECT USING (challenger_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_quiz_challenges_updated_at
  BEFORE UPDATE ON quiz_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();