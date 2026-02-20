import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { buildFacebookOAuthUrl } from "@/lib/facebook";

// GET — redirect user to Facebook OAuth
export async function GET() {
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

  // Build callback URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const redirectUri = `${baseUrl}/api/integrations/facebook/callback`;

  // State contains org_id + user_id for validation on callback
  const state = Buffer.from(
    JSON.stringify({ orgId: profile.organization_id, userId: user.id })
  ).toString("base64url");

  const oauthUrl = buildFacebookOAuthUrl(redirectUri, state);

  return NextResponse.redirect(oauthUrl);
}
