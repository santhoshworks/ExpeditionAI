-- Create learning_wishlist table
CREATE TABLE learning_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., "Technology", "Science", "Arts", etc.
  priority INTEGER DEFAULT 3, -- 1 (high) to 5 (low)
  source_url TEXT, -- Optional link to resource
  estimated_time TEXT, -- e.g., "2 hours", "1 week"
  tags TEXT[], -- Array of tags for better organization
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expedition_id UUID REFERENCES expeditions(id) ON DELETE SET NULL, -- Link to expedition if converted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE learning_wishlist ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wishlist items
CREATE POLICY "Users can view own wishlist items" ON learning_wishlist
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items" ON learning_wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own wishlist items
CREATE POLICY "Users can update own wishlist items" ON learning_wishlist
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items" ON learning_wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_learning_wishlist_updated_at
    BEFORE UPDATE ON learning_wishlist
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_learning_wishlist_user_id ON learning_wishlist(user_id);
CREATE INDEX idx_learning_wishlist_priority ON learning_wishlist(priority);
CREATE INDEX idx_learning_wishlist_category ON learning_wishlist(category);