"use client";

import { useEffect, useState, useCallback } from "react";

interface UtmEntry {
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (month) params.set("month", month);

      const res = await fetch(`/api/utm-data?${params}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Erro ao buscar UTM");
        return;
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

      setCampaigns(toEntries(json.campaigns || []));
      setAdsets(toEntries(json.adsets || []));
      setCreatives(toEntries(json.creatives || []));
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }, [month, metric]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = campaigns.reduce((s, c) => s + c.value, 0);

  return { campaigns, adsets, creatives, total, loading, error };
}
