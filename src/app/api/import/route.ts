import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// POST /api/import — import CSV data for funnel_data or utm_data
export async function POST(request: NextRequest) {
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

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });
  }

  if (!["owner", "admin", "editor"].includes(profile.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const { type, data: rows } = body as {
    type: "funnel" | "utm";
    data: Record<string, string>[];
  };

  if (!type || !rows || !Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Dados inválidos. Envie { type, data[] }" }, { status: 400 });
  }

  const orgId = profile.organization_id;

  if (type === "funnel") {
    const records = rows.map((row) => ({
      organization_id: orgId,
      month: row.month || row.mes || row.Mês || row.Mes || "",
      week: row.week || row.semana || row.Semana || "",
      period_start: row.period_start || row.inicio || row.data_inicio || null,
      period_end: row.period_end || row.fim || row.data_fim || null,
      spent: parseFloat(row.spent || row.investimento || row.Investimento || "0") || 0,
      impressions: parseInt(row.impressions || row.impressoes || row.Impressões || "0") || 0,
      reach: parseInt(row.reach || row.alcance || row.Alcance || "0") || 0,
      clicks: parseInt(row.clicks || row.cliques || row.Cliques || "0") || 0,
      leads: parseInt(row.leads || row.Leads || "0") || 0,
      qualified_leads: parseInt(row.qualified_leads || row.qualificados || row.Qualificados || row.mql || "0") || 0,
      visits: parseInt(row.visits || row.visitas || row.Visitas || "0") || 0,
      follow_up: parseInt(row.follow_up || row.followup || row.FollowUp || row["Follow-up"] || "0") || 0,
      sales: parseInt(row.sales || row.vendas || row.Vendas || row.matriculas || row.Matrículas || "0") || 0,
      source: "csv_import",
    }));

    const { data, error } = await supabase
      .from("funnel_data")
      .insert(records)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ imported: data?.length || 0, type: "funnel" }, { status: 201 });
  }

  if (type === "utm") {
    const records = rows.map((row) => ({
      organization_id: orgId,
      utm_source: row.utm_source || row.fonte || row.Fonte || null,
      utm_medium: row.utm_medium || row.meio || row.Meio || null,
      utm_campaign: row.utm_campaign || row.campanha || row.Campanha || null,
      utm_content: row.utm_content || row.criativo || row.Criativo || row.ad_name || null,
      utm_term: row.utm_term || row.conjunto || row.Conjunto || row.adset_name || null,
      interactions: parseInt(row.interactions || row.interacoes || row.Interações || "0") || 0,
      leads: parseInt(row.leads || row.Leads || "0") || 0,
      qualified_leads: parseInt(row.qualified_leads || row.qualificados || row.Qualificados || "0") || 0,
      visits: parseInt(row.visits || row.visitas || row.Visitas || "0") || 0,
      sales: parseInt(row.sales || row.vendas || row.Vendas || "0") || 0,
      spent: parseFloat(row.spent || row.investimento || "0") || 0,
      month: row.month || row.mes || row.Mês || null,
    }));

    const { data, error } = await supabase
      .from("utm_data")
      .insert(records)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ imported: data?.length || 0, type: "utm" }, { status: 201 });
  }

  return NextResponse.json({ error: "Tipo inválido. Use 'funnel' ou 'utm'" }, { status: 400 });
}
