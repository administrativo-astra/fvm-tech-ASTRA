import { NextResponse } from "next/server";
import { createServerSupabaseAdmin } from "@/lib/supabase-server";

// POST /api/setup — one-time setup to create owner account + organization
// DELETE THIS FILE after using it
export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, full_name, org_name, secret } = body;

  // Basic protection
  if (secret !== "astra-setup-2025") {
    return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
  }

  const admin = await createServerSupabaseAdmin();

  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, org_name },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const userId = authData.user.id;

  // 2. Create organization
  const slug = org_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: org_name, slug })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json({ error: orgError.message, step: "org" }, { status: 500 });
  }

  // 3. Update profile with org + owner role
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      organization_id: org.id,
      role: "owner",
      full_name,
    })
    .eq("id", userId);

  if (profileError) {
    // Profile might not exist yet (trigger delay), try insert
    const { error: insertError } = await admin
      .from("profiles")
      .upsert({
        id: userId,
        organization_id: org.id,
        role: "owner",
        full_name,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message, step: "profile" }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: "Conta de proprietário criada com sucesso!",
    email,
    org: org.name,
    orgId: org.id,
    userId,
  });
}
