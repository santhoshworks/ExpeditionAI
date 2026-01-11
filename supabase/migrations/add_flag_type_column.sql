-- Update existing flagged trails to use 'priority' as default for any that are still null
UPDATE public.trails 
SET flag_type = 'priority' 
WHERE is_flagged = true AND (flag_type IS NULL OR flag_type = '');

-- Set default flag_type for unflagged trails
UPDATE public.trails 
SET flag_type = 'not_explored' 
WHERE flag_type IS NULL OR flag_type = '';