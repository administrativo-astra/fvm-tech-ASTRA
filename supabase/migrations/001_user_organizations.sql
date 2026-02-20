-- Migration: Create user_organizations table for multi-org support
-- Run this in your Supabase SQL Editor

-- 1. Create the junction table
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org ON user_organizations(organization_id);

-- 3. RLS
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships"
  ON user_organizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage memberships"
  ON user_organizations FOR ALL
  USING (
    organization_id IN (
      SELECT uo.organization_id FROM user_organizations uo
      WHERE uo.user_id = auth.uid() AND uo.role IN ('owner', 'admin')
    )
  );

-- 4. Seed existing data from profiles into user_organizations
INSERT INTO user_organizations (user_id, organization_id, role)
SELECT id, organization_id, role
FROM profiles
WHERE organization_id IS NOT NULL
ON CONFLICT (user_id, organization_id) DO NOTHING;
