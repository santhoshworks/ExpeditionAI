-- Create organizations schema
CREATE SCHEMA IF NOT EXISTS organizations;

-- Set search path
SET search_path TO organizations, public;

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  organization_size VARCHAR(50),
  founded_date DATE,

  -- Branding
  logo_url TEXT,
  theme_color VARCHAR(7),
  custom_domain VARCHAR(255),

  -- Subscription
  subscription_plan VARCHAR(50) CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
  subscription_status VARCHAR(50) CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled')),
  billing_email VARCHAR(255),
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,

  -- Settings
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  max_members INTEGER DEFAULT 50,
  enable_sso BOOLEAN DEFAULT FALSE,
  enable_api_access BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,

  CONSTRAINT unique_org_name UNIQUE(org_name),
  CONSTRAINT unique_custom_domain UNIQUE(custom_domain) WHERE custom_domain IS NOT NULL
);

-- Indexes
CREATE INDEX idx_organizations_subscription_plan ON organizations(subscription_plan);
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_organizations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_update_timestamp
BEFORE UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION update_organizations_timestamp();
