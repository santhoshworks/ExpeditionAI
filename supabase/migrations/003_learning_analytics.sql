-- Learning Analytics: Streak tracking, activity metrics, and insights
-- Migration: 003_learning_analytics.sql

-- Create user_learning_streaks table
CREATE TABLE IF NOT EXISTS user_learning_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,
  streak_start_date DATE,
  total_active_days INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create daily_learning_activity table
CREATE TABLE IF NOT EXISTS daily_learning_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  trail_count INTEGER DEFAULT 0 NOT NULL,
  expedition_count INTEGER DEFAULT 0 NOT NULL,
  total_tokens INTEGER DEFAULT 0 NOT NULL,
  estimated_minutes INTEGER DEFAULT 0 NOT NULL,
  topics_explored TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, activity_date)
);

-- Create indexes for performance
CREATE INDEX idx_user_learning_streaks_user_id ON user_learning_streaks(user_id);
CREATE INDEX idx_daily_learning_activity_user_id ON daily_learning_activity(user_id);
CREATE INDEX idx_daily_learning_activity_date ON daily_learning_activity(activity_date DESC);
CREATE INDEX idx_daily_learning_activity_user_date ON daily_learning_activity(user_id, activity_date DESC);

-- Enable RLS
ALTER TABLE user_learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_learning_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_learning_streaks
CREATE POLICY "Users can view their own streaks"
  ON user_learning_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON user_learning_streaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON user_learning_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for daily_learning_activity
CREATE POLICY "Users can view their own activity"
  ON daily_learning_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON daily_learning_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
  ON daily_learning_activity FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update streak on activity
CREATE OR REPLACE FUNCTION update_learning_streak(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_activity DATE;
  v_streak_start DATE;
  v_total_days INTEGER;
BEGIN
  -- Get current streak data
  SELECT current_streak, longest_streak, last_activity_date, streak_start_date, total_active_days
  INTO v_current_streak, v_longest_streak, v_last_activity, v_streak_start, v_total_days
  FROM user_learning_streaks
  WHERE user_id = p_user_id;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_learning_streaks (user_id, current_streak, longest_streak, last_activity_date, streak_start_date, total_active_days)
    VALUES (p_user_id, 1, 1, v_today, v_today, 1);

    RETURN jsonb_build_object(
      'current_streak', 1,
      'longest_streak', 1,
      'is_new_day', true
    );
  END IF;

  -- Already logged today, no update needed
  IF v_last_activity = v_today THEN
    RETURN jsonb_build_object(
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'is_new_day', false
    );
  END IF;

  -- Continue streak (yesterday was last activity)
  IF v_last_activity = v_yesterday THEN
    v_current_streak := v_current_streak + 1;
    v_total_days := v_total_days + 1;

    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
  -- Break streak (missed a day)
  ELSE
    v_current_streak := 1;
    v_streak_start := v_today;
    v_total_days := v_total_days + 1;
  END IF;

  UPDATE user_learning_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_activity_date = v_today,
      streak_start_date = v_streak_start,
      total_active_days = v_total_days,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'is_new_day', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record daily activity
CREATE OR REPLACE FUNCTION record_daily_activity(
  p_user_id UUID,
  p_messages INTEGER DEFAULT 1,
  p_trails INTEGER DEFAULT 0,
  p_expeditions INTEGER DEFAULT 0,
  p_tokens INTEGER DEFAULT 0,
  p_topic TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_estimated_minutes INTEGER;
BEGIN
  -- Estimate reading/learning time: ~100 tokens per minute
  v_estimated_minutes := GREATEST(1, p_tokens / 100);

  INSERT INTO daily_learning_activity (
    user_id, activity_date, message_count, trail_count, expedition_count,
    total_tokens, estimated_minutes, topics_explored
  )
  VALUES (
    p_user_id, v_today, p_messages, p_trails, p_expeditions,
    p_tokens, v_estimated_minutes,
    CASE WHEN p_topic IS NOT NULL THEN ARRAY[p_topic] ELSE '{}' END
  )
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    message_count = daily_learning_activity.message_count + p_messages,
    trail_count = daily_learning_activity.trail_count + p_trails,
    expedition_count = daily_learning_activity.expedition_count + p_expeditions,
    total_tokens = daily_learning_activity.total_tokens + p_tokens,
    estimated_minutes = daily_learning_activity.estimated_minutes + v_estimated_minutes,
    topics_explored = CASE
      WHEN p_topic IS NOT NULL AND NOT (p_topic = ANY(daily_learning_activity.topics_explored))
      THEN array_append(daily_learning_activity.topics_explored, p_topic)
      ELSE daily_learning_activity.topics_explored
    END,
    updated_at = NOW();

  -- Also update streak
  PERFORM update_learning_streak(p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_streak_data RECORD;
  v_total_messages INTEGER;
  v_total_trails INTEGER;
  v_total_expeditions INTEGER;
  v_total_tokens INTEGER;
  v_total_minutes INTEGER;
  v_unique_topics TEXT[];
  v_last_7_days JSONB;
  v_activity_by_hour JSONB;
BEGIN
  -- Get streak data
  SELECT current_streak, longest_streak, total_active_days, streak_start_date
  INTO v_streak_data
  FROM user_learning_streaks
  WHERE user_id = p_user_id;

  -- Get totals from daily activity
  SELECT
    COALESCE(SUM(message_count), 0),
    COALESCE(SUM(trail_count), 0),
    COALESCE(SUM(expedition_count), 0),
    COALESCE(SUM(total_tokens), 0),
    COALESCE(SUM(estimated_minutes), 0)
  INTO v_total_messages, v_total_trails, v_total_expeditions, v_total_tokens, v_total_minutes
  FROM daily_learning_activity
  WHERE user_id = p_user_id;

  -- Get unique topics
  SELECT ARRAY(
    SELECT DISTINCT unnest(topics_explored)
    FROM daily_learning_activity
    WHERE user_id = p_user_id
  ) INTO v_unique_topics;

  -- Get last 7 days activity
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', activity_date,
      'messages', message_count,
      'trails', trail_count,
      'minutes', estimated_minutes
    ) ORDER BY activity_date
  ), '[]'::jsonb)
  INTO v_last_7_days
  FROM daily_learning_activity
  WHERE user_id = p_user_id
    AND activity_date >= CURRENT_DATE - INTERVAL '7 days';

  -- Get activity by hour (from messages table)
  SELECT COALESCE(jsonb_object_agg(hour, count), '{}'::jsonb)
  INTO v_activity_by_hour
  FROM (
    SELECT
      EXTRACT(HOUR FROM m.created_at)::INTEGER as hour,
      COUNT(*) as count
    FROM messages m
    JOIN trails t ON m.trail_id = t.id
    JOIN expeditions e ON t.expedition_id = e.id
    WHERE e.user_id = p_user_id
      AND m.role = 'user'
      AND m.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY EXTRACT(HOUR FROM m.created_at)
  ) hourly;

  RETURN jsonb_build_object(
    'streaks', jsonb_build_object(
      'current', COALESCE(v_streak_data.current_streak, 0),
      'longest', COALESCE(v_streak_data.longest_streak, 0),
      'total_active_days', COALESCE(v_streak_data.total_active_days, 0),
      'streak_start_date', v_streak_data.streak_start_date
    ),
    'totals', jsonb_build_object(
      'messages', v_total_messages,
      'trails', v_total_trails,
      'expeditions', v_total_expeditions,
      'tokens', v_total_tokens,
      'minutes', v_total_minutes,
      'hours', ROUND(v_total_minutes / 60.0, 1)
    ),
    'topics', jsonb_build_object(
      'unique_count', COALESCE(array_length(v_unique_topics, 1), 0),
      'list', COALESCE(v_unique_topics, '{}')
    ),
    'recent_activity', v_last_7_days,
    'activity_by_hour', v_activity_by_hour
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create streak record on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_streaks()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_learning_streaks (user_id, current_streak, longest_streak, total_active_days)
  VALUES (NEW.id, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create streak row on new user
DROP TRIGGER IF EXISTS on_auth_user_created_streaks ON auth.users;
CREATE TRIGGER on_auth_user_created_streaks
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_streaks();

-- Backfill existing users with streak records
INSERT INTO user_learning_streaks (user_id, current_streak, longest_streak, total_active_days)
SELECT id, 0, 0, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_learning_streaks)
ON CONFLICT (user_id) DO NOTHING;
