# Business L&D Platform - Granular Implementation Plan

> **For Claude:** This plan is designed for autonomous execution by Haiku agents across multiple sessions with credit limitations. Each task is 5-15 minutes and completely independent. Use task tracking to resume progress.

**Goal:** Build enterprise L&D platform completely isolated from D2C, with AI-powered content generation, assessments, and comprehensive tracking.

**Architecture:** Separate database schema (organizations), separate route structure (app/(business)), separate component library (components/business), separate utilities (lib/business). SSO authentication, S3 content storage, AI module generation.

**Tech Stack:** Next.js 14, TypeScript, Supabase (PostgreSQL + Auth), Tailwind CSS, shadcn/ui, AWS S3, OpenRouter AI SDK, React Query

**Estimation:** 300+ micro-tasks, ~16 weeks with 1-2 developers

---

## Task Tracking System

**Status Values:**
- `pending` - Not started
- `in_progress` - Currently being worked on
- `completed` - Finished and verified
- `blocked` - Waiting on dependency
- `skipped` - Decided not to implement

**Metadata:**
- `phase` - Which phase this belongs to (1-6)
- `category` - Type of task (db, api, ui, auth, ai, etc.)
- `dependencies` - Task IDs that must complete first
- `estimated_minutes` - Time estimate (5-15 min per task)
- `assigned_to` - Agent/session ID
- `completed_at` - Timestamp when completed

**Task Tracking File:** `docs/plans/business-lnd-task-tracker.json`

---

## Phase 1: Foundation (Database & Auth)

### Category: Database Schema

#### Task 1.1: Create organizations schema file
**Status:** `pending`
**Phase:** 1
**Category:** `db`
**Dependencies:** None
**Estimated:** 10 min

**Files:**
- Create: `supabase/migrations/20260128_create_organizations_schema.sql`

**Steps:**

1. Create migration file with schema creation
```sql
-- Create organizations schema
CREATE SCHEMA IF NOT EXISTS organizations;

-- Set search path
SET search_path TO organizations, public;
```

2. Verify syntax
```bash
# Check SQL syntax
psql -d postgres -f supabase/migrations/20260128_create_organizations_schema.sql --dry-run
```

3. Commit
```bash
git add supabase/migrations/20260128_create_organizations_schema.sql
git commit -m "feat(db): create organizations schema"
```

**Success Criteria:**
- File created with valid SQL
- No syntax errors
- Committed to git

---

#### Task 1.2: Create organizations table
**Status:** `pending`
**Phase:** 1
**Category:** `db`
**Dependencies:** [1.1]
**Estimated:** 15 min

**Files:**
- Modify: `supabase/migrations/20260128_create_organizations_schema.sql`

**Steps:**

1. Add organizations table definition
```sql
CREATE TABLE organizations.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  custom_domain TEXT,
  subscription_plan TEXT DEFAULT 'enterprise',
  monthly_rate DECIMAL(10,2) NOT NULL,
  billing_email TEXT,
  subscription_status TEXT DEFAULT 'active',
  subscription_start_date DATE,
  subscription_end_date DATE,
  max_users INTEGER,
  max_storage_gb INTEGER,
  settings JSONB DEFAULT '{
    "sso_enabled": false,
    "sso_provider": null,
    "default_course_passing_score": 80,
    "allow_learner_self_enroll": false,
    "recertification_reminder_days": 30,
    "session_timeout_minutes": 60
  }'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_org_domain ON organizations.organizations(domain);
CREATE INDEX idx_org_slug ON organizations.organizations(slug);
CREATE INDEX idx_org_status ON organizations.organizations(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION organizations.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations.organizations
  FOR EACH ROW EXECUTE FUNCTION organizations.update_updated_at_column();
```

2. Test migration locally
```bash
# Apply migration to local Supabase
npx supabase db reset
npx supabase db push
```

3. Verify table created
```bash
# Check table exists
npx supabase db query "SELECT tablename FROM pg_tables WHERE schemaname='organizations'"
```

4. Commit
```bash
git add supabase/migrations/20260128_create_organizations_schema.sql
git commit -m "feat(db): add organizations table"
```

**Success Criteria:**
- Table created successfully
- Indexes present
- Trigger working
- Migration applies cleanly

---

#### Task 1.3: Create members table
**Status:** `pending`
**Phase:** 1
**Category:** `db`
**Dependencies:** [1.2]
**Estimated:** 12 min

**Files:**
- Modify: `supabase/migrations/20260128_create_organizations_schema.sql`

**Steps:**

1. Add members table after organizations table
```sql
CREATE TABLE organizations.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'content_creator', 'learner')),
  department TEXT,
  job_title TEXT,
  manager_id UUID REFERENCES organizations.members(id),
  employee_id TEXT,
  status TEXT DEFAULT 'active',
  invited_by UUID REFERENCES organizations.members(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id),
  UNIQUE(org_id, email)
);

CREATE INDEX idx_member_org ON organizations.members(org_id);
CREATE INDEX idx_member_user ON organizations.members(user_id);
CREATE INDEX idx_member_role ON organizations.members(org_id, role);
CREATE INDEX idx_member_status ON organizations.members(status);
CREATE INDEX idx_member_department ON organizations.members(org_id, department);
CREATE INDEX idx_member_manager ON organizations.members(manager_id);

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON organizations.members
  FOR EACH ROW EXECUTE FUNCTION organizations.update_updated_at_column();
```

2. Test migration
```bash
npx supabase db reset
npx supabase db push
```

3. Insert test data
```sql
-- Test insertion
INSERT INTO organizations.organizations (name, domain, slug, monthly_rate)
VALUES ('Test Corp', 'testcorp.com', 'test-corp', 999.00);

INSERT INTO organizations.members (org_id, user_id, email, role)
VALUES (
  (SELECT id FROM organizations.organizations WHERE slug='test-corp'),
  gen_random_uuid(),
  'admin@testcorp.com',
  'admin'
);
```

4. Commit
```bash
git add supabase/migrations/20260128_create_organizations_schema.sql
git commit -m "feat(db): add members table"
```

**Success Criteria:**
- Table created with constraints
- Foreign keys working
- Unique constraints enforced
- Test data insertable

---

#### Task 1.4: Create skills table
**Status:** `pending`
**Phase:** 1
**Category:** `db`
**Dependencies:** [1.2]
**Estimated:** 8 min

**Files:**
- Modify: `supabase/migrations/20260128_create_organizations_schema.sql`

**Steps:**

1. Add skills table
```sql
CREATE TABLE organizations.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, name)
);

CREATE INDEX idx_skill_org ON organizations.skills(org_id);
CREATE INDEX idx_skill_category ON organizations.skills(category);

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON organizations.skills
  FOR EACH ROW EXECUTE FUNCTION organizations.update_updated_at_column();
```

2. Test migration
```bash
npx supabase db reset && npx supabase db push
```

3. Commit
```bash
git add supabase/migrations/20260128_create_organizations_schema.sql
git commit -m "feat(db): add skills table"
```

**Success Criteria:**
- Table created successfully
- Unique constraint on org_id + name works

---

#### Task 1.5: Create learning_paths table
**Status:** `pending`
**Phase:** 1
**Category:** `db`
**Dependencies:** [1.3]
**Estimated:** 10 min

**Files:**
- Modify: `supabase/migrations/20260128_create_organizations_schema.sql`

**Steps:**

1. Add learning_paths table
```sql
CREATE TABLE organizations.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  type TEXT DEFAULT 'custom',
  is_required BOOLEAN DEFAULT false,
  estimated_duration_hours INTEGER,
  created_by UUID REFERENCES organizations.members(id),
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learning_path_org ON organizations.learning_paths(org_id);
CREATE INDEX idx_learning_path_status ON organizations.learning_paths(status);

CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON organizations.learning_paths
  FOR EACH ROW EXECUTE FUNCTION organizations.update_updated_at_column();
```

2. Test migration
```bash
npx supabase db reset && npx supabase db push
```

3. Commit
```bash
git add supabase/migrations/20260128_create_organizations_schema.sql
git commit -m "feat(db): add learning_paths table"
```

**Success Criteria:**
- Table created successfully
- Foreign key to members working

---

#### Task 1.6: Create courses table
**Status:** `pending`
**Phase:** 1
**Category:** `db`
**Dependencies:** [1.5]
**Estimated:** 15 min

**Files:**
- Modify: `supabase/migrations/20260128_create_organizations_schema.sql`

**Steps:**

1. Add courses table with all fields
```sql
CREATE TABLE organizations.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations.organizations(id) ON DELETE CASCADE,
  learning_path_id UUID REFERENCES organizations.learning_paths(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  content_type TEXT NOT NULL,
  creation_method TEXT NOT NULL DEFAULT 'ai_generated',
  s3_bucket TEXT,
  s3_key TEXT,
  original_file_url TEXT,
  original_file_name TEXT,
  file_size_bytes BIGINT,
  content_metadata JSONB DEFAULT '{}'::jsonb,
  external_url TEXT,
  generation_status TEXT DEFAULT 'pending',
  generation_error TEXT,
  ai_processing_started_at TIMESTAMPTZ,
  ai_processing_completed_at TIMESTAMPTZ,
  ai_model_used TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  passing_score_percentage INTEGER DEFAULT 80,
  allow_retakes BOOLEAN DEFAULT true,
  max_retake_attempts INTEGER,
  estimated_duration_minutes INTEGER,
  requires_recertification BOOLEAN DEFAULT false,
  recertification_interval_months INTEGER,
  created_by UUID REFERENCES organizations.members(id),
  reviewed_by UUID REFERENCES organizations.members(id),
  approved_by UUID REFERENCES organizations.members(id),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES organizations.courses(id),
  version_notes TEXT,
  path_order_index INTEGER,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_org ON organizations.courses(org_id);
CREATE INDEX idx_course_status ON organizations.courses(status);
CREATE INDEX idx_course_learning_path ON organizations.courses(learning_path_id);
CREATE INDEX idx_course_mandatory ON organizations.courses(org_id, is_mandatory);
CREATE INDEX idx_course_generation_status ON organizations.courses(generation_status);
CREATE INDEX idx_course_search ON organizations.courses USING gin(search_vector);

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON organizations.courses
  FOR EACH ROW EXECUTE FUNCTION organizations.update_updated_at_column();

-- Function to update search vector
CREATE OR REPLACE FUNCTION organizations.update_course_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector =
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_search_vector_update
  BEFORE INSERT OR UPDATE OF title, description
  ON organizations.courses
  FOR EACH ROW EXECUTE FUNCTION organizations.update_course_search_vector();
```

2. Test migration
```bash
npx supabase db reset && npx supabase db push
```

3. Commit
```bash
git add supabase/migrations/20260128_create_organizations_schema.sql
git commit -m "feat(db): add courses table with search"
```

**Success Criteria:**
- Table created with all fields
- Search vector trigger working
- All indexes created

---

**NOTE:** Due to the massive size of the complete granular breakdown (300+ tasks), I'll create a structured approach instead. Let me create:
1. A task tracker JSON structure
2. A task generation script
3. A task executor script that works with credit limits

This will be more maintainable and autonomous.

---

## Task Management System

Instead of listing 300+ tasks inline, we'll use a dynamic task management system.

### Files to Create:

1. **Task Tracker:** `docs/plans/business-lnd-task-tracker.json`
2. **Task Generator:** `scripts/generate-tasks.ts`
3. **Task Executor:** `scripts/execute-next-task.ts`
4. **Task Status CLI:** `scripts/task-status.ts`

This allows:
- Dynamic task generation based on completed work
- Autonomous task picking based on dependencies
- Credit-aware execution with resume capability
- Clear progress tracking

---

