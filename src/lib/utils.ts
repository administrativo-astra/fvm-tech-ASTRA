import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function calcCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (clicks / impressions) * 100;
}

export function calcCPM(spent: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (spent / impressions) * 1000;
}

export function calcCPC(spent: number, clicks: number): number {
  if (clicks === 0) return 0;
  return spent / clicks;
}

export function calcCPL(spent: number, leads: number): number {
  if (leads === 0) return 0;
  return spent / leads;
}

export function calcCPMQL(spent: number, qualifiedLeads: number): number {
  if (qualifiedLeads === 0) return 0;
  return spent / qualifiedLeads;
}

export function calcCPV(spent: number, visits: number): number {
  if (visits === 0) return 0;
  return spent / visits;
}

export function calcCAC(spent: number, sales: number): number {
  if (sales === 0) return 0;
  return spent / sales;
}

export function calcRate(from: number, to: number): number {
  if (from === 0) return 0;
  return (to / from) * 100;
}
