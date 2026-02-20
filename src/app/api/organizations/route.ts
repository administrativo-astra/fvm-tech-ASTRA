import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

// Admin client that doesn't depend on cookies
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — list all organizations the user belongs to
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Get current active org from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    const admin = getAdminClient();

    // Get all org memberships for this user
    const { data: memberships, error } = await admin
      .from("user_organizations")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message, detail: "user_organizations" }, { status: 500 });
    }

    // Fetch org details for each membership
    const orgIds = (memberships || []).map((m) => m.organization_id);

    let organizations: { id: string; name: string; slug: string; logo_url: string | null }[] | null = null;
    if (orgIds.length > 0) {
      const { data: orgsData, error: orgsError } = await admin
        .from("organizations")
        .select("id, name, slug, logo_url")
        .in("id", orgIds);
      if (orgsError) {
        return NextResponse.json({ error: orgsError.message, detail: "organizations" }, { status: 500 });
      }
      organizations = orgsData;
    }

    const orgMap = new Map((organizations || []).map((o) => [o.id, o]));

    const orgs = (memberships || []).map((m) => {
      const org = orgMap.get(m.organization_id);
      return {
        id: m.organization_id,
        name: org?.name || "Organização",
        slug: org?.slug || "",
        logo_url: org?.logo_url || null,
        role: m.role,
        is_active: m.organization_id === profile?.organization_id,
      };
    });

    return NextResponse.json({ data: orgs, activeOrgId: profile?.organization_id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, detail: "catch" }, { status: 500 });
  }
}

// POST — create a new organization
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const admin = getAdminClient();

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    + "-" + Date.now().toString(36);

  // Create the organization
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: name.trim(), slug })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  // Add user as owner in user_organizations
  const { error: memberError } = await admin
    .from("user_organizations")
    .insert({
      user_id: user.id,
      organization_id: org.id,
      role: "owner",
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Organização criada", orgId: org.id, name: org.name });
}
