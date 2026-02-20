import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { getValidToken, readSheetData, type GoogleSheetsConfig } from "@/lib/google-sheets";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST — import data from a Google Sheet into funnel_data or utm_data
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
  const { spreadsheetId, sheetName, targetTable } = body;

  if (!spreadsheetId || !sheetName) {
    return NextResponse.json({ error: "spreadsheetId e sheetName são obrigatórios" }, { status: 400 });
  }

  if (!["funnel_data", "utm_data"].includes(targetTable)) {
    return NextResponse.json({ error: "targetTable deve ser funnel_data ou utm_data" }, { status: 400 });
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

    // Read all data from the sheet
    const rows = await readSheetData(accessToken, spreadsheetId, `${sheetName}!A:Z`);

    if (rows.length < 2) {
      return NextResponse.json({ error: "Planilha vazia ou sem dados (precisa de cabeçalho + dados)" }, { status: 400 });
    }

    const headers = rows[0].map((h) => h.toString().trim().toLowerCase());
    const dataRows = rows.slice(1);

    let imported = 0;

    if (targetTable === "funnel_data") {
      imported = await importFunnelData(admin, profile.organization_id, headers, dataRows);
    } else {
      imported = await importUtmData(admin, profile.organization_id, headers, dataRows);
    }

    // Update last_sync_at
    await admin
      .from("integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", integration.id);

    return NextResponse.json({
      message: `Importados ${imported} registros para ${targetTable}`,
      imported,
      totalRows: dataRows.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Column name mapping for flexibility
const FUNNEL_COLUMN_MAP: Record<string, string> = {
  "mês": "month", "mes": "month", "month": "month",
  "semana": "week", "week": "week",
  "início": "period_start", "inicio": "period_start", "period_start": "period_start", "data_inicio": "period_start",
  "fim": "period_end", "period_end": "period_end", "data_fim": "period_end",
  "investido": "spent", "gasto": "spent", "spent": "spent", "valor": "spent",
  "impressões": "impressions", "impressoes": "impressions", "impressions": "impressions",
  "alcance": "reach", "reach": "reach",
  "cliques": "clicks", "clicks": "clicks",
  "leads": "leads",
  "leads qualificados": "qualified_leads", "qualified_leads": "qualified_leads", "qualificados": "qualified_leads",
  "visitas": "visits", "visits": "visits", "agendamentos": "visits",
  "follow up": "follow_up", "follow_up": "follow_up", "followup": "follow_up",
  "vendas": "sales", "sales": "sales",
};

const UTM_COLUMN_MAP: Record<string, string> = {
  "mês": "month", "mes": "month", "month": "month",
  "campanha": "utm_campaign", "utm_campaign": "utm_campaign", "campaign": "utm_campaign",
  "conjunto": "utm_term", "utm_term": "utm_term", "adset": "utm_term", "term": "utm_term",
  "criativo": "utm_content", "utm_content": "utm_content", "content": "utm_content", "anúncio": "utm_content", "anuncio": "utm_content",
  "fonte": "utm_source", "utm_source": "utm_source", "source": "utm_source",
  "mídia": "utm_medium", "midia": "utm_medium", "utm_medium": "utm_medium", "medium": "utm_medium",
  "interações": "interactions", "interacoes": "interactions", "interactions": "interactions",
  "leads": "leads",
  "leads qualificados": "qualified_leads", "qualified_leads": "qualified_leads", "qualificados": "qualified_leads",
  "visitas": "visits", "visits": "visits",
  "vendas": "sales", "sales": "sales",
  "investido": "spent", "gasto": "spent", "spent": "spent",
};

function mapHeaders(headers: string[], columnMap: Record<string, string>): (string | null)[] {
  return headers.map((h) => columnMap[h] || null);
}

async function importFunnelData(
  admin: ReturnType<typeof getAdminClient>,
  orgId: string,
  headers: string[],
  rows: string[][]
) {
  const mappedHeaders = mapHeaders(headers, FUNNEL_COLUMN_MAP);
  let imported = 0;

  for (const row of rows) {
    const record: Record<string, unknown> = { organization_id: orgId, source: "csv_import" };

    for (let i = 0; i < row.length; i++) {
      const col = mappedHeaders[i];
      if (!col || !row[i]) continue;

      const val = row[i].toString().trim();
      if (["spent"].includes(col)) {
        record[col] = parseFloat(val.replace(/[^\d.,\-]/g, "").replace(",", ".")) || 0;
      } else if (["impressions", "reach", "clicks", "leads", "qualified_leads", "visits", "follow_up", "sales"].includes(col)) {
        record[col] = parseInt(val.replace(/\D/g, ""), 10) || 0;
      } else {
        record[col] = val;
      }
    }

    // Minimum required fields
    if (!record.month || !record.period_start || !record.period_end) continue;

    await admin.from("funnel_data").insert(record);
    imported++;
  }

  return imported;
}

async function importUtmData(
  admin: ReturnType<typeof getAdminClient>,
  orgId: string,
  headers: string[],
  rows: string[][]
) {
  const mappedHeaders = mapHeaders(headers, UTM_COLUMN_MAP);
  let imported = 0;

  for (const row of rows) {
    const record: Record<string, unknown> = { organization_id: orgId };

    for (let i = 0; i < row.length; i++) {
      const col = mappedHeaders[i];
      if (!col || !row[i]) continue;

      const val = row[i].toString().trim();
      if (["spent"].includes(col)) {
        record[col] = parseFloat(val.replace(/[^\d.,\-]/g, "").replace(",", ".")) || 0;
      } else if (["interactions", "leads", "qualified_leads", "visits", "sales"].includes(col)) {
        record[col] = parseInt(val.replace(/\D/g, ""), 10) || 0;
      } else {
        record[col] = val;
      }
    }

    if (!record.utm_campaign) continue;

    await admin.from("utm_data").insert(record);
    imported++;
  }

  return imported;
}
