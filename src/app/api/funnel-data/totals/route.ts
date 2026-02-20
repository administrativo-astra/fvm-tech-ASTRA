import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// GET /api/funnel-data/totals?month=Janeiro
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
    .from("funnel_data")
    .select("spent, impressions, reach, clicks, leads, qualified_leads, visits, follow_up, sales")
    .eq("organization_id", profile.organization_id);

  if (month) query = query.eq("month", month);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate totals
  const totals = (data || []).reduce(
    (acc, row) => ({
      spent: acc.spent + Number(row.spent),
      impressions: acc.impressions + row.impressions,
      reach: acc.reach + row.reach,
      clicks: acc.clicks + row.clicks,
      leads: acc.leads + row.leads,
      qualifiedLeads: acc.qualifiedLeads + row.qualified_leads,
      visits: acc.visits + row.visits,
      followUp: acc.followUp + row.follow_up,
      sales: acc.sales + row.sales,
    }),
    {
      spent: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      leads: 0,
      qualifiedLeads: 0,
      visits: 0,
      followUp: 0,
      sales: 0,
    }
  );

  // Get available months
  const { data: months } = await supabase
    .from("funnel_data")
    .select("month")
    .eq("organization_id", profile.organization_id)
    .order("period_start", { ascending: true });

  const uniqueMonths = [...new Set((months || []).map((m) => m.month))];

  return NextResponse.json({ totals, months: uniqueMonths, weeklyData: data });
}
