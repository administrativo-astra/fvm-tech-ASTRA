import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { getValidToken, listSpreadsheets, getSheetNames, type GoogleSheetsConfig } from "@/lib/google-sheets";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — list user's spreadsheets, optionally with sheet tabs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spreadsheetId = searchParams.get("spreadsheetId");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "Sem organização" }, { status: 400 });
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
    // Auto-refresh token if needed
    const { accessToken, refreshed, newExpiresAt } = await getValidToken(config);

    if (refreshed && newExpiresAt) {
      await admin
        .from("integrations")
        .update({
          config: { ...config, access_token: accessToken, token_expires_at: newExpiresAt },
        })
        .eq("id", integration.id);
    }

    // If spreadsheetId provided, return sheet tabs
    if (spreadsheetId) {
      const sheets = await getSheetNames(accessToken, spreadsheetId);
      return NextResponse.json({ sheets });
    }

    // Otherwise list spreadsheets
    const spreadsheets = await listSpreadsheets(accessToken);
    return NextResponse.json({ spreadsheets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
