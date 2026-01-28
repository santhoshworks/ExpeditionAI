-- RLS Policies for Business L&D Platform
-- Enable RLS on all sensitive tables

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_config ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM members WHERE auth_user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is org admin
CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE SQL SECURITY DEFINER;

-- Organizations table policies
CREATE POLICY "Members can view their organization" ON organizations
  FOR SELECT
  USING (id = get_user_org_id());

CREATE POLICY "Admins can update their organization" ON organizations
  FOR UPDATE
  USING (id = get_user_org_id() AND is_org_admin());

-- Members table policies
CREATE POLICY "Members can view members in their org" ON members
  FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage members" ON members
  FOR UPDATE
  USING (org_id = get_user_org_id() AND is_org_admin());

CREATE POLICY "Admins can delete members" ON members
  FOR DELETE
  USING (org_id = get_user_org_id() AND is_org_admin());

-- Skills table policies
CREATE POLICY "Members can view skills in their org" ON skills
  FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Content creators can manage skills" ON skills
  FOR ALL
  USING (
    org_id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM members
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'content_creator')
    )
  );

-- Courses table policies
CREATE POLICY "Members can view published courses in their org" ON courses
  FOR SELECT
  USING (
    org_id = get_user_org_id() AND
    (status = 'published' OR created_by = (SELECT id FROM members WHERE auth_user_id = auth.uid()))
  );

CREATE POLICY "Content creators can manage courses" ON courses
  FOR ALL
  USING (
    org_id = get_user_org_id() AND
    EXISTS (
      SELECT 1 FROM members
      WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'content_creator')
    )
  );

-- Modules table policies
CREATE POLICY "Members can view modules in courses they have access to" ON modules
  FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE org_id = get_user_org_id()
    )
  );

-- Assessments table policies
CREATE POLICY "Members can view assessments in their courses" ON assessments
  FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM courses WHERE org_id = get_user_org_id()
    )
  );

-- Enrollments table policies
CREATE POLICY "Members can view their own enrollments" ON enrollments
  FOR SELECT
  USING (
    member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid()) OR
    course_id IN (
      SELECT id FROM courses WHERE created_by = (SELECT id FROM members WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Members can update their own progress" ON enrollments
  FOR UPDATE
  USING (
    member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );

-- Module Progress table policies
CREATE POLICY "Members can view their own module progress" ON module_progress
  FOR SELECT
  USING (
    enrollment_id IN (
      SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Members can update their own module progress" ON module_progress
  FOR UPDATE
  USING (
    enrollment_id IN (
      SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
    )
  );

-- Video Bookmarks table policies
CREATE POLICY "Members can view their own bookmarks" ON video_bookmarks
  FOR SELECT
  USING (
    module_progress_id IN (
      SELECT id FROM module_progress WHERE enrollment_id IN (
        SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Members can manage their own bookmarks" ON video_bookmarks
  FOR ALL
  USING (
    module_progress_id IN (
      SELECT id FROM module_progress WHERE enrollment_id IN (
        SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
      )
    )
  );

-- Notifications table policies
CREATE POLICY "Members can view their own notifications" ON notifications
  FOR SELECT
  USING (
    member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Members can update their own notifications" ON notifications
  FOR UPDATE
  USING (
    member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );

-- Audit Log policies (read-only for org admins)
CREATE POLICY "Admins can view audit logs for their org" ON audit_log
  FOR SELECT
  USING (
    org_id = get_user_org_id() AND is_org_admin()
  );

-- SSO Config policies
CREATE POLICY "Only admins can view SSO config" ON sso_config
  FOR SELECT
  USING (
    org_id = get_user_org_id() AND is_org_admin()
  );

CREATE POLICY "Only admins can manage SSO config" ON sso_config
  FOR ALL
  USING (
    org_id = get_user_org_id() AND is_org_admin()
  );

-- Data Exports policies
CREATE POLICY "Members can view their own export requests" ON data_exports
  FOR SELECT
  USING (
    member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid()) OR
    org_id = get_user_org_id() AND is_org_admin()
  );

-- Assessment Attempts policies
CREATE POLICY "Members can view their own assessment attempts" ON assessment_attempts
  FOR SELECT
  USING (
    enrollment_id IN (
      SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
    )
  );

-- User Answers policies
CREATE POLICY "Members can view their own answers" ON user_answers
  FOR SELECT
  USING (
    assessment_attempt_id IN (
      SELECT id FROM assessment_attempts WHERE enrollment_id IN (
        SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
      )
    )
  );

-- Badges policies
CREATE POLICY "Members can view badges in their org" ON badges
  FOR SELECT
  USING (org_id = get_user_org_id());

-- Member Badges policies
CREATE POLICY "Members can view their own badges" ON member_badges
  FOR SELECT
  USING (
    member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );

-- Member Points policies
CREATE POLICY "Members can view their own points" ON member_points
  FOR SELECT
  USING (
    member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
  );

-- Course Feedback policies
CREATE POLICY "Members can view feedback on courses they have access to" ON course_feedback
  FOR SELECT
  USING (
    enrollment_id IN (
      SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Members can create feedback on their enrollments" ON course_feedback
  FOR INSERT
  WITH CHECK (
    enrollment_id IN (
      SELECT id FROM enrollments WHERE member_id = (SELECT id FROM members WHERE auth_user_id = auth.uid())
    )
  );
