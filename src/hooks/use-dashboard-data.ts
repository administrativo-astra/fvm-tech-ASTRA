"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { mockData, getMonthTotals, getAllTotals as mockGetAllTotals } from "@/lib/mock-data";

// ─── Types ───────────────────────────────────────────────────────────────

export interface FunnelTotals {
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  followUp: number;
  sales: number;
}

export interface WeekRow {
  week: string;
  spent: number;
  reach: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  followUp: number;
  sales: number;
}

export interface MonthEntry {
  month: string;
  weeks: WeekRow[];
}

export type Comparison = Record<keyof FunnelTotals, number> | null;

export interface DashboardData {
  months: MonthEntry[];
  selectedMonthIndex: number; // -1 = Todos
  setSelectedMonthIndex: (i: number) => void;
  totals: FunnelTotals;
  allTotals: FunnelTotals;
  currentMonth: MonthEntry | null;
  comparison: Comparison;
  monthlyEvolution: MonthEvoRow[];
  weeklyEvolution: WeekEvoRow[];
  loading: boolean;
  isLive: boolean;
  refetch: () => void;
}

interface MonthEvoRow {
  name: string;
  spent: number;
  reach: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  followUp: number;
  sales: number;
}

interface WeekEvoRow {
  name: string;
  leads: number;
  qualifiedLeads: number;
  visits: number;
  sales: number;
  spent: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const EMPTY_TOTALS: FunnelTotals = {
  spent: 0, impressions: 0, reach: 0, clicks: 0,
  leads: 0, qualifiedLeads: 0, visits: 0, followUp: 0, sales: 0,
};

function sumWeeks(weeks: WeekRow[]): FunnelTotals {
  return weeks.reduce(
    (acc, w) => ({
      spent: acc.spent + w.spent,
      impressions: acc.impressions + w.impressions,
      reach: acc.reach + w.reach,
      clicks: acc.clicks + w.clicks,
      leads: acc.leads + w.leads,
      qualifiedLeads: acc.qualifiedLeads + w.qualifiedLeads,
      visits: acc.visits + w.visits,
      followUp: acc.followUp + w.followUp,
      sales: acc.sales + w.sales,
    }),
    { ...EMPTY_TOTALS },
  );
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

function buildComparison(current: FunnelTotals, previous: FunnelTotals): Comparison {
  return {
    spent: pctChange(current.spent, previous.spent),
    reach: pctChange(current.reach, previous.reach),
    impressions: pctChange(current.impressions, previous.impressions),
    clicks: pctChange(current.clicks, previous.clicks),
    leads: pctChange(current.leads, previous.leads),
    qualifiedLeads: pctChange(current.qualifiedLeads, previous.qualifiedLeads),
    visits: pctChange(current.visits, previous.visits),
    followUp: pctChange(current.followUp, previous.followUp),
    sales: pctChange(current.sales, previous.sales),
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useDashboardData(): DashboardData {
  const [liveData, setLiveData] = useState<MonthEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(-1); // -1 = Todos

  const fetchLiveData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/funnel-data/totals");
      if (!res.ok) throw new Error("API error");

      const json = await res.json();
      const weeklyData = json.weeklyData || [];

      if (weeklyData.length === 0) {
        setLiveData(null);
        return;
      }

      // Group by month
      const monthMap = new Map<string, WeekRow[]>();
      for (const row of weeklyData) {
        const month = row.month || "Sem mês";
        if (!monthMap.has(month)) monthMap.set(month, []);
        monthMap.get(month)!.push({
          week: row.week || "",
          spent: Number(row.spent) || 0,
          reach: row.reach || 0,
          impressions: row.impressions || 0,
          clicks: row.clicks || 0,
          leads: row.leads || 0,
          qualifiedLeads: row.qualified_leads || 0,
          visits: row.visits || 0,
          followUp: row.follow_up || 0,
          sales: row.sales || 0,
        });
      }

      const months: MonthEntry[] = Array.from(monthMap.entries()).map(
        ([month, weeks]) => ({ month, weeks }),
      );

      setLiveData(months);
    } catch {
      setLiveData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Use live data if available, otherwise mock
  const isLive = liveData !== null && liveData.length > 0;
  const months = isLive ? liveData : mockData;

  const isAll = selectedMonthIndex === -1;
  const currentMonth = isAll ? null : (months[selectedMonthIndex] || months[0]);

  // Totals — selected month or all
  const totals = useMemo(() => {
    if (isAll) {
      if (isLive) {
        return sumWeeks(months.flatMap((m) => m.weeks));
      }
      return mockGetAllTotals();
    }
    const m = months[selectedMonthIndex] || months[0];
    return m ? (isLive ? sumWeeks(m.weeks) : getMonthTotals(m)) : EMPTY_TOTALS;
  }, [months, selectedMonthIndex, isAll, isLive]);

  // All totals (always all months combined)
  const allTotals = useMemo(() => {
    if (isLive) return sumWeeks(months.flatMap((m) => m.weeks));
    return mockGetAllTotals();
  }, [months, isLive]);

  // Comparison with previous month
  const comparison: Comparison = useMemo(() => {
    if (isAll) {
      // Compare last month vs second-to-last
      if (months.length < 2) return null;
      const curr = sumWeeks(months[months.length - 1].weeks);
      const prev = sumWeeks(months[months.length - 2].weeks);
      return buildComparison(curr, prev);
    }
    const idx = selectedMonthIndex;
    if (idx <= 0) return null;
    const curr = sumWeeks(months[idx].weeks);
    const prev = sumWeeks(months[idx - 1].weeks);
    return buildComparison(curr, prev);
  }, [months, selectedMonthIndex, isAll]);

  // Monthly evolution for charts
  const monthlyEvolution: MonthEvoRow[] = useMemo(() => {
    return months.map((m) => {
      const t = sumWeeks(m.weeks);
      return { name: m.month, ...t };
    });
  }, [months]);

  // Weekly evolution for charts (all weeks across all months)
  const weeklyEvolution: WeekEvoRow[] = useMemo(() => {
    const result: WeekEvoRow[] = [];
    months.forEach((m) => {
      m.weeks.forEach((w) => {
        result.push({
          name: `${m.month.slice(0, 3)} ${w.week.replace("Semana ", "S")}`,
          leads: w.leads,
          qualifiedLeads: w.qualifiedLeads,
          visits: w.visits,
          sales: w.sales,
          spent: w.spent,
        });
      });
    });
    return result;
  }, [months]);

  return {
    months,
    selectedMonthIndex,
    setSelectedMonthIndex,
    totals,
    allTotals,
    currentMonth,
    comparison,
    monthlyEvolution,
    weeklyEvolution,
    loading,
    isLive,
    refetch: fetchLiveData,
  };
}
