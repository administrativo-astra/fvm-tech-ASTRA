import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/funnel-data?month=Janeiro&campaign_id=xxx
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Get user's organization
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get("month");
  const campaignId = searchParams.get("campaign_id");

  let query = supabase
    .from("funnel_data")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("period_start", { ascending: true });

  if (month) query = query.eq("month", month);
  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST /api/funnel-data — insert or upsert funnel data
export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 });
  }

  if (!["owner", "admin", "editor"].includes(profile.role)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();

  // Support single or batch insert
  const records = Array.isArray(body) ? body : [body];

  const insertData = records.map((record) => ({
    ...record,
    organization_id: profile.organization_id,
  }));

  const { data, error } = await supabase
    .from("funnel_data")
    .upsert(insertData, {
      onConflict: "organization_id,campaign_id,period_start,period_end",
    })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
