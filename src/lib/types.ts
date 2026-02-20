export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  full_name: string | null;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  external_id: string | null;
  source: "facebook_ads" | "google_ads" | "instagram" | "organic" | "other";
  status: "active" | "paused" | "completed";
  config: Record<string, unknown>;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunnelData {
  id: string;
  organization_id: string;
  campaign_id: string | null;
  period_start: string;
  period_end: string;
  month: string;
  week: string;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  qualified_leads: number;
  visits: number;
  follow_up: number;
  sales: number;
  source: "manual" | "facebook_ads" | "google_ads" | "csv_import" | "webhook";
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  organization_id: string;
  provider: "facebook_ads" | "google_ads" | "google_sheets" | "webhook" | "csv";
  config: Record<string, unknown>;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UtmData {
  id: string;
  organization_id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  interactions: number;
  leads: number;
  qualified_leads: number;
  visits: number;
  sales: number;
  spent: number;
  period_start: string | null;
  period_end: string | null;
  month: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunnelTotals {
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  followUp: number;
  sales: number;
}

export interface MonthlyData {
  month: string;
  weeks: WeekData[];
}

export interface WeekData {
  week: string;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  followUp: number;
  sales: number;
}
