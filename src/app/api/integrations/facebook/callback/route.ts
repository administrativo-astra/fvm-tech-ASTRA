import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exchangeCodeForToken, getFacebookUserAndAdAccounts } from "@/lib/facebook";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — Facebook OAuth callback
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  // User denied access
  if (error) {
    return NextResponse.redirect(`${baseUrl}/integracoes?error=denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/integracoes?error=missing_params`);
  }

  // Decode state
  let orgId: string;
  let userId: string;
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    orgId = decoded.orgId;
    userId = decoded.userId;
  } catch {
    return NextResponse.redirect(`${baseUrl}/integracoes?error=invalid_state`);
  }

  try {
    const redirectUri = `${baseUrl}/api/integrations/facebook/callback`;

    // Exchange code for token
    const { access_token, expires_in } = await exchangeCodeForToken(code, redirectUri);

    // Get user info and ad accounts
    const { user, adAccounts } = await getFacebookUserAndAdAccounts(access_token);

    if (adAccounts.length === 0) {
      return NextResponse.redirect(`${baseUrl}/integracoes?error=no_ad_accounts`);
    }

    // Use the first ad account (user can change later)
    const primaryAccount = adAccounts[0];

    const config = {
      access_token,
      ad_account_id: primaryAccount.id,
      ad_account_name: primaryAccount.name,
      token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      user_name: user.name,
      user_id: user.id,
      ad_accounts: adAccounts,
    };

    // Save to integrations table
    const admin = getAdminClient();
    const { error: dbError } = await admin
      .from("integrations")
      .upsert({
        organization_id: orgId,
        provider: "facebook_ads",
        config,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "organization_id,provider" });

    if (dbError) {
      console.error("DB error saving FB integration:", dbError);
      return NextResponse.redirect(`${baseUrl}/integracoes?error=db_error`);
    }

    return NextResponse.redirect(`${baseUrl}/integracoes?success=facebook`);
  } catch (err) {
    console.error("Facebook callback error:", err);
    return NextResponse.redirect(`${baseUrl}/integracoes?error=token_error`);
  }
}
