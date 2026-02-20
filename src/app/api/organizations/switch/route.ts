import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// POST — switch the user's active organization
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { organizationId } = body;

  if (!organizationId) {
    return NextResponse.json({ error: "organizationId é obrigatório" }, { status: 400 });
  }

  // Verify the user is a member of this org
  const { data: membership } = await supabase
    .from("user_organizations")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", organizationId)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Você não tem acesso a esta organização" }, { status: 403 });
  }

  // Update the active org and role on the profile
  const { error } = await supabase
    .from("profiles")
    .update({
      organization_id: organizationId,
      role: membership.role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Organização alterada com sucesso", role: membership.role });
}
