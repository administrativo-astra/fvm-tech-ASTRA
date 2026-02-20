import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServerSupabaseAdmin } from "@/lib/supabase-server";

// PUT — change a user's role
export async function PUT(request: Request) {
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
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json({ error: "userId e role são obrigatórios" }, { status: 400 });
  }

  const validRoles = ["admin", "viewer"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Role inválido. Use: admin ou viewer" }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "Não é possível alterar seu próprio papel" }, { status: 400 });
  }

  // Verify target is in same org
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", userId)
    .single();

  if (!targetProfile || targetProfile.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Can't change owner role
  if (targetProfile.role === "owner") {
    return NextResponse.json({ error: "Não é possível alterar o papel do proprietário" }, { status: 403 });
  }

  const admin = await createServerSupabaseAdmin();

  // Update profiles
  const { error } = await admin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Keep user_organizations in sync
  await admin
    .from("user_organizations")
    .update({ role })
    .eq("user_id", userId)
    .eq("organization_id", profile.organization_id);

  return NextResponse.json({ message: "Papel atualizado com sucesso" });
}
