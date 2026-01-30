-- Model pricing configuration
CREATE TABLE IF NOT EXISTS model_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'openai/gpt-4-turbo'
  provider VARCHAR(50) NOT NULL DEFAULT 'openrouter',
  input_cost_per_1k_tokens DECIMAL(10, 4) NOT NULL,
  output_cost_per_1k_tokens DECIMAL(10, 4) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit usage audit trail
CREATE TABLE IF NOT EXISTS credit_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id VARCHAR(255) NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  credits_deducted DECIMAL(10, 4) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  feature VARCHAR(100), -- e.g., 'chat', 'analysis', 'definition'
  request_id VARCHAR(255), -- for tracing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend user_credits table with usage tracking
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS total_credits_issued DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS total_credits_used DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE user_credits ADD COLUMN IF NOT EXISTS last_usage_date TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_user_id ON credit_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_model_id ON credit_usage_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_logs_created_at ON credit_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_pricing_active ON model_pricing(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE model_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for model_pricing (public read)
CREATE POLICY "Everyone can read active model pricing"
  ON model_pricing FOR SELECT
  USING (is_active = true);

-- RLS policy for credit_usage_logs (users see own, admins see all)
CREATE POLICY "Users can view own usage logs"
  ON credit_usage_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usage logs"
  ON credit_usage_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- System can insert usage logs
CREATE POLICY "System can insert usage logs"
  ON credit_usage_logs FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE model_pricing IS 'Stores per-token pricing for each LLM model';
COMMENT ON TABLE credit_usage_logs IS 'Audit trail of all credit usage by users';
