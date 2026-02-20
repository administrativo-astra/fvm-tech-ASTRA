"use client";

import { useEffect, useState, useCallback } from "react";

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

interface WeeklyRow {
  id: string;
  week: string;
  month: string;
  spent: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  qualified_leads: number;
  visits: number;
  follow_up: number;
  sales: number;
}

interface UseFunnelDataReturn {
  totals: FunnelTotals;
  weeklyData: WeeklyRow[];
  months: string[];
  loading: boolean;
  error: string | null;
  selectedMonth: string | null;
  setSelectedMonth: (month: string | null) => void;
}

const emptyTotals: FunnelTotals = {
  spent: 0,
  impressions: 0,
  reach: 0,
  clicks: 0,
  leads: 0,
  qualifiedLeads: 0,
  visits: 0,
  followUp: 0,
  sales: 0,
};

export function useFunnelData(): UseFunnelDataReturn {
  const [totals, setTotals] = useState<FunnelTotals>(emptyTotals);
  const [weeklyData, setWeeklyData] = useState<WeeklyRow[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedMonth) params.set("month", selectedMonth);

      const res = await fetch(`/api/funnel-data/totals?${params}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao buscar dados");
        return;
      }

      setTotals(json.totals || emptyTotals);
      setWeeklyData(json.weeklyData || []);
      setMonths(json.months || []);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { totals, weeklyData, months, loading, error, selectedMonth, setSelectedMonth };
}
