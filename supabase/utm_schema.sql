-- =============================================
-- FVM Astra - UTM Data Schema
-- =============================================

-- UTM tracking data (from ads → leads → sales)
CREATE TABLE IF NOT EXISTS utm_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- UTM parameters
  utm_source TEXT,           -- e.g. 'Facebook', 'Google'
  utm_medium TEXT,           -- e.g. 'Paid-Social', 'CPC'
  utm_campaign TEXT,         -- e.g. '[10/11][LEADS][PUB INTERESSES / PUB RMKT]'
  utm_content TEXT,          -- Ad creative name (criativo)
  utm_term TEXT,             -- Adset name (conjunto)

  -- Metrics
  interactions INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  qualified_leads INTEGER NOT NULL DEFAULT 0,
  visits INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Time period
  period_start DATE,
  period_end DATE,
  month TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_utm_data_org ON utm_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_utm_data_period ON utm_data(organization_id, month);
CREATE INDEX IF NOT EXISTS idx_utm_data_campaign ON utm_data(organization_id, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_utm_data_content ON utm_data(organization_id, utm_content);
CREATE INDEX IF NOT EXISTS idx_utm_data_term ON utm_data(organization_id, utm_term);

-- RLS
ALTER TABLE utm_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view utm data"
  ON utm_data FOR SELECT
  USING (
    organization_id IN (SELECT organization_id FROM profiles WHERE profiles.id = auth.uid())
  );

CREATE POLICY "Editors can manage utm data"
  ON utm_data FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('owner', 'admin', 'editor')
    )
  );
