-- Payment tracking tables
-- Migration: add_payment_tracking.sql

-- Create payment_events table to store webhook data
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL, -- 'checkout.session.completed', 'checkout.session.failed', etc.
  payment_id VARCHAR(255), -- External payment ID from Dodo
  session_id VARCHAR(255), -- Checkout session ID
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2), -- Amount in USD
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50), -- 'completed', 'failed', 'pending', 'cancelled'
  payment_method VARCHAR(100), -- 'card', 'paypal', etc.
  tier VARCHAR(20), -- 'basic', 'pro'
  credits INTEGER, -- Credits purchased
  bonus_credits INTEGER DEFAULT 0,
  failure_reason TEXT, -- Reason for failure if applicable
  metadata JSONB, -- Store additional webhook data
  processed_at TIMESTAMPTZ, -- When payment was processed
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_payment_events_user_id ON payment_events(user_id);
CREATE INDEX idx_payment_events_status ON payment_events(status);
CREATE INDEX idx_payment_events_event_type ON payment_events(event_type);
CREATE INDEX idx_payment_events_created_at ON payment_events(created_at DESC);
CREATE INDEX idx_payment_events_payment_id ON payment_events(payment_id);

-- Create payment_analytics table for daily aggregations
CREATE TABLE IF NOT EXISTS payment_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  successful_transactions INTEGER DEFAULT 0,
  failed_transactions INTEGER DEFAULT 0,
  basic_tier_revenue DECIMAL(10, 2) DEFAULT 0,
  pro_tier_revenue DECIMAL(10, 2) DEFAULT 0,
  basic_tier_count INTEGER DEFAULT 0,
  pro_tier_count INTEGER DEFAULT 0,
  average_transaction_value DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(date)
);

-- Create index for date queries
CREATE INDEX idx_payment_analytics_date ON payment_analytics(date DESC);

-- Enable RLS
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_events (admin only)
CREATE POLICY "Admins can view payment events"
  ON payment_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

CREATE POLICY "System can insert payment events"
  ON payment_events FOR INSERT
  WITH CHECK (true); -- Allow webhook inserts

-- RLS policies for payment_analytics (admin only)
CREATE POLICY "Admins can view payment analytics"
  ON payment_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au 
      WHERE au.user_id = auth.uid() AND au.is_active = true
    )
  );

-- Function to update daily payment analytics
CREATE OR REPLACE FUNCTION update_payment_analytics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  v_total_revenue DECIMAL(10, 2);
  v_total_transactions INTEGER;
  v_successful_transactions INTEGER;
  v_failed_transactions INTEGER;
  v_basic_revenue DECIMAL(10, 2);
  v_pro_revenue DECIMAL(10, 2);
  v_basic_count INTEGER;
  v_pro_count INTEGER;
  v_avg_transaction DECIMAL(10, 2);
BEGIN
  -- Calculate metrics for the date
  SELECT 
    COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0),
    COUNT(*),
    COUNT(CASE WHEN status = 'completed' THEN 1 END),
    COUNT(CASE WHEN status = 'failed' THEN 1 END),
    COALESCE(SUM(CASE WHEN status = 'completed' AND tier = 'basic' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN status = 'completed' AND tier = 'pro' THEN amount ELSE 0 END), 0),
    COUNT(CASE WHEN status = 'completed' AND tier = 'basic' THEN 1 END),
    COUNT(CASE WHEN status = 'completed' AND tier = 'pro' THEN 1 END)
  INTO 
    v_total_revenue,
    v_total_transactions,
    v_successful_transactions,
    v_failed_transactions,
    v_basic_revenue,
    v_pro_revenue,
    v_basic_count,
    v_pro_count
  FROM payment_events
  WHERE DATE(created_at) = p_date;

  -- Calculate average transaction value
  v_avg_transaction := CASE 
    WHEN v_successful_transactions > 0 THEN v_total_revenue / v_successful_transactions 
    ELSE 0 
  END;

  -- Insert or update analytics record
  INSERT INTO payment_analytics (
    date,
    total_revenue,
    total_transactions,
    successful_transactions,
    failed_transactions,
    basic_tier_revenue,
    pro_tier_revenue,
    basic_tier_count,
    pro_tier_count,
    average_transaction_value,
    updated_at
  ) VALUES (
    p_date,
    v_total_revenue,
    v_total_transactions,
    v_successful_transactions,
    v_failed_transactions,
    v_basic_revenue,
    v_pro_revenue,
    v_basic_count,
    v_pro_count,
    v_avg_transaction,
    NOW()
  )
  ON CONFLICT (date) DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_transactions = EXCLUDED.total_transactions,
    successful_transactions = EXCLUDED.successful_transactions,
    failed_transactions = EXCLUDED.failed_transactions,
    basic_tier_revenue = EXCLUDED.basic_tier_revenue,
    pro_tier_revenue = EXCLUDED.pro_tier_revenue,
    basic_tier_count = EXCLUDED.basic_tier_count,
    pro_tier_count = EXCLUDED.pro_tier_count,
    average_transaction_value = EXCLUDED.average_transaction_value,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get payment analytics summary
CREATE OR REPLACE FUNCTION get_payment_analytics_summary(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_revenue DECIMAL(10, 2),
  total_transactions BIGINT,
  success_rate DECIMAL(5, 2),
  avg_transaction_value DECIMAL(10, 2),
  basic_tier_revenue DECIMAL(10, 2),
  pro_tier_revenue DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(pa.total_revenue), 0) as total_revenue,
    COALESCE(SUM(pa.total_transactions), 0) as total_transactions,
    CASE 
      WHEN SUM(pa.total_transactions) > 0 
      THEN (SUM(pa.successful_transactions)::DECIMAL / SUM(pa.total_transactions) * 100)
      ELSE 0 
    END as success_rate,
    CASE 
      WHEN SUM(pa.successful_transactions) > 0 
      THEN SUM(pa.total_revenue) / SUM(pa.successful_transactions)
      ELSE 0 
    END as avg_transaction_value,
    COALESCE(SUM(pa.basic_tier_revenue), 0) as basic_tier_revenue,
    COALESCE(SUM(pa.pro_tier_revenue), 0) as pro_tier_revenue
  FROM payment_analytics pa
  WHERE pa.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE payment_events IS 'Stores detailed payment webhook events from Dodo';
COMMENT ON TABLE payment_analytics IS 'Daily aggregated payment analytics for reporting';
COMMENT ON FUNCTION update_payment_analytics(DATE) IS 'Updates daily payment analytics for a specific date';
COMMENT ON FUNCTION get_payment_analytics_summary(DATE, DATE) IS 'Gets payment analytics summary for a date range';