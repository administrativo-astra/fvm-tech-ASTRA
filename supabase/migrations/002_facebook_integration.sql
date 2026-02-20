-- =============================================
-- Migration 002: Facebook Ads integration support
-- =============================================

-- 1. Add external_id and config to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- Unique constraint for upsert by external ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_org_external 
  ON campaigns(organization_id, external_id) 
  WHERE external_id IS NOT NULL;

-- 2. Add unique constraint to utm_data for upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_utm_data_unique 
  ON utm_data(organization_id, month, utm_campaign, utm_term, utm_content)
  WHERE month IS NOT NULL;

-- 3. Update integrations provider CHECK to include google_sheets
ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_provider_check;
ALTER TABLE integrations ADD CONSTRAINT integrations_provider_check 
  CHECK (provider IN ('facebook_ads', 'google_ads', 'google_sheets', 'webhook', 'csv'));
