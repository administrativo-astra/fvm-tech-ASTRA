-- =============================================
-- FVM Astra - Database Schema
-- =============================================

-- 1. Organizations (tenants/schools)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2b. User-Organization memberships (many-to-many)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org ON user_organizations(organization_id);

-- RLS for user_organizations
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

-- 3. Campaigns (marketing campaigns)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'facebook_ads' CHECK (source IN ('facebook_ads', 'google_ads', 'instagram', 'organic', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Funnel Data (weekly granularity - marketing + sales metrics)
CREATE TABLE IF NOT EXISTS funnel_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  month TEXT NOT NULL,        -- e.g. 'Janeiro'
  week TEXT NOT NULL,         -- e.g. 'Semana 1'

  -- Marketing metrics
  spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,

  -- Sales metrics
  qualified_leads INTEGER NOT NULL DEFAULT 0,
  visits INTEGER NOT NULL DEFAULT 0,
  follow_up INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'facebook_ads', 'google_ads', 'csv_import', 'webhook')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate entries
  UNIQUE(organization_id, campaign_id, period_start, period_end)
);

-- 5. Integration configs
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('facebook_ads', 'google_ads', 'webhook', 'csv')),
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, provider)
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_funnel_data_org ON funnel_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_funnel_data_period ON funnel_data(organization_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_funnel_data_month ON funnel_data(organization_id, month);
CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Organizations: members can view their org
CREATE POLICY "Members can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Organizations: owners can update their org
CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (
    id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'owner')
  );

-- Campaigns: org members can view campaigns
CREATE POLICY "Members can view campaigns"
  ON campaigns FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Campaigns: editors+ can insert/update/delete campaigns
CREATE POLICY "Editors can manage campaigns"
  ON campaigns FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')
    )
  );

-- Funnel Data: org members can view
CREATE POLICY "Members can view funnel data"
  ON funnel_data FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Funnel Data: editors+ can manage
CREATE POLICY "Editors can manage funnel data"
  ON funnel_data FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')
    )
  );

-- Integrations: org members can view
CREATE POLICY "Members can view integrations"
  ON integrations FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid())
  );

-- Integrations: admins+ can manage
CREATE POLICY "Admins can manage integrations"
  ON integrations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin')
    )
  );

-- =============================================
-- Trigger: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Function: aggregate funnel data by month
-- =============================================
CREATE OR REPLACE FUNCTION get_monthly_totals(org_id UUID, target_month TEXT)
RETURNS TABLE (
  total_spent NUMERIC,
  total_impressions BIGINT,
  total_reach BIGINT,
  total_clicks BIGINT,
  total_leads BIGINT,
  total_qualified_leads BIGINT,
  total_visits BIGINT,
  total_follow_up BIGINT,
  total_sales BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(spent)::NUMERIC AS total_spent,
    SUM(impressions)::BIGINT AS total_impressions,
    SUM(reach)::BIGINT AS total_reach,
    SUM(clicks)::BIGINT AS total_clicks,
    SUM(leads)::BIGINT AS total_leads,
    SUM(qualified_leads)::BIGINT AS total_qualified_leads,
    SUM(visits)::BIGINT AS total_visits,
    SUM(follow_up)::BIGINT AS total_follow_up,
    SUM(sales)::BIGINT AS total_sales
  FROM funnel_data
  WHERE funnel_data.organization_id = org_id
    AND funnel_data.month = target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
