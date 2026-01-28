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

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES members(id) ON DELETE SET NULL,
  instructor_name VARCHAR(255),
  duration_minutes INTEGER,
  difficulty_level VARCHAR(50),
  status VARCHAR(50) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_generation_date TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,

  -- Full-text search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
  ) STORED,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_course_per_org UNIQUE(org_id, name)
);

-- Indexes
CREATE INDEX idx_courses_org_id ON courses(org_id);
CREATE INDEX idx_courses_learning_path_id ON courses(learning_path_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_courses_ai_generated ON courses(ai_generated);
CREATE INDEX idx_courses_search ON courses USING GIN (search_vector);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_courses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courses_update_timestamp
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION update_courses_timestamp();

-- Course-Skills Junction Table
CREATE TABLE course_skills (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50),

  PRIMARY KEY (course_id, skill_id)
);

-- Indexes
CREATE INDEX idx_course_skills_skill_id ON course_skills(skill_id);

-- Course Prerequisites Table
CREATE TABLE course_prerequisites (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  PRIMARY KEY (course_id, prerequisite_course_id),
  CONSTRAINT no_self_reference CHECK (course_id != prerequisite_course_id)
);

-- Indexes
CREATE INDEX idx_course_prerequisites_prerequisite_id ON course_prerequisites(prerequisite_course_id);

-- Modules table (learning units within courses)
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  module_order INTEGER NOT NULL,
  duration_minutes INTEGER,
  content TEXT,
  content_type VARCHAR(50) CHECK (content_type IN ('video', 'text', 'interactive', 'mixed')),

  -- Video fields
  video_url TEXT,
  video_duration_seconds INTEGER,
  video_thumbnail_url TEXT,
  transcription TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_module_order_per_course UNIQUE(course_id, module_order)
);

-- Indexes
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_modules_content_type ON modules(content_type);
CREATE INDEX idx_modules_order ON modules(course_id, module_order);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER modules_update_timestamp
BEFORE UPDATE ON modules
FOR EACH ROW
EXECUTE FUNCTION update_modules_timestamp();

-- Assessments table (quizzes for modules or overall courses)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assessment_type VARCHAR(50) CHECK (assessment_type IN ('quiz', 'survey', 'exam', 'practical')),
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER,
  time_limit_minutes INTEGER,
  randomize_questions BOOLEAN DEFAULT FALSE,
  show_correct_answers BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assessments_course_id ON assessments(course_id);
CREATE INDEX idx_assessments_module_id ON assessments(module_id);
CREATE INDEX idx_assessments_type ON assessments(assessment_type);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_assessments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessments_update_timestamp
BEFORE UPDATE ON assessments
FOR EACH ROW
EXECUTE FUNCTION update_assessments_timestamp();

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) CHECK (question_type IN ('mcq', 'true_false', 'short_answer', 'essay')),
  pool_tag VARCHAR(100),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX idx_questions_pool_tag ON questions(pool_tag);

-- Answer Options table
CREATE TABLE answer_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_answer_options_question_id ON answer_options(question_id);

-- Course Assignments table
CREATE TABLE course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES members(id) ON DELETE SET NULL,
  due_date DATE,
  status VARCHAR(50) CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_course_assignment UNIQUE(course_id, member_id)
);

CREATE INDEX idx_course_assignments_course_id ON course_assignments(course_id);
CREATE INDEX idx_course_assignments_member_id ON course_assignments(member_id);
CREATE INDEX idx_course_assignments_status ON course_assignments(status);

CREATE OR REPLACE FUNCTION update_course_assignments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_assignments_update_timestamp
BEFORE UPDATE ON course_assignments
FOR EACH ROW
EXECUTE FUNCTION update_course_assignments_timestamp();

-- Enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE,
  needs_recertification BOOLEAN DEFAULT FALSE,
  recertification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_enrollment UNIQUE(course_id, member_id)
);

CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_member_id ON enrollments(member_id);
CREATE INDEX idx_enrollments_is_completed ON enrollments(is_completed);
CREATE INDEX idx_enrollments_progress ON enrollments(progress_percentage);

CREATE OR REPLACE FUNCTION update_enrollments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollments_update_timestamp
BEFORE UPDATE ON enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollments_timestamp();

-- Module Progress table
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE,
  video_watch_time_seconds INTEGER DEFAULT 0,
  video_total_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_module_progress UNIQUE(enrollment_id, module_id)
);

CREATE INDEX idx_module_progress_enrollment_id ON module_progress(enrollment_id);
CREATE INDEX idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX idx_module_progress_is_completed ON module_progress(is_completed);

CREATE OR REPLACE FUNCTION update_module_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER module_progress_update_timestamp
BEFORE UPDATE ON module_progress
FOR EACH ROW
EXECUTE FUNCTION update_module_progress_timestamp();

-- Video Bookmarks table
CREATE TABLE video_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_progress_id UUID NOT NULL REFERENCES module_progress(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_bookmarks_module_progress_id ON video_bookmarks(module_progress_id);

-- Assessment Attempts table
CREATE TABLE assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  score INTEGER,
  max_score INTEGER,
  time_spent_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT unique_assessment_attempt UNIQUE(enrollment_id, assessment_id, attempt_number)
);

CREATE INDEX idx_assessment_attempts_enrollment_id ON assessment_attempts(enrollment_id);
CREATE INDEX idx_assessment_attempts_assessment_id ON assessment_attempts(assessment_id);

-- User Answers table
CREATE TABLE user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[] DEFAULT ARRAY[]::UUID[],
  text_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_answers_assessment_attempt_id ON user_answers(assessment_attempt_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);

-- Certificates table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  certificate_number VARCHAR(255) NOT NULL UNIQUE,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  verification_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_enrollment_id ON certificates(enrollment_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);

-- Member Skills table
CREATE TABLE member_skills (
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50),
  acquired_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (member_id, skill_id)
);

CREATE INDEX idx_member_skills_skill_id ON member_skills(skill_id);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_org_id ON badges(org_id);

-- Member Badges table
CREATE TABLE member_badges (
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_member_badge UNIQUE(member_id, badge_id)
);

CREATE INDEX idx_member_badges_badge_id ON member_badges(badge_id);

-- Member Points table
CREATE TABLE member_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_member_points_member_id ON member_points(member_id);

-- Course Feedback table
CREATE TABLE course_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_feedback_enrollment_id ON course_feedback(enrollment_id);
CREATE INDEX idx_course_feedback_rating ON course_feedback(rating);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  notification_type VARCHAR(100),
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(50) DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_member_id ON notifications(member_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
