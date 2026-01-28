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

-- Members table (org users with roles)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'content_creator', 'learner')) DEFAULT 'learner',
  status VARCHAR(50) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  job_title VARCHAR(100),
  department VARCHAR(100),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT unique_member_per_org UNIQUE(org_id, auth_user_id),
  CONSTRAINT unique_email_per_org UNIQUE(org_id, email)
);

-- Indexes
CREATE INDEX idx_members_org_id ON members(org_id);
CREATE INDEX idx_members_auth_user_id ON members(auth_user_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_role ON members(role);
CREATE INDEX idx_members_deleted_at ON members(deleted_at) WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_members_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_update_timestamp
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_members_timestamp();

-- Skills table (catalog of competencies)
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  level VARCHAR(50) DEFAULT 'intermediate',

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_skill_per_org UNIQUE(org_id, name)
);

-- Indexes
CREATE INDEX idx_skills_org_id ON skills(org_id);
CREATE INDEX idx_skills_category ON skills(category);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_skills_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_update_timestamp
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE FUNCTION update_skills_timestamp();

-- Learning Paths table (multi-course sequences)
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty_level VARCHAR(50),
  estimated_duration_hours INTEGER,
  created_by UUID NOT NULL REFERENCES members(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_learning_path_per_org UNIQUE(org_id, name)
);

-- Indexes
CREATE INDEX idx_learning_paths_org_id ON learning_paths(org_id);
CREATE INDEX idx_learning_paths_created_by ON learning_paths(created_by);
CREATE INDEX idx_learning_paths_is_active ON learning_paths(is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_learning_paths_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER learning_paths_update_timestamp
BEFORE UPDATE ON learning_paths
FOR EACH ROW
EXECUTE FUNCTION update_learning_paths_timestamp();
