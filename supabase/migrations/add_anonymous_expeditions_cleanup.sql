-- Add support for anonymous/demo expeditions with auto-cleanup

-- Add column to track anonymous expeditions
ALTER TABLE public.expeditions 
ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE,
ADD COLUMN anonymous_created_at TIMESTAMPTZ;

-- Create index for efficient cleanup queries
CREATE INDEX idx_expeditions_anonymous_cleanup 
ON public.expeditions(anonymous_created_at) 
WHERE is_anonymous = TRUE AND anonymous_created_at IS NOT NULL;

-- Function to mark expedition as anonymous (for demo mode)
CREATE OR REPLACE FUNCTION mark_expedition_anonymous(expedition_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.expeditions 
  SET 
    is_anonymous = TRUE,
    anonymous_created_at = NOW()
  WHERE id = expedition_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old anonymous expeditions (30 days)
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_expeditions()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  deletion_count INTEGER;
BEGIN
  -- Delete expeditions older than 30 days
  WITH deleted AS (
    DELETE FROM public.expeditions
    WHERE 
      is_anonymous = TRUE 
      AND anonymous_created_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO deletion_count FROM deleted;
  
  RETURN QUERY SELECT deletion_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job using pg_cron (if available) or manual trigger
-- Note: pg_cron needs to be enabled in Supabase dashboard
-- This is a placeholder - actual scheduling should be done via Supabase dashboard or cron job

-- Alternative: Create a function that can be called via Edge Function or API
CREATE OR REPLACE FUNCTION schedule_anonymous_cleanup()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  deleted INTEGER;
BEGIN
  SELECT * INTO deleted FROM cleanup_old_anonymous_expeditions();
  
  result := jsonb_build_object(
    'success', true,
    'deleted_expeditions', deleted,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_expedition_anonymous(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_old_anonymous_expeditions() TO authenticated;
GRANT EXECUTE ON FUNCTION schedule_anonymous_cleanup() TO authenticated;

-- Add comment for documentation
COMMENT ON COLUMN public.expeditions.is_anonymous IS 'Marks expeditions created in demo mode for automatic cleanup';
COMMENT ON COLUMN public.expeditions.anonymous_created_at IS 'Timestamp when anonymous expedition was created, used for cleanup after 30 days';
COMMENT ON FUNCTION cleanup_old_anonymous_expeditions() IS 'Deletes anonymous expeditions older than 30 days. Should be run daily via cron job.';
