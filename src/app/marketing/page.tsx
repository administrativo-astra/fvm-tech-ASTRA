"use client";

import { MetricCard } from "@/components/metric-card";
import { FunnelVisual } from "@/components/funnel-visual";
import { UtmAnalysis } from "@/components/utm-analysis";
import { mockData, getMonthTotals, getUtmAnalysis, getUtmTotal } from "@/lib/mock-data";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  calcCTR,
  calcCPM,
  calcCPC,
  calcCPL,
  calcRate,
} from "@/lib/utils";
import { useState } from "react";

export default function MarketingPage() {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const month = mockData[selectedMonth];
  const totals = getMonthTotals(month);

  const ctr = calcCTR(totals.clicks, totals.impressions);
  const cpm = calcCPM(totals.spent, totals.impressions);
  const cpc = calcCPC(totals.spent, totals.clicks);
  const cpl = calcCPL(totals.spent, totals.leads);

  const [utmMetric, setUtmMetric] = useState<"leads" | "qualifiedLeads">("qualifiedLeads");
  const utmData = getUtmAnalysis(month.month, utmMetric);
  const utmTotal = getUtmTotal(month.month, utmMetric);
  const frequency =
    totals.reach > 0 ? (totals.impressions / totals.reach).toFixed(2) : "0";

  const marketingFunnelSteps = [
    {
      label: "Valor Usado",
      value: formatCurrency(totals.spent),
      costLabel: "CPM",
      costValue: formatCurrency(cpm),
    },
    {
      label: "Alcance",
      value: formatNumber(totals.reach),
      costLabel: "Frequência",
      costValue: String(frequency),
    },
    {
      label: "Impressões",
      value: formatNumber(totals.impressions),
      rate: formatPercent(calcRate(totals.reach, totals.impressions)),
      costLabel: "CPC",
      costValue: formatCurrency(cpc),
    },
    {
      label: "Cliques",
      value: formatNumber(totals.clicks),
      rate: `CTR: ${formatPercent(ctr)}`,
      costLabel: "CTR",
      costValue: formatPercent(ctr),
    },
    {
      label: "Resultado / Leads",
      value: formatNumber(totals.leads),
      rate: formatPercent(calcRate(totals.clicks, totals.leads)),
      costLabel: "CPL",
      costValue: formatCurrency(cpl),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Funil de Marketing
          </h2>
          <p className="text-sm text-white/35">
            Métricas de desempenho das campanhas de marketing digital
          </p>
        </div>
        <div className="flex gap-2">
          {mockData.map((m, i) => (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(i)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedMonth === i
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/25 shadow-[0_0_10px_-3px_rgba(255,165,0,0.2)]"
                  : "glass text-white/40 hover:text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {m.month}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <MetricCard
          label="Investimento"
          value={formatCurrency(totals.spent)}
          variant="marketing"
          size="sm"
        />
        <MetricCard
          label="Alcance"
          value={formatNumber(totals.reach)}
          variant="marketing"
          size="sm"
        />
        <MetricCard
          label="Impressões"
          value={formatNumber(totals.impressions)}
          variant="marketing"
          size="sm"
        />
        <MetricCard
          label="Cliques"
          value={formatNumber(totals.clicks)}
          variant="marketing"
          size="sm"
        />
        <MetricCard
          label="Leads"
          value={formatNumber(totals.leads)}
          variant="marketing"
          size="sm"
        />
        <MetricCard
          label="CTR"
          value={formatPercent(ctr)}
          size="sm"
        />
        <MetricCard
          label="CPC"
          value={formatCurrency(cpc)}
          size="sm"
        />
        <MetricCard
          label="CPL"
          value={formatCurrency(cpl)}
          size="sm"
        />
      </div>

      {/* Marketing Funnel Visual */}
      <div className="rounded-2xl glass-strong p-6">
        <FunnelVisual
          title={`Funil de Marketing - ${month.month}`}
          steps={marketingFunnelSteps}
          direction="horizontal"
          variant="marketing"
        />
      </div>

      {/* UTM Analysis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Analisar por:</span>
          <button
            onClick={() => setUtmMetric("leads")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
              utmMetric === "leads"
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                : "text-white/35 hover:text-white/55 hover:bg-white/[0.04]"
            }`}
          >
            Leads
          </button>
          <button
            onClick={() => setUtmMetric("qualifiedLeads")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
              utmMetric === "qualifiedLeads"
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                : "text-white/35 hover:text-white/55 hover:bg-white/[0.04]"
            }`}
          >
            Leads Qualificados
          </button>
        </div>
        <UtmAnalysis
          title={`Análise UTM - ${month.month}`}
          totalLabel={utmMetric === "leads" ? "Total de Leads por UTM" : "Total de Leads Qualificados por UTM"}
          totalValue={utmTotal}
          campaigns={utmData.campaigns}
          adsets={utmData.adsets}
          creatives={utmData.creatives}
          variant="marketing"
          metricLabel={utmMetric === "leads" ? "Leads" : "Leads Qualificados"}
        />
      </div>

      {/* Weekly breakdown table */}
      <div className="rounded-2xl glass-strong overflow-hidden">
        <div className="border-b border-orange-500/10 bg-orange-500/[0.04] px-6 py-3">
          <h3 className="text-sm font-semibold text-orange-400/80">
            Detalhamento Semanal - {month.month}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Semana
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Investimento
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Alcance
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Impressões
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Cliques
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  CPM
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  CPC
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  CPL
                </th>
              </tr>
            </thead>
            <tbody>
              {month.weeks.map((week) => (
                <tr
                  key={week.week}
                  className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white/70">{week.week}</td>
                  <td className="px-4 py-3 text-right text-white/60">
                    {formatCurrency(week.spent)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">
                    {formatNumber(week.reach)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">
                    {formatNumber(week.impressions)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">
                    {formatNumber(week.clicks)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-400">
                    {formatNumber(week.leads)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatCurrency(calcCPM(week.spent, week.impressions))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatCurrency(calcCPC(week.spent, week.clicks))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatPercent(calcCTR(week.clicks, week.impressions))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatCurrency(calcCPL(week.spent, week.leads))}
                  </td>
                </tr>
              ))}
              <tr className="bg-orange-500/[0.04] font-semibold border-t border-orange-500/10">
                <td className="px-4 py-3 text-orange-400/80">TOTAL</td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatCurrency(totals.spent)}
                </td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatNumber(totals.reach)}
                </td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatNumber(totals.impressions)}
                </td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatNumber(totals.clicks)}
                </td>
                <td className="px-4 py-3 text-right text-orange-400">
                  {formatNumber(totals.leads)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatCurrency(cpm)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatCurrency(cpc)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatPercent(ctr)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatCurrency(cpl)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
