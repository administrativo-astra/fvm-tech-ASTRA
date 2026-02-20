"use client";

import { useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { FunnelVisual } from "@/components/funnel-visual";
import { MonthChart } from "@/components/month-chart";
import {
  mockData,
  getMonthTotals,
  getAllTotals,
  getMonthComparison,
  getMonthlyEvolution,
  getWeeklyEvolution,
} from "@/lib/mock-data";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  calcCTR,
  calcCPM,
  calcCPC,
  calcCPL,
  calcCPMQL,
  calcCAC,
  calcRate,
} from "@/lib/utils";
import {
  Users,
  Eye,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
} from "lucide-react";

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[9px] text-white/20 flex items-center gap-0.5"><Minus className="h-2.5 w-2.5" /> 0%</span>;
  const isPositive = value > 0;
  return (
    <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
      {isPositive ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {isPositive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

export default function HomePage() {
  const [selectedMonth, setSelectedMonth] = useState(-1); // -1 = todos
  const isAll = selectedMonth === -1;
  const totals = isAll
    ? getAllTotals()
    : getMonthTotals(mockData[selectedMonth]);
  const comparison = isAll ? getMonthComparison(mockData.length - 1) : getMonthComparison(selectedMonth);

  const monthlyEvo = getMonthlyEvolution();
  const weeklyEvo = getWeeklyEvolution();

  const ctr = calcCTR(totals.clicks, totals.impressions);
  const cpm = calcCPM(totals.spent, totals.impressions);
  const cpc = calcCPC(totals.spent, totals.clicks);
  const cpl = calcCPL(totals.spent, totals.leads);
  const cpmql = calcCPMQL(totals.spent, totals.qualifiedLeads);
  const cac = calcCAC(totals.spent, totals.sales);

  const rateLeadToQualified = calcRate(totals.leads, totals.qualifiedLeads);
  const rateQualifiedToVisit = calcRate(totals.qualifiedLeads, totals.visits);
  const rateVisitToFollowUp = calcRate(totals.visits, totals.followUp);
  const rateFollowUpToSale = calcRate(totals.followUp, totals.sales);
  const rateLeadToSale = calcRate(totals.leads, totals.sales);

  const generalFunnelSteps = [
    {
      label: "Impressões",
      value: formatNumber(totals.impressions),
      costLabel: "CPM",
      costValue: formatCurrency(cpm),
    },
    {
      label: "Cliques",
      value: formatNumber(totals.clicks),
      rate: `CTR: ${formatPercent(ctr)}`,
      costLabel: "CPC",
      costValue: formatCurrency(cpc),
    },
    {
      label: "Leads",
      value: formatNumber(totals.leads),
      rate: formatPercent(calcRate(totals.impressions, totals.clicks)),
      rateLabel: "Taxa",
      costLabel: "CPL",
      costValue: formatCurrency(cpl),
    },
    {
      label: "Qualificados",
      value: formatNumber(totals.qualifiedLeads),
      rate: formatPercent(rateLeadToQualified),
      rateLabel: "Taxa MQL",
      costLabel: "CPMQL",
      costValue: formatCurrency(cpmql),
    },
    {
      label: "Matrículas",
      value: formatNumber(totals.sales),
      rate: formatPercent(rateLeadToSale),
      rateLabel: "Taxa Conversão",
      costLabel: "CAC",
      costValue: formatCurrency(cac),
    },
  ];

  const funnelRates = [
    { label: "Taxa de MQL", value: rateLeadToQualified, description: "Lead → Qualificado", icon: Users, cKey: "qualifiedLeads" as const },
    { label: "MQL → Visita", value: rateQualifiedToVisit, description: "Qualificado → Visita", icon: Eye, cKey: "visits" as const },
    { label: "Visita → Follow", value: rateVisitToFollowUp, description: "Visita → Follow-up", icon: Target, cKey: "followUp" as const },
    { label: "Follow → Matrícula", value: rateFollowUpToSale, description: "Follow-up → Matrícula", icon: Zap, cKey: "sales" as const },
    { label: "Conversão Geral", value: rateLeadToSale, description: "Lead → Matrícula", icon: TrendingUp, highlight: true, cKey: "sales" as const },
  ];

  const kpis = [
    { label: "Investimento", value: formatCurrency(totals.spent), variant: "accent" as const, cKey: "spent" as const },
    { label: "Alcance", value: formatNumber(totals.reach), cKey: "reach" as const },
    { label: "Impressões", value: formatNumber(totals.impressions), subLabel: "CPM", subValue: formatCurrency(cpm), cKey: "impressions" as const },
    { label: "Cliques", value: formatNumber(totals.clicks), subLabel: "CPC", subValue: formatCurrency(cpc), cKey: "clicks" as const },
    { label: "CTR", value: formatPercent(ctr), cKey: null },
    { label: "Leads", value: formatNumber(totals.leads), subLabel: "CPL", subValue: formatCurrency(cpl), cKey: "leads" as const },
    { label: "Qualificados", value: formatNumber(totals.qualifiedLeads), subLabel: "CPMQL", subValue: formatCurrency(cpmql), cKey: "qualifiedLeads" as const },
    { label: "Matrículas", value: formatNumber(totals.sales), subLabel: "CAC", subValue: formatCurrency(cac), cKey: "sales" as const },
  ];

  function handleExportCSV() {
    const headers = ["Mês", "Investimento", "Alcance", "Impressões", "Cliques", "Leads", "Qualificados", "Visitas", "Follow-up", "Vendas"];
    const rows = mockData.map((m) => {
      const t = getMonthTotals(m);
      return [m.month, t.spent.toFixed(2), t.reach, t.impressions, t.clicks, t.leads, t.qualifiedLeads, t.visits, t.followUp, t.sales].join(";");
    });
    const csv = [headers.join(";"), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fvm-astra-dados.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative space-y-8 animate-fade-in">
      <div className="pointer-events-none fixed inset-0 bg-astra-glow" />

      {/* Page title + month selector + export */}
      <div className="relative flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Visão Geral
          </h2>
          <p className="text-sm text-white/35">
            Resumo consolidado do funil de marketing e vendas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMonth(-1)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isAll
                ? "bg-astra-red/15 text-astra-red border border-astra-red/25 shadow-[0_0_10px_-3px_rgba(230,59,23,0.2)]"
                : "glass text-white/40 hover:text-white/60 hover:bg-white/[0.06]"
            }`}
          >
            Todos
          </button>
          {mockData.map((m, i) => (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(i)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedMonth === i
                  ? "bg-astra-red/15 text-astra-red border border-astra-red/25 shadow-[0_0_10px_-3px_rgba(230,59,23,0.2)]"
                  : "glass text-white/40 hover:text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {m.month}
            </button>
          ))}
          <button
            onClick={handleExportCSV}
            className="rounded-xl glass px-3 py-2 text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            title="Exportar CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards with trends */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="space-y-1">
            <MetricCard
              label={kpi.label}
              value={kpi.value}
              variant={kpi.variant || "default"}
              size="sm"
              subLabel={kpi.subLabel}
              subValue={kpi.subValue}
              trend={
                comparison && kpi.cKey
                  ? comparison[kpi.cKey] > 0
                    ? "up"
                    : comparison[kpi.cKey] < 0
                    ? "down"
                    : "neutral"
                  : undefined
              }
              trendValue={
                comparison && kpi.cKey
                  ? `${comparison[kpi.cKey] > 0 ? "+" : ""}${comparison[kpi.cKey].toFixed(0)}%`
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {/* Funnel Rates */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white/50 uppercase tracking-wider">
          Taxas do Funil
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {funnelRates.map((rate) => (
            <div
              key={rate.label}
              className={`group rounded-xl p-4 text-center transition-all duration-300 glass hover:bg-white/[0.06] ${
                rate.highlight ? "gradient-border glow-sm" : ""
              }`}
            >
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
                <rate.icon className={`h-4 w-4 ${rate.highlight ? "text-astra-red" : "text-white/30"}`} />
              </div>
              <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">
                {rate.label}
              </p>
              <p className={`mt-1 text-xl font-bold ${rate.highlight ? "gradient-text" : "text-white/90"}`}>
                {formatPercent(rate.value)}
              </p>
              <p className="mt-0.5 text-[9px] text-white/20">{rate.description}</p>
              {comparison && (
                <div className="mt-1.5">
                  <TrendBadge value={comparison[rate.cKey]} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthChart
          title="Evolução Mensal — Funil de Marketing"
          data={monthlyEvo}
          type="bar"
          lines={[
            { key: "impressions", label: "Impressões", color: "#f97316" },
            { key: "clicks", label: "Cliques", color: "#eab308" },
            { key: "leads", label: "Leads", color: "#E63B17" },
          ]}
        />
        <MonthChart
          title="Evolução Mensal — Funil Comercial"
          data={monthlyEvo}
          type="bar"
          lines={[
            { key: "leads", label: "Leads", color: "#f97316" },
            { key: "qualifiedLeads", label: "Qualificados", color: "#22c55e" },
            { key: "visits", label: "Visitas", color: "#3b82f6" },
            { key: "sales", label: "Matrículas", color: "#E63B17" },
          ]}
        />
      </div>

      <MonthChart
        title="Evolução Semanal — Leads & Qualificados"
        data={weeklyEvo}
        type="area"
        lines={[
          { key: "leads", label: "Leads", color: "#f97316" },
          { key: "qualifiedLeads", label: "Qualificados", color: "#22c55e" },
          { key: "visits", label: "Visitas", color: "#3b82f6" },
        ]}
      />

      {/* Comparison Table */}
      <div className="rounded-2xl glass-strong overflow-hidden">
        <div className="border-b border-astra-red/10 bg-astra-red/[0.04] px-6 py-3">
          <h3 className="text-sm font-semibold text-astra-red/80">
            Comparativo Mensal
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">Mês</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">Investimento</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">Impressões</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">Cliques</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">CTR</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">Leads</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">Qualificados</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">Visitas</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">Vendas</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">CPL</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">CAC</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((m, i) => {
                const t = getMonthTotals(m);
                const mCtr = calcCTR(t.clicks, t.impressions);
                const mCpl = calcCPL(t.spent, t.leads);
                const mCac = calcCAC(t.spent, t.sales);
                const prev = i > 0 ? getMonthComparison(i) : null;
                return (
                  <tr key={m.month} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-white/70">{m.month}</td>
                    <td className="px-4 py-3 text-right text-white/60">{formatCurrency(t.spent)}</td>
                    <td className="px-4 py-3 text-right text-white/60">{formatNumber(t.impressions)}</td>
                    <td className="px-4 py-3 text-right text-white/60">{formatNumber(t.clicks)}</td>
                    <td className="px-4 py-3 text-right text-white/60">{formatPercent(mCtr)}</td>
                    <td className="px-4 py-3 text-right text-white/60">
                      <div className="flex items-center justify-end gap-1.5">
                        {formatNumber(t.leads)}
                        {prev && <TrendBadge value={prev.leads} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white/60">
                      <div className="flex items-center justify-end gap-1.5">
                        {formatNumber(t.qualifiedLeads)}
                        {prev && <TrendBadge value={prev.qualifiedLeads} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white/60">{formatNumber(t.visits)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-astra-red">
                      <div className="flex items-center justify-end gap-1.5">
                        {formatNumber(t.sales)}
                        {prev && <TrendBadge value={prev.sales} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white/40">{formatCurrency(mCpl)}</td>
                    <td className="px-4 py-3 text-right text-white/40">{t.sales > 0 ? formatCurrency(mCac) : "—"}</td>
                  </tr>
                );
              })}
              <tr className="bg-astra-red/[0.04] font-semibold border-t border-astra-red/10">
                <td className="px-4 py-3 text-astra-red/80">TOTAL</td>
                <td className="px-4 py-3 text-right text-white/80">{formatCurrency(getAllTotals().spent)}</td>
                <td className="px-4 py-3 text-right text-white/80">{formatNumber(getAllTotals().impressions)}</td>
                <td className="px-4 py-3 text-right text-white/80">{formatNumber(getAllTotals().clicks)}</td>
                <td className="px-4 py-3 text-right text-white/80">{formatPercent(calcCTR(getAllTotals().clicks, getAllTotals().impressions))}</td>
                <td className="px-4 py-3 text-right text-white/80">{formatNumber(getAllTotals().leads)}</td>
                <td className="px-4 py-3 text-right text-white/80">{formatNumber(getAllTotals().qualifiedLeads)}</td>
                <td className="px-4 py-3 text-right text-white/80">{formatNumber(getAllTotals().visits)}</td>
                <td className="px-4 py-3 text-right text-astra-red">{formatNumber(getAllTotals().sales)}</td>
                <td className="px-4 py-3 text-right text-white/50">{formatCurrency(calcCPL(getAllTotals().spent, getAllTotals().leads))}</td>
                <td className="px-4 py-3 text-right text-white/50">{getAllTotals().sales > 0 ? formatCurrency(calcCAC(getAllTotals().spent, getAllTotals().sales)) : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* General Funnel Visualization */}
      <div className="rounded-2xl glass-strong p-8">
        <FunnelVisual
          title={isAll ? "Resumo Geral" : `Funil — ${mockData[selectedMonth].month}`}
          steps={generalFunnelSteps}
          direction="vertical"
          variant="general"
        />
      </div>
    </div>
  );
}
