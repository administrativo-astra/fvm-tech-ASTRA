import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exchangeGoogleCode, getGoogleUserInfo } from "@/lib/google-sheets";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — Google OAuth callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  if (error) {
    return NextResponse.redirect(`${baseUrl}/integracoes?error=google_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/integracoes?error=google_missing_params`);
  }

  let orgId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    orgId = decoded.orgId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/integracoes?error=google_invalid_state`);
  }

  try {
    const redirectUri = `${baseUrl}/api/integrations/google-sheets/callback`;

    const { access_token, refresh_token, expires_in } = await exchangeGoogleCode(code, redirectUri);

    const userInfo = await getGoogleUserInfo(access_token);

    const config = {
      access_token,
      refresh_token,
      token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      user_email: userInfo.email,
      user_name: userInfo.name,
    };

    const admin = getAdminClient();
    const { error: dbError } = await admin
      .from("integrations")
      .upsert({
        organization_id: orgId,
        provider: "google_sheets",
        config,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "organization_id,provider" });

    if (dbError) {
      console.error("DB error saving Google Sheets integration:", dbError);
      return NextResponse.redirect(`${baseUrl}/integracoes?error=google_db_error`);
    }

    return NextResponse.redirect(`${baseUrl}/integracoes?success=google_sheets`);
  } catch (err) {
    console.error("Google Sheets callback error:", err);
    return NextResponse.redirect(`${baseUrl}/integracoes?error=google_token_error`);
  }
}
