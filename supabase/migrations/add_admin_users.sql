-- Admin users table
-- Migration: add_admin_users.sql

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' NOT NULL CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT[] DEFAULT '{}', -- Array of permission strings
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_users (only admins can view/manage other admins)
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = true
    )
  );

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

-- Insert initial admin user (replace with your actual user ID)
-- You'll need to run this manually with your user ID:
-- INSERT INTO admin_users (user_id, role, created_by) 
-- VALUES ('your-user-id-here', 'super_admin', 'your-user-id-here');

COMMENT ON TABLE admin_users IS 'Stores admin users and their roles/permissions';
COMMENT ON FUNCTION is_admin(UUID) IS 'Check if a user is an active admin';
COMMENT ON FUNCTION has_admin_role(VARCHAR, UUID) IS 'Check if a user has a specific admin role';
COMMENT ON FUNCTION get_admin_user(UUID) IS 'Get admin user details and permissions';