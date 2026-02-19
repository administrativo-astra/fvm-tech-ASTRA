"use client";

import { MetricCard } from "@/components/metric-card";
import { FunnelVisual } from "@/components/funnel-visual";
import { getAllTotals } from "@/lib/mock-data";
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
  DollarSign,
  Eye,
  MousePointerClick,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const totals = getAllTotals();

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
    {
      label: "Taxa de MQL",
      value: rateLeadToQualified,
      description: "Lead → Qualificado",
      icon: Users,
    },
    {
      label: "MQL → Visita",
      value: rateQualifiedToVisit,
      description: "Qualificado → Visita",
      icon: Eye,
    },
    {
      label: "Visita → Follow",
      value: rateVisitToFollowUp,
      description: "Visita → Follow-up",
      icon: Target,
    },
    {
      label: "Follow → Matrícula",
      value: rateFollowUpToSale,
      description: "Follow-up → Matrícula",
      icon: Zap,
    },
    {
      label: "Conversão Geral",
      value: rateLeadToSale,
      description: "Lead → Matrícula",
      icon: TrendingUp,
      highlight: true,
    },
  ];

  return (
    <div className="relative space-y-8 animate-fade-in">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-astra-glow" />

      {/* Page title */}
      <div className="relative">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Visão Geral
        </h2>
        <p className="text-sm text-white/35">
          Resumo consolidado do funil de marketing e vendas
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <MetricCard
          label="Investimento"
          value={formatCurrency(totals.spent)}
          variant="accent"
          size="sm"
        />
        <MetricCard
          label="Alcance"
          value={formatNumber(totals.reach)}
          size="sm"
        />
        <MetricCard
          label="Impressões"
          value={formatNumber(totals.impressions)}
          subLabel="CPM"
          subValue={formatCurrency(cpm)}
          size="sm"
        />
        <MetricCard
          label="Cliques"
          value={formatNumber(totals.clicks)}
          subLabel="CPC"
          subValue={formatCurrency(cpc)}
          size="sm"
        />
        <MetricCard
          label="CTR"
          value={formatPercent(ctr)}
          size="sm"
        />
        <MetricCard
          label="Leads"
          value={formatNumber(totals.leads)}
          subLabel="CPL"
          subValue={formatCurrency(cpl)}
          size="sm"
        />
        <MetricCard
          label="Qualificados"
          value={formatNumber(totals.qualifiedLeads)}
          subLabel="CPMQL"
          subValue={formatCurrency(cpmql)}
          size="sm"
        />
        <MetricCard
          label="Matrículas"
          value={formatNumber(totals.sales)}
          subLabel="CAC"
          subValue={formatCurrency(cac)}
          size="sm"
        />
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
                rate.highlight
                  ? "gradient-border glow-sm"
                  : ""
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
            </div>
          ))}
        </div>
      </div>

      {/* General Funnel Visualization */}
      <div className="rounded-2xl glass-strong p-8">
        <FunnelVisual
          title="Resumo Geral"
          steps={generalFunnelSteps}
          direction="vertical"
          variant="general"
        />
      </div>
    </div>
  );
}
