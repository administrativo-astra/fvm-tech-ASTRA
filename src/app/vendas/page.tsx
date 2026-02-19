"use client";

import { MetricCard } from "@/components/metric-card";
import { FunnelVisual } from "@/components/funnel-visual";
import { mockData, getMonthTotals } from "@/lib/mock-data";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  calcCPMQL,
  calcCPV,
  calcCAC,
  calcRate,
} from "@/lib/utils";
import { useState } from "react";

export default function VendasPage() {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const month = mockData[selectedMonth];
  const totals = getMonthTotals(month);

  const cpmql = calcCPMQL(totals.spent, totals.qualifiedLeads);
  const cpv = calcCPV(totals.spent, totals.visits);
  const cac = calcCAC(totals.spent, totals.sales);

  const rateLeadToQualified = calcRate(totals.leads, totals.qualifiedLeads);
  const rateQualifiedToVisit = calcRate(totals.qualifiedLeads, totals.visits);
  const rateVisitToFollowUp = calcRate(totals.visits, totals.followUp);
  const rateFollowUpToSale = calcRate(totals.followUp, totals.sales);
  const rateLeadToSale = calcRate(totals.leads, totals.sales);

  const vendasFunnelSteps = [
    {
      label: "Leads Gerados",
      value: formatNumber(totals.leads),
      costLabel: "Taxa MQL",
      costValue: formatPercent(rateLeadToQualified),
    },
    {
      label: "Leads Qualificados",
      value: formatNumber(totals.qualifiedLeads),
      rate: formatPercent(rateLeadToQualified),
      rateLabel: "Taxa MQL",
      costLabel: "Taxa MQL → Visita",
      costValue: formatPercent(rateQualifiedToVisit),
    },
    {
      label: "Visitas / Apresentação",
      value: formatNumber(totals.visits),
      rate: formatPercent(rateQualifiedToVisit),
      rateLabel: "Taxa MQL → Visita",
      costLabel: "Taxa Visita → Follow",
      costValue: formatPercent(rateVisitToFollowUp),
    },
    {
      label: "Em Follow-up",
      value: formatNumber(totals.followUp),
      rate: formatPercent(rateVisitToFollowUp),
      rateLabel: "Taxa Visita → Follow",
      costLabel: "Taxa Follow → Matrícula",
      costValue: formatPercent(rateFollowUpToSale),
    },
    {
      label: "Matrículas",
      value: formatNumber(totals.sales),
      rate: formatPercent(rateFollowUpToSale),
      rateLabel: "Taxa Follow → Matrícula",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Funil Comercial
          </h2>
          <p className="text-sm text-white/35">
            Métricas do processo comercial e conversão de vendas
          </p>
        </div>
        <div className="flex gap-2">
          {mockData.map((m, i) => (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(i)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedMonth === i
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-[0_0_10px_-3px_rgba(59,130,246,0.2)]"
                  : "glass text-white/40 hover:text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {m.month}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Leads"
          value={formatNumber(totals.leads)}
          variant="vendas"
          size="md"
        />
        <MetricCard
          label="Qualificados"
          value={formatNumber(totals.qualifiedLeads)}
          subLabel="CPMQL"
          subValue={formatCurrency(cpmql)}
          variant="vendas"
          size="md"
        />
        <MetricCard
          label="Visitas"
          value={formatNumber(totals.visits)}
          subLabel="CPV"
          subValue={formatCurrency(cpv)}
          variant="vendas"
          size="md"
        />
        <MetricCard
          label="Follow-up"
          value={formatNumber(totals.followUp)}
          variant="vendas"
          size="md"
        />
        <MetricCard
          label="Matrículas"
          value={formatNumber(totals.sales)}
          subLabel="CAC"
          subValue={formatCurrency(cac)}
          variant="vendas"
          size="md"
        />
      </div>

      {/* Funnel Rates */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl p-4 text-center glass hover:bg-white/[0.06] transition-all duration-300">
          <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">
            Taxa de MQL
          </p>
          <p className="mt-1 text-xl font-bold text-blue-400">
            {formatPercent(rateLeadToQualified)}
          </p>
          <p className="text-[9px] text-white/20">Lead → Qualificado</p>
        </div>
        <div className="rounded-xl p-4 text-center glass hover:bg-white/[0.06] transition-all duration-300">
          <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">
            MQL → Visita
          </p>
          <p className="mt-1 text-xl font-bold text-blue-400">
            {formatPercent(rateQualifiedToVisit)}
          </p>
          <p className="text-[9px] text-white/20">Qualificado → Visita</p>
        </div>
        <div className="rounded-xl p-4 text-center glass hover:bg-white/[0.06] transition-all duration-300">
          <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">
            Visita → Follow
          </p>
          <p className="mt-1 text-xl font-bold text-blue-400">
            {formatPercent(rateVisitToFollowUp)}
          </p>
          <p className="text-[9px] text-white/20">Visita → Follow-up</p>
        </div>
        <div className="rounded-xl p-4 text-center glass hover:bg-white/[0.06] transition-all duration-300">
          <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">
            Follow → Matrícula
          </p>
          <p className="mt-1 text-xl font-bold text-blue-400">
            {formatPercent(rateFollowUpToSale)}
          </p>
          <p className="text-[9px] text-white/20">Follow-up → Matrícula</p>
        </div>
        <div className="rounded-xl p-4 text-center glass gradient-border glow-sm hover:bg-white/[0.06] transition-all duration-300">
          <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest">
            Taxa de Conversão
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-400">
            {formatPercent(rateLeadToSale)}
          </p>
          <p className="text-[9px] text-white/20">Lead → Matrícula</p>
        </div>
      </div>

      {/* Vendas Funnel Visual */}
      <div className="rounded-2xl glass-strong p-6">
        <FunnelVisual
          title={`Funil Comercial - ${month.month}`}
          steps={vendasFunnelSteps}
          direction="horizontal"
          variant="vendas"
        />
      </div>

      {/* Weekly breakdown table */}
      <div className="rounded-2xl glass-strong overflow-hidden">
        <div className="border-b border-blue-500/10 bg-blue-500/[0.04] px-6 py-3">
          <h3 className="text-sm font-semibold text-blue-400/80">
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
                  Leads
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Qualificados
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Visitas
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Follow-up
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Taxa MQL
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Taxa Visita
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  Taxa Venda
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  CPMQL
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  CPV
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                  CAC
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
                    {formatNumber(week.leads)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">
                    {formatNumber(week.qualifiedLeads)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">
                    {formatNumber(week.visits)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/60">
                    {formatNumber(week.followUp)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-blue-400">
                    {formatNumber(week.sales)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatPercent(calcRate(week.leads, week.qualifiedLeads))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatPercent(calcRate(week.qualifiedLeads, week.visits))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatPercent(calcRate(week.leads, week.sales))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatCurrency(calcCPMQL(week.spent, week.qualifiedLeads))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatCurrency(calcCPV(week.spent, week.visits))}
                  </td>
                  <td className="px-4 py-3 text-right text-white/35">
                    {formatCurrency(calcCAC(week.spent, week.sales))}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-500/[0.04] font-semibold border-t border-blue-500/10">
                <td className="px-4 py-3 text-blue-400/80">TOTAL</td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatNumber(totals.leads)}
                </td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatNumber(totals.qualifiedLeads)}
                </td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatNumber(totals.visits)}
                </td>
                <td className="px-4 py-3 text-right text-white/80">
                  {formatNumber(totals.followUp)}
                </td>
                <td className="px-4 py-3 text-right text-blue-400">
                  {formatNumber(totals.sales)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatPercent(rateLeadToQualified)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatPercent(rateQualifiedToVisit)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatPercent(rateLeadToSale)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatCurrency(cpmql)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatCurrency(cpv)}
                </td>
                <td className="px-4 py-3 text-right text-white/50">
                  {formatCurrency(cac)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
