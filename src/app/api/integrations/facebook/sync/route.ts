import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import {
  getCampaigns,
  getCampaignInsights,
  getAdsWithUtm,
  parseUtmTags,
  extractActionsMetric,
  type FacebookConfig,
} from "@/lib/facebook";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST — sync Facebook Ads data
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const admin = getAdminClient();

  // Get integration config
  const { data: integration } = await admin
    .from("integrations")
    .select("id, config, is_active")
    .eq("organization_id", profile.organization_id)
    .eq("provider", "facebook_ads")
    .single();

  if (!integration || !integration.is_active) {
    return NextResponse.json({ error: "Facebook Ads não está conectado" }, { status: 400 });
  }

  const config = integration.config as FacebookConfig;
  if (!config.access_token || !config.ad_account_id) {
    return NextResponse.json({ error: "Configuração incompleta" }, { status: 400 });
  }

  // Parse request body for date range
  const body = await request.json().catch(() => ({}));
  const now = new Date();
  const dateEnd = body.dateEnd || now.toISOString().split("T")[0];
  const dateStart = body.dateStart || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  try {
    const results = { campaigns: 0, funnelRows: 0, utmRows: 0 };

    // 1. Sync campaigns
    const fbCampaigns = await getCampaigns(config.access_token, config.ad_account_id);

    for (const campaign of fbCampaigns) {
      await admin
        .from("campaigns")
        .upsert({
          organization_id: profile.organization_id,
          name: campaign.name,
          source: "facebook_ads",
          external_id: campaign.id,
          status: campaign.status === "ACTIVE" ? "active" : "paused",
          config: {
            objective: campaign.objective,
            daily_budget: campaign.daily_budget,
            lifetime_budget: campaign.lifetime_budget,
          },
        }, { onConflict: "organization_id,external_id" })
        .select();

      results.campaigns++;
    }

    // 2. Sync campaign insights → funnel_data
    const insights = await getCampaignInsights(
      config.access_token,
      config.ad_account_id,
      dateStart,
      dateEnd,
      "campaign"
    );

    // Group insights by month + week
    const monthName = getPortugueseMonth(now.getMonth());

    for (const insight of insights) {
      // Map Facebook metrics to our funnel_data
      const spent = parseFloat(insight.spend || "0");
      const impressions = parseInt(insight.impressions || "0", 10);
      const reach = parseInt(insight.reach || "0", 10);
      const clicks = parseInt(insight.clicks || "0", 10);
      const leads = extractActionsMetric(insight.actions, "lead");
      const purchases = extractActionsMetric(insight.actions, "purchase") ||
                         extractActionsMetric(insight.actions, "offsite_conversion.fb_pixel_purchase");

      // Get campaign ID from our DB
      const { data: dbCampaign } = await admin
        .from("campaigns")
        .select("id")
        .eq("organization_id", profile.organization_id)
        .eq("external_id", insight.campaign_id)
        .single();

      await admin
        .from("funnel_data")
        .upsert({
          organization_id: profile.organization_id,
          campaign_id: dbCampaign?.id || null,
          month: monthName,
          week: `Semana ${getWeekOfMonth(new Date(insight.date_start))}`,
          period_start: insight.date_start,
          period_end: insight.date_stop,
          spent,
          impressions,
          reach,
          clicks,
          leads,
          qualified_leads: 0,
          visits: 0,
          sales: purchases,
          source: "facebook_ads",
        }, { onConflict: "organization_id,campaign_id,period_start,period_end" });

      results.funnelRows++;
    }

    // 3. Sync ads with UTMs → utm_data
    const ads = await getAdsWithUtm(config.access_token, config.ad_account_id);

    for (const ad of ads) {
      const urlTags = ad.creative?.url_tags || "";
      const utmParams = parseUtmTags(urlTags);

      if (Object.keys(utmParams).length > 0 || ad.campaign?.name) {
        await admin
          .from("utm_data")
          .upsert({
            organization_id: profile.organization_id,
            month: monthName,
            utm_campaign: utmParams.utm_campaign || ad.campaign?.name || "Sem campanha",
            utm_term: utmParams.utm_term || ad.adset?.name || "",
            utm_content: utmParams.utm_content || ad.name || "",
            utm_source: utmParams.utm_source || "facebook",
            utm_medium: utmParams.utm_medium || "paid-social",
            interactions: 0,
            leads: 0,
            qualified_leads: 0,
            visits: 0,
            sales: 0,
          }, { onConflict: "organization_id,month,utm_campaign,utm_term,utm_content" });

        results.utmRows++;
      }
    }

    // Update last_sync_at
    await admin
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    return NextResponse.json({
      message: "Sincronização concluída",
      results,
      period: { dateStart, dateEnd },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helpers
function getPortugueseMonth(monthIndex: number): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  return months[monthIndex] || "Janeiro";
}

function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
}
