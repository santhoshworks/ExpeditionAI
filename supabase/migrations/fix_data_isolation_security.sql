-- Fix critical data isolation vulnerability
-- Views in PostgreSQL cannot have RLS enabled directly
-- The fix is implemented in client-side queries with proper user filtering
-- This migration ensures all base tables have proper RLS policies

-- ============================================
-- VERIFY BASE TABLE RLS POLICIES
-- ============================================

-- Ensure expeditions table has proper RLS (should already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'expeditions' 
    AND policyname = 'Users can CRUD own expeditions'
  ) THEN
    CREATE POLICY "Users can CRUD own expeditions" ON public.expeditions
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure trails table has proper RLS (should already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trails' 
    AND policyname = 'Users can CRUD trails in own expeditions'
  ) THEN
    CREATE POLICY "Users can CRUD trails in own expeditions" ON public.trails
      FOR ALL USING (
        expedition_id IN (
          SELECT id FROM public.expeditions WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================
-- ENSURE LEARNING WISHLIST HAS PROPER RLS
-- ============================================

-- Ensure learning_wishlist has proper RLS (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_wishlist') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.learning_wishlist ENABLE ROW LEVEL SECURITY;
    
    -- Add policy if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'learning_wishlist' 
      AND policyname = 'Users can CRUD own wishlist items'
    ) THEN
      CREATE POLICY "Users can CRUD own wishlist items" ON public.learning_wishlist
        FOR ALL USING (user_id = auth.uid());
    END IF;
  END IF;
END $$;

-- ============================================
-- SECURITY AUDIT FUNCTION
-- ============================================

-- Create a function to audit data isolation
CREATE OR REPLACE FUNCTION public.audit_data_isolation()
RETURNS TABLE (
  table_name TEXT,
  has_rls BOOLEAN,
  policy_count INTEGER,
  user_id_column_exists BOOLEAN,
  table_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity,
    COALESCE(p.policy_count, 0)::INTEGER,
    EXISTS(
      SELECT 1 FROM information_schema.columns c 
      WHERE c.table_name = t.tablename 
      AND c.column_name = 'user_id'
    ) as user_id_column_exists,
    'table'::TEXT as table_type
  FROM pg_tables t
  LEFT JOIN (
    SELECT tablename, COUNT(*) as policy_count
    FROM pg_policies 
    GROUP BY tablename
  ) p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
  AND t.tablename IN ('expeditions', 'trails', 'messages', 'journals', 'learning_wishlist', 'profiles', 'user_credits')
  
  UNION ALL
  
  SELECT 
    v.viewname::TEXT,
    false as rowsecurity, -- Views cannot have RLS
    0 as policy_count,
    EXISTS(
      SELECT 1 FROM information_schema.columns c 
      WHERE c.table_name = v.viewname 
      AND c.column_name = 'user_id'
    ) as user_id_column_exists,
    'view'::TEXT as table_type
  FROM pg_views v
  WHERE v.schemaname = 'public'
  AND v.viewname IN ('expeditions_with_stats', 'trails_with_counts')
  
  ORDER BY table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the audit (results will show in migration logs)
SELECT * FROM public.audit_data_isolation();

-- ============================================
-- SECURITY NOTES
-- ============================================

-- IMPORTANT: Views cannot have RLS in PostgreSQL
-- Security is enforced through:
-- 1. Client-side user filtering in queries (lib/queries.ts)
-- 2. RLS policies on underlying base tables
-- 3. API route authorization checks
-- 
-- Views affected:
-- - expeditions_with_stats: Now filtered by user_id in useExpeditions()
-- - trails_with_counts: Protected by expedition ownership via RLS
--
-- Client-side fixes implemented:
-- - useExpeditions(): Added user_id filter
-- - useLearningWishlist(): Added user_id filter  
-- - useTrails(): Added authentication check