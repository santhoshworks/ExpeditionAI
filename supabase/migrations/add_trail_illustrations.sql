-- Create trail_illustrations table
CREATE TABLE IF NOT EXISTS trail_illustrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trail_id UUID NOT NULL REFERENCES trails(id) ON DELETE CASCADE,
  illustration_query TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to ensure one illustration per trail
CREATE UNIQUE INDEX IF NOT EXISTS trail_illustrations_trail_id_unique 
ON trail_illustrations(trail_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS trail_illustrations_generated_at_idx 
ON trail_illustrations(generated_at);

-- Add RLS policies
ALTER TABLE trail_illustrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access illustrations for their own trails
CREATE POLICY "Users can access their own trail illustrations" ON trail_illustrations
FOR ALL USING (
  trail_id IN (
    SELECT t.id 
    FROM trails t
    JOIN expeditions e ON t.expedition_id = e.id
    WHERE e.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_trail_illustrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trail_illustrations_updated_at
  BEFORE UPDATE ON trail_illustrations
  FOR EACH ROW
  EXECUTE FUNCTION update_trail_illustrations_updated_at();