import { NextResponse } from "next/server";
import { createServerSupabaseClient, createServerSupabaseAdmin } from "@/lib/supabase-server";

// GET — list all users in the current org
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

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "Sem organização" }, { status: 400 });
  }

  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, created_at")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch emails from auth (needs admin client)
  const admin = await createServerSupabaseAdmin();
  const enriched = await Promise.all(
    (members || []).map(async (member) => {
      const { data } = await admin.auth.admin.getUserById(member.id);
      return {
        ...member,
        email: data?.user?.email || null,
        is_self: member.id === user.id,
      };
    })
  );

  return NextResponse.json({
    data: enriched,
    currentRole: profile.role,
  });
}

// POST — invite a new user to the org
export async function POST(request: Request) {
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
  const { email, role, full_name } = body;

  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }

  const assignedRole = role === "admin" ? "admin" : "viewer";

  const admin = await createServerSupabaseAdmin();

  // Check if user already exists in auth
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    // Check if already in this org
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, organization_id")
      .eq("id", existingUser.id)
      .single();

    if (existingProfile?.organization_id === profile.organization_id) {
      return NextResponse.json({ error: "Usuário já está nesta organização" }, { status: 409 });
    }

    // Add to user_organizations junction table
    const { error: junctionErr } = await admin
      .from("user_organizations")
      .upsert({
        user_id: existingUser.id,
        organization_id: profile.organization_id,
        role: assignedRole,
      }, { onConflict: "user_id,organization_id" });

    if (junctionErr) {
      return NextResponse.json({ error: junctionErr.message }, { status: 500 });
    }

    // Switch their active org to this one
    const { error: updateErr } = await admin
      .from("profiles")
      .update({
        organization_id: profile.organization_id,
        role: assignedRole,
        full_name: full_name || existingProfile?.id,
      })
      .eq("id", existingUser.id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Usuário existente adicionado à organização" });
  }

  // Create new user with invite
  const tempPassword = crypto.randomUUID().slice(0, 12) + "Aa1!";

  const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: full_name || email.split("@")[0],
    },
  });

  if (createErr) {
    return NextResponse.json({ error: createErr.message }, { status: 500 });
  }

  if (newUser?.user) {
    // Add to user_organizations junction table
    await admin
      .from("user_organizations")
      .upsert({
        user_id: newUser.user.id,
        organization_id: profile.organization_id,
        role: assignedRole,
      }, { onConflict: "user_id,organization_id" });

    // Update profile with org and role
    const { error: profileErr } = await admin
      .from("profiles")
      .update({
        organization_id: profile.organization_id,
        role: assignedRole,
        full_name: full_name || email.split("@")[0],
      })
      .eq("id", newUser.user.id);

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    message: "Usuário criado com sucesso",
    tempPassword,
    email,
  });
}

// DELETE — remove a user from the org
export async function DELETE(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Não é possível remover a si mesmo" }, { status: 400 });
  }

  // Check target user is in same org
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", targetUserId)
    .single();

  if (!targetProfile || targetProfile.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: "Usuário não encontrado nesta organização" }, { status: 404 });
  }

  // Owners can't be removed by admins
  if (targetProfile.role === "owner" && profile.role !== "owner") {
    return NextResponse.json({ error: "Não é possível remover o proprietário" }, { status: 403 });
  }

  // Remove from user_organizations
  const admin = await createServerSupabaseAdmin();
  await admin
    .from("user_organizations")
    .delete()
    .eq("user_id", targetUserId)
    .eq("organization_id", profile.organization_id);

  // If this was their active org, switch to another or set null
  const { data: otherOrgs } = await admin
    .from("user_organizations")
    .select("organization_id, role")
    .eq("user_id", targetUserId)
    .limit(1)
    .single();

  const { error } = await admin
    .from("profiles")
    .update({
      organization_id: otherOrgs?.organization_id || null,
      role: otherOrgs?.role || "viewer",
    })
    .eq("id", targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Usuário removido da organização" });
}
