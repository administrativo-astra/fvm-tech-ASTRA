import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET — check Facebook integration status
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
    .select("id, provider, config, is_active, last_sync_at, created_at")
    .eq("organization_id", profile.organization_id)
    .eq("provider", "facebook_ads")
    .single();

  if (!integration) {
    return NextResponse.json({ connected: false });
  }

  const config = integration.config as Record<string, unknown> || {};

  // Check if token is expired
  const tokenExpiresAt = config.token_expires_at as string | undefined;
  const isExpired = tokenExpiresAt ? new Date(tokenExpiresAt) < new Date() : false;

  return NextResponse.json({
    connected: integration.is_active && !isExpired,
    isExpired,
    adAccountName: config.ad_account_name || null,
    adAccountId: config.ad_account_id || null,
    userName: config.user_name || null,
    adAccounts: config.ad_accounts || [],
    lastSyncAt: integration.last_sync_at,
    connectedAt: integration.created_at,
  });
}
