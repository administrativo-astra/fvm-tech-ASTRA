"use client";

import { useState } from "react";
import { formatNumber, formatPercent } from "@/lib/utils";
import { BarChart3, Layers, Layout, Megaphone } from "lucide-react";

export interface UtmEntry {
  name: string;
  value: number;
  percentage: number;
}

interface UtmAnalysisProps {
  title: string;
  totalLabel: string;
  totalValue: number;
  campaigns: UtmEntry[];
  adsets: UtmEntry[];
  creatives: UtmEntry[];
  variant?: "marketing" | "vendas";
  metricLabel?: string;
}

type TabKey = "campanha" | "conjunto" | "criativo";

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "campanha", label: "Campanha", icon: Megaphone },
  { key: "conjunto", label: "Conjunto", icon: Layers },
  { key: "criativo", label: "Criativo", icon: Layout },
];

export function UtmAnalysis({
  title,
  totalLabel,
  totalValue,
  campaigns,
  adsets,
  creatives,
  variant = "marketing",
  metricLabel = "Interações",
}: UtmAnalysisProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("campanha");

  const dataMap: Record<TabKey, UtmEntry[]> = {
    campanha: campaigns,
    conjunto: adsets,
    criativo: creatives,
  };

  const currentData = dataMap[activeTab];

  const accentColor = variant === "marketing" ? "orange" : "emerald";
  const barBg = variant === "marketing" ? "bg-orange-500" : "bg-emerald-500";
  const barBgFaded = variant === "marketing" ? "bg-orange-500/10" : "bg-emerald-500/10";
  const textAccent = variant === "marketing" ? "text-orange-400" : "text-emerald-400";
  const borderAccent = variant === "marketing" ? "border-orange-500/25" : "border-emerald-500/25";
  const bgAccent = variant === "marketing" ? "bg-orange-500/15" : "bg-emerald-500/15";
  const bgAccentFaded = variant === "marketing" ? "bg-orange-500/[0.04]" : "bg-emerald-500/[0.04]";

  return (
    <div className="rounded-2xl glass-strong overflow-hidden">
      {/* Header */}
      <div className={`border-b ${variant === "marketing" ? "border-orange-500/10" : "border-emerald-500/10"} ${bgAccentFaded} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BarChart3 className={`h-4 w-4 ${textAccent}`} />
            <h3 className={`text-sm font-semibold ${textAccent}`}>
              {title}
            </h3>
          </div>
          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? `${bgAccent} ${textAccent} border ${borderAccent}`
                    : "text-white/35 hover:text-white/55 hover:bg-white/[0.04]"
                }`}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="px-6 py-5 border-b border-white/[0.04]">
        <div className="rounded-xl glass p-4 text-center">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
            {totalLabel}
          </p>
          <p className="mt-1 text-3xl font-bold text-white/90">
            {formatNumber(totalValue)}
          </p>
        </div>
      </div>

      {/* Distribution */}
      <div className="px-6 py-4">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">
          Distribuição por {activeTab === "campanha" ? "Campanha" : activeTab === "conjunto" ? "Conjunto de Anúncio" : "Criativo"}
        </p>

        <div className="space-y-1">
          {currentData.map((item, i) => (
            <div
              key={i}
              className="group rounded-lg px-3 py-3 hover:bg-white/[0.02] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-medium text-white/65 group-hover:text-white/80 transition-colors truncate max-w-[70%]">
                  {item.name}
                </p>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-sm font-bold ${textAccent}`}>
                    {formatNumber(item.value)}
                  </span>
                  <span className="text-[10px] text-white/25 w-12 text-right">
                    {formatPercent(item.percentage)}
                  </span>
                </div>
              </div>
              <div className={`h-1.5 w-full rounded-full ${barBgFaded}`}>
                <div
                  className={`h-full rounded-full ${barBg} transition-all duration-500`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {currentData.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-white/25">Nenhum dado UTM disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
