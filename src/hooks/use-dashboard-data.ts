"use client";

import { useEffect, useState, useCallback } from "react";
import { mockData, getMonthTotals, getUtmAnalysis, getUtmTotal } from "@/lib/mock-data";
import type { UtmEntry } from "@/components/utm-analysis";

interface FunnelTotals {
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

interface WeekRow {
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

interface MonthEntry {
  month: string;
  weeks: WeekRow[];
}

interface DashboardData {
  months: MonthEntry[];
  selectedMonthIndex: number;
  setSelectedMonthIndex: (i: number) => void;
  totals: FunnelTotals;
  currentMonth: MonthEntry;
  loading: boolean;
  isLive: boolean;
}

export function useDashboardData(): DashboardData {
  const [liveData, setLiveData] = useState<MonthEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const fetchLiveData = useCallback(async () => {
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

      const months: MonthEntry[] = Array.from(monthMap.entries()).map(([month, weeks]) => ({
        month,
        weeks,
      }));

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
  const currentMonth = months[selectedMonthIndex] || months[0];

  const totals = currentMonth
    ? currentMonth.weeks.reduce(
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
        { spent: 0, impressions: 0, reach: 0, clicks: 0, leads: 0, qualifiedLeads: 0, visits: 0, followUp: 0, sales: 0 }
      )
    : { spent: 0, impressions: 0, reach: 0, clicks: 0, leads: 0, qualifiedLeads: 0, visits: 0, followUp: 0, sales: 0 };

  return {
    months,
    selectedMonthIndex,
    setSelectedMonthIndex,
    totals,
    currentMonth,
    loading,
    isLive,
  };
}

interface UtmDashboardData {
  getUtm: (month: string, metric: "leads" | "qualifiedLeads" | "visits" | "sales") => {
    campaigns: UtmEntry[];
    adsets: UtmEntry[];
    creatives: UtmEntry[];
    total: number;
  };
}

export function useUtmDashboard(): UtmDashboardData {
  // For now returns mock data — will switch to live when data is imported
  function getUtm(month: string, metric: "leads" | "qualifiedLeads" | "visits" | "sales") {
    const data = getUtmAnalysis(month, metric);
    const total = getUtmTotal(month, metric);
    return { ...data, total };
  }

  return { getUtm };
}
