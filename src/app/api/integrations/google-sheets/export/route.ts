import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { getValidToken, writeSheetData, type GoogleSheetsConfig } from "@/lib/google-sheets";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST — export funnel_data or utm_data to a Google Sheet
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

  const body = await request.json();
  const { spreadsheetId, sheetName, sourceTable, month } = body;

  if (!spreadsheetId || !sheetName) {
    return NextResponse.json({ error: "spreadsheetId e sheetName são obrigatórios" }, { status: 400 });
  }

  if (!["funnel_data", "utm_data"].includes(sourceTable)) {
    return NextResponse.json({ error: "sourceTable deve ser funnel_data ou utm_data" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: integration } = await admin
    .from("integrations")
    .select("id, config, is_active")
    .eq("organization_id", profile.organization_id)
    .eq("provider", "google_sheets")
    .single();

  if (!integration?.is_active) {
    return NextResponse.json({ error: "Google Planilhas não conectado" }, { status: 400 });
  }

  const config = integration.config as GoogleSheetsConfig;

  try {
    const { accessToken, refreshed, newExpiresAt } = await getValidToken(config);

    if (refreshed && newExpiresAt) {
      await admin
        .from("integrations")
        .update({ config: { ...config, access_token: accessToken, token_expires_at: newExpiresAt } })
        .eq("id", integration.id);
    }

    let values: (string | number)[][] = [];

    if (sourceTable === "funnel_data") {
      let query = admin
        .from("funnel_data")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("period_start", { ascending: true });

      if (month) query = query.eq("month", month);

      const { data: rows } = await query;

      // Header
      values.push(["Mês", "Semana", "Início", "Fim", "Investido", "Impressões", "Alcance", "Cliques", "Leads", "Qualificados", "Visitas", "Follow Up", "Vendas"]);

      for (const row of rows || []) {
        values.push([
          row.month, row.week, row.period_start, row.period_end,
          row.spent, row.impressions, row.reach, row.clicks,
          row.leads, row.qualified_leads, row.visits, row.follow_up, row.sales,
        ]);
      }
    } else {
      let query = admin
        .from("utm_data")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });

      if (month) query = query.eq("month", month);

      const { data: rows } = await query;

      values.push(["Mês", "Fonte", "Mídia", "Campanha", "Conjunto", "Criativo", "Interações", "Leads", "Qualificados", "Visitas", "Vendas", "Investido"]);

      for (const row of rows || []) {
        values.push([
          row.month || "", row.utm_source || "", row.utm_medium || "",
          row.utm_campaign || "", row.utm_term || "", row.utm_content || "",
          row.interactions, row.leads, row.qualified_leads, row.visits, row.sales, row.spent,
        ]);
      }
    }

    const range = `${sheetName}!A1`;
    const result = await writeSheetData(accessToken, spreadsheetId, range, values);

    await admin
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    return NextResponse.json({
      message: `Exportados ${values.length - 1} registros para a planilha`,
      exported: values.length - 1,
      updatedCells: result.updatedCells,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
