"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  subLabel?: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "marketing" | "vendas" | "accent";
  size?: "sm" | "md" | "lg";
}

export function MetricCard({
  label,
  value,
  subLabel,
  subValue,
  trend,
  trendValue,
  variant = "default",
  size = "md",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl p-4 transition-all duration-300 glass gradient-border hover:bg-white/[0.06]",
        variant === "marketing" && "shadow-[inset_0_1px_0_0_rgba(255,165,0,0.1)]",
        variant === "vendas" && "shadow-[inset_0_1px_0_0_rgba(34,197,94,0.1)]",
        variant === "accent" && "shadow-[inset_0_1px_0_0_rgba(230,59,23,0.15)] glow-sm",
        size === "sm" && "p-3",
        size === "lg" && "p-6"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              "font-medium text-white/40 uppercase tracking-wider",
              size === "sm" && "text-[10px]",
              size === "md" && "text-[11px]",
              size === "lg" && "text-xs"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "font-bold tracking-tight text-white",
              size === "sm" && "text-lg",
              size === "md" && "text-2xl",
              size === "lg" && "text-3xl",
              variant === "accent" && "gradient-text"
            )}
          >
            {value}
          </p>
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
              trend === "up" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
              trend === "down" && "bg-red-500/10 text-red-400 border border-red-500/20",
              trend === "neutral" && "bg-white/5 text-white/40 border border-white/10"
            )}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>

      {subLabel && (
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-2.5">
          <span className="text-[9px] font-semibold text-white/25 uppercase tracking-wider">
            {subLabel}
          </span>
          <span className="text-[11px] font-bold text-white/60">
            {subValue}
          </span>
        </div>
      )}
    </div>
  );
}
