-- Admin functions for debugging
-- Run this in Supabase SQL Editor if functions are missing

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = p_user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION has_admin_role(p_role VARCHAR, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = p_user_id AND role = p_role AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin user details
CREATE OR REPLACE FUNCTION get_admin_user(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  user_id UUID,
  role VARCHAR,
  permissions TEXT[],
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT au.user_id, au.role, au.permissions, au.is_active
  FROM admin_users au
  WHERE au.user_id = p_user_id AND au.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function (replace with your user ID)
-- SELECT is_admin('your-user-id-here');