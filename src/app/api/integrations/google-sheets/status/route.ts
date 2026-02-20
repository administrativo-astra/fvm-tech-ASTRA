import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET — check Google Sheets integration status
export async function GET() {
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

  const { data: integration } = await supabase
    .from("integrations")
    .select("id, config, is_active, last_sync_at, created_at")
    .eq("organization_id", profile.organization_id)
    .eq("provider", "google_sheets")
    .single();

  if (!integration) {
    return NextResponse.json({ connected: false });
  }

  const config = integration.config as Record<string, unknown> || {};

  return NextResponse.json({
    connected: integration.is_active,
    userEmail: config.user_email || null,
    userName: config.user_name || null,
    lastSyncAt: integration.last_sync_at,
    connectedAt: integration.created_at,
  });
}
