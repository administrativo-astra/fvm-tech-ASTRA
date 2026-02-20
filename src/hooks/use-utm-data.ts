"use client";

import { useEffect, useState, useCallback } from "react";
import { getUtmAnalysis, getUtmTotal } from "@/lib/mock-data";

export interface UtmEntry {
  name: string;
  value: number;
  percentage: number;
}

interface UseUtmDataReturn {
  campaigns: UtmEntry[];
  adsets: UtmEntry[];
  creatives: UtmEntry[];
  total: number;
  loading: boolean;
  error: string | null;
  isLive: boolean;
}

export function useUtmData(
  month: string | null,
  metric: "leads" | "qualifiedLeads" | "visits" | "sales" | "interactions"
): UseUtmDataReturn {
  const [campaigns, setCampaigns] = useState<UtmEntry[]>([]);
  const [adsets, setAdsets] = useState<UtmEntry[]>([]);
  const [creatives, setCreatives] = useState<UtmEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (month) params.set("month", month);

      const res = await fetch(`/api/utm-data?${params}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro ao buscar UTM");
      }

      // Map the metric to the right field
      const metricMap: Record<string, string> = {
        leads: "leads",
        qualifiedLeads: "qualifiedLeads",
        visits: "visits",
        sales: "sales",
        interactions: "interactions",
      };
      const field = metricMap[metric] || "interactions";

      function toEntries(items: Record<string, number | string>[]): UtmEntry[] {
        const total = items.reduce((s, i) => s + (Number(i[field]) || 0), 0);
        return items
          .map((i) => ({
            name: String(i.name),
            value: Number(i[field]) || 0,
            percentage: total > 0 ? ((Number(i[field]) || 0) / total) * 100 : 0,
          }))
          .sort((a, b) => b.value - a.value);
      }

      const c = toEntries(json.campaigns || []);
      const a = toEntries(json.adsets || []);
      const cr = toEntries(json.creatives || []);

      // If API returned real data, use it
      if (c.length > 0 || a.length > 0 || cr.length > 0) {
        setCampaigns(c);
        setAdsets(a);
        setCreatives(cr);
        setIsLive(true);
        return;
      }

      // Fallback to mock data
      useMockFallback();
    } catch {
      // Fallback to mock data on error
      useMockFallback();
    } finally {
      setLoading(false);
    }

    function useMockFallback() {
      if (!month) {
        setCampaigns([]);
        setAdsets([]);
        setCreatives([]);
        setIsLive(false);
        return;
      }
      const mockMetric = metric === "interactions" ? "interactions" : metric;
      const data = getUtmAnalysis(month, mockMetric);
      const total = getUtmTotal(month, mockMetric);
      setCampaigns(data.campaigns || []);
      setAdsets(data.adsets || []);
      setCreatives(data.creatives || []);
      setIsLive(false);
      // total is derived below
      void total;
    }
  }, [month, metric]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = campaigns.reduce((s, c) => s + c.value, 0);

  return { campaigns, adsets, creatives, total, loading, error, isLive };
}
