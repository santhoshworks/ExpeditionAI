-- Migration: Add checkout audit logs table for payment compliance and auditing
-- This table tracks all checkout attempts for security, fraud prevention, and compliance purposes

-- Create checkout_audit_logs table
CREATE TABLE IF NOT EXISTS checkout_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    billing_country TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    status TEXT NOT NULL CHECK (status IN ('initiated', 'blocked', 'failed', 'completed', 'error')),
    session_id TEXT,
    amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_checkout_audit_user_id ON checkout_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_audit_email ON checkout_audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_checkout_audit_status ON checkout_audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_checkout_audit_created_at ON checkout_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_checkout_audit_session_id ON checkout_audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_audit_ip_address ON checkout_audit_logs(ip_address);

-- Add comment for documentation
COMMENT ON TABLE checkout_audit_logs IS 'Audit log for all checkout attempts - used for compliance, fraud detection, and debugging';
COMMENT ON COLUMN checkout_audit_logs.status IS 'initiated: checkout started, blocked: prevented (e.g., already subscribed), failed: Dodo API error, completed: webhook confirmed, error: internal error';
COMMENT ON COLUMN checkout_audit_logs.billing_country IS 'ISO 3166-1 alpha-2 country code for tax calculation';

-- Enable Row Level Security
ALTER TABLE checkout_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own audit logs
CREATE POLICY "Users can view own checkout audit logs"
    ON checkout_audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Only service role can insert (API routes use service role)
-- No INSERT policy for regular users - only API can insert
CREATE POLICY "Service role can insert checkout audit logs"
    ON checkout_audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Policy: Admin users can view all audit logs
CREATE POLICY "Admin users can view all checkout audit logs"
    ON checkout_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );
