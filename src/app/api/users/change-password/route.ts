import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// POST — change own password
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { newPassword } = body;

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "A nova senha deve ter pelo menos 6 caracteres" },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Senha alterada com sucesso" });
}
