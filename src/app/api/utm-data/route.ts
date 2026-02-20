import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/utm-data?month=Janeiro&metric=qualifiedLeads
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

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

  let query = supabase
    .from("utm_data")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("interactions", { ascending: false });

  if (month) query = query.eq("month", month);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by campaign, adset, creative
  const campaigns = groupBy(data || [], "utm_campaign");
  const adsets = groupBy(data || [], "utm_term");
  const creatives = groupBy(data || [], "utm_content");

  return NextResponse.json({ campaigns, adsets, creatives, raw: data });
}

// POST /api/utm-data — insert UTM data
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
  const records = Array.isArray(body) ? body : [body];

  const insertData = records.map((record) => ({
    ...record,
    organization_id: profile.organization_id,
  }));

  const { data, error } = await supabase
    .from("utm_data")
    .insert(insertData)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

interface UtmRow {
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  interactions: number;
  leads: number;
  qualified_leads: number;
  visits: number;
  sales: number;
  [key: string]: unknown;
}

function groupBy(data: UtmRow[], field: string) {
  const map = new Map<string, { name: string; interactions: number; leads: number; qualifiedLeads: number; visits: number; sales: number }>();

  for (const row of data) {
    const key = (row[field] as string) || "(sem valor)";
    const existing = map.get(key) || { name: key, interactions: 0, leads: 0, qualifiedLeads: 0, visits: 0, sales: 0 };
    existing.interactions += row.interactions || 0;
    existing.leads += row.leads || 0;
    existing.qualifiedLeads += row.qualified_leads || 0;
    existing.visits += row.visits || 0;
    existing.sales += row.sales || 0;
    map.set(key, existing);
  }

  const entries = Array.from(map.values());
  const totalInteractions = entries.reduce((s, e) => s + e.interactions, 0);

  return entries
    .map((e) => ({
      ...e,
      percentage: totalInteractions > 0 ? (e.interactions / totalInteractions) * 100 : 0,
    }))
    .sort((a, b) => b.interactions - a.interactions);
}
