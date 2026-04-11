-- Migration: Create Access Control Tables for Phase 2c
-- Date: 2026-04-11
-- Purpose: Enable role-based access control across all 50+ Bayt OS modules

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
-- Defines permission groups that can be assigned to users
-- System roles (system_role=true) cannot be deleted

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed system roles
INSERT INTO roles (name, description, system_role) VALUES
  ('admin', 'Full administrative access to all modules and settings', TRUE),
  ('parent', 'Parent/guardian with full access and user management', TRUE),
  ('guardian', 'Guardian with management access (secondary parent)', TRUE),
  ('teenager', 'Older children with curated module access', TRUE),
  ('child', 'Younger children with limited module access', TRUE),
  ('staff', 'Household staff access (operations-focused)', TRUE),
  ('maid', 'Maid role with operations permissions', TRUE),
  ('nanny', 'Nanny role with childcare and operations access', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. MODULES TABLE
-- ============================================================================
-- Lists all available modules in Bayt OS
-- These are the features/sections users can access

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(50),
  display_order INT DEFAULT 999,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed core modules (from sidebar navigation)
INSERT INTO modules (slug, name, category, icon, display_order, description) VALUES
  -- Foundation
  ('constitution', 'Constitution', 'foundation', '📋', 1, 'Family constitution and core values'),
  ('documents', 'Documents', 'foundation', '📄', 2, 'Important documents and records'),

  -- Daily Operations
  ('daily-rhythm', 'Daily Rhythm', 'operations', '⏰', 10, 'Daily schedules and routines'),
  ('meals', 'Meals', 'operations', '🍽️', 11, 'Meal planning and tracking'),
  ('shopping', 'Shopping', 'operations', '🛒', 12, 'Shopping lists and inventory'),
  ('transport', 'Transport', 'operations', '🚗', 13, 'Transportation and logistics'),
  ('operations', 'Operations', 'operations', '⚙️', 14, 'General operations management'),

  -- Planning & Strategy
  ('monthly-council', 'Monthly Council', 'planning', '🤝', 20, 'Monthly family meetings'),
  ('annual-planning', 'Annual Planning', 'planning', '📅', 21, 'Yearly goals and planning'),
  ('family-goals', 'Family Goals', 'planning', '🎯', 22, 'Collective family objectives'),

  -- Financial
  ('budget', 'Budget', 'financial', '💰', 30, 'Family budget and expenses'),
  ('economy', 'Economy', 'financial', '📊', 31, 'Economic system and tracking'),
  ('savings', 'Savings', 'financial', '🏦', 32, 'Savings goals and tracking'),
  ('family-coin', 'Family Coin', 'financial', '🪙', 33, 'Internal currency system'),

  -- Learning & Development
  ('deen', 'Deen', 'learning', '🕌', 40, 'Islamic knowledge and practice'),
  ('reading', 'Reading', 'learning', '📚', 41, 'Reading lists and tracking'),
  ('education', 'Education', 'learning', '🎓', 42, 'Formal education management'),
  ('school', 'School', 'learning', '🏫', 43, 'School calendar and information'),

  -- Health & Wellness
  ('health', 'Health', 'wellness', '🏥', 50, 'Health records and tracking'),
  ('fitness', 'Fitness', 'wellness', '💪', 51, 'Fitness and exercise tracking'),
  ('character', 'Character', 'wellness', '⭐', 52, 'Character development'),

  -- Community & Impact
  ('community', 'Community', 'impact', '👥', 60, 'Community engagement'),
  ('sadaqa', 'Sadaqa', 'impact', '❤️', 61, 'Charity and giving'),
  ('entrepreneurship', 'Entrepreneurship', 'impact', '🚀', 62, 'Business and venture projects'),

  -- Personal Growth
  ('goals', 'Personal Goals', 'growth', '🎯', 70, 'Individual goal tracking'),
  ('projects', 'Projects', 'growth', '📦', 71, 'Personal projects'),
  ('milestones', 'Milestones', 'growth', '🏆', 72, 'Achievement tracking'),
  ('development', 'Development', 'growth', '📈', 73, 'Skill development'),

  -- Social & Connection
  ('forum', 'Forum', 'social', '💬', 80, 'Family discussion forum'),
  ('memory', 'Memory', 'social', '📸', 81, 'Shared memories and stories'),
  ('notifications', 'Notifications', 'social', '🔔', 82, 'System notifications'),

  -- Special
  ('hajj', 'Hajj', 'special', '⛪', 90, 'Hajj planning and preparation'),
  ('jumuah', 'Jumuah', 'special', '🕋', 91, 'Friday prayer information'),
  ('prayer-times', 'Prayer Times', 'special', '⏱️', 92, 'Daily prayer times'),
  ('outings', 'Outings', 'special', '🎪', 93, 'Family outings and events'),
  ('travel', 'Travel', 'special', '✈️', 94, 'Travel planning'),
  ('summer-trip', 'Summer Trip', 'special', '🏖️', 95, 'Annual summer trip planning'),

  -- Settings & Admin
  ('settings', 'Settings', 'admin', '⚙️', 100, 'System settings and configuration'),
  ('contributions', 'Contributions', 'admin', '📊', 101, 'Family contribution tracking'),
  ('assessments', 'Assessments', 'admin', '📋', 102, 'Development assessments'),
  ('reports', 'Reports', 'admin', '📈', 103, 'System reports and analytics')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. ROLE-MODULE PERMISSIONS TABLE
-- ============================================================================
-- Many-to-many relationship defining what each role can do in each module

CREATE TABLE IF NOT EXISTS role_module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit_own BOOLEAN DEFAULT FALSE,
  can_edit_all BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, module_id)
);

-- Create index for faster permission lookups
CREATE INDEX idx_role_module_permissions_role_id
  ON role_module_permissions(role_id);
CREATE INDEX idx_role_module_permissions_module_id
  ON role_module_permissions(module_id);

-- ============================================================================
-- 4. USER ROLES TABLE
-- ============================================================================
-- Many-to-many relationship between users and roles

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Create index for faster user role lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- ============================================================================
-- 5. ACCESS LOGS TABLE
-- ============================================================================
-- Audit trail of all module access for security and analytics

CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(20),
  resource_id VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(50)
);

-- Create indexes for fast log queries
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_module ON access_logs(module);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX idx_access_logs_action ON access_logs(action);

-- ============================================================================
-- 6. SEED DEFAULT PERMISSIONS
-- ============================================================================
-- Parent role: full access to all modules

INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit_own, can_edit_all, can_delete)
SELECT r.id, m.id, TRUE, TRUE, TRUE, TRUE, TRUE
FROM roles r
CROSS JOIN modules m
WHERE r.name = 'parent'
ON CONFLICT DO NOTHING;

-- Guardian role: similar to parent but with some restrictions
INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit_own, can_edit_all, can_delete)
SELECT r.id, m.id, TRUE, TRUE, TRUE, TRUE, FALSE
FROM roles r
CROSS JOIN modules m
WHERE r.name = 'guardian'
  AND m.slug NOT IN ('settings')
ON CONFLICT DO NOTHING;

-- Child role: limited read access to key modules
INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit_own, can_edit_all, can_delete)
SELECT r.id, m.id, TRUE, TRUE, TRUE, FALSE, FALSE
FROM roles r
CROSS JOIN modules m
WHERE r.name = 'child'
  AND m.slug IN ('constitution', 'documents', 'daily-rhythm', 'deen', 'reading', 'education', 'goals', 'forum', 'notifications')
ON CONFLICT DO NOTHING;

-- Teenager role: expanded access
INSERT INTO role_module_permissions (role_id, module_id, can_view, can_create, can_edit_own, can_edit_all, can_delete)
SELECT r.id, m.id, TRUE, TRUE, TRUE, FALSE, FALSE
FROM roles r
CROSS JOIN modules m
WHERE r.name = 'teenager'
  AND m.category IN ('foundation', 'learning', 'growth', 'social', 'wellness')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. VIEW FOR EASY PERMISSION CHECKING
-- ============================================================================

CREATE OR REPLACE VIEW user_module_permissions AS
SELECT
  p.id as user_id,
  p.full_name,
  p.relationship,
  r.id as role_id,
  r.name as role_name,
  m.id as module_id,
  m.slug as module_slug,
  m.name as module_name,
  m.category,
  COALESCE(rmp.can_view, FALSE) as can_view,
  COALESCE(rmp.can_create, FALSE) as can_create,
  COALESCE(rmp.can_edit_own, FALSE) as can_edit_own,
  COALESCE(rmp.can_edit_all, FALSE) as can_edit_all,
  COALESCE(rmp.can_delete, FALSE) as can_delete
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_module_permissions rmp ON r.id = rmp.role_id
LEFT JOIN modules m ON rmp.module_id = m.id;

-- ============================================================================
-- 8. PERMISSION CHECK FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_user_module_access(
  p_user_id UUID,
  p_module_slug VARCHAR
)
RETURNS TABLE (
  can_view BOOLEAN,
  can_create BOOLEAN,
  can_edit_own BOOLEAN,
  can_edit_all BOOLEAN,
  can_delete BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(MAX(CASE WHEN rmp.can_view THEN TRUE END), FALSE) as can_view,
    COALESCE(MAX(CASE WHEN rmp.can_create THEN TRUE END), FALSE) as can_create,
    COALESCE(MAX(CASE WHEN rmp.can_edit_own THEN TRUE END), FALSE) as can_edit_own,
    COALESCE(MAX(CASE WHEN rmp.can_edit_all THEN TRUE END), FALSE) as can_edit_all,
    COALESCE(MAX(CASE WHEN rmp.can_delete THEN TRUE END), FALSE) as can_delete
  FROM user_roles ur
  LEFT JOIN role_module_permissions rmp ON ur.role_id = rmp.role_id
  LEFT JOIN modules m ON rmp.module_id = m.id
  WHERE ur.user_id = p_user_id
    AND m.slug = p_module_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. Enable RLS (Row-Level Security)
-- ============================================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Allow reading roles/modules/permissions for authenticated users
CREATE POLICY "Authenticated users can read roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read modules"
  ON modules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read role permissions"
  ON role_module_permissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can see their own roles
CREATE POLICY "Users can read their own roles"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Users can see access logs (limited to their own initially, can expand)
CREATE POLICY "Users can read access logs for themselves"
  ON access_logs FOR SELECT
  USING (user_id = auth.uid());

-- End of migration
