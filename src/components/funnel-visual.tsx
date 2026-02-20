"use client";

import { cn } from "@/lib/utils";
import { ArrowDown, ArrowRight, ChevronDown } from "lucide-react";

interface FunnelStep {
  label: string;
  value: string;
  rate?: string;
  rateLabel?: string;
  costLabel?: string;
  costValue?: string;
}

interface FunnelVisualProps {
  steps: FunnelStep[];
  title: string;
  direction?: "horizontal" | "vertical";
  variant?: "marketing" | "vendas" | "general";
}

export function FunnelVisual({
  steps,
  title,
  direction = "horizontal",
  variant = "general",
}: FunnelVisualProps) {
  const colorClasses = {
    marketing: {
      accent: "text-orange-400",
      border: "border-orange-500/20",
      glow: "shadow-[0_0_15px_-3px_rgba(255,165,0,0.15)]",
      badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      line: "bg-orange-500/30",
    },
    vendas: {
      accent: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-[0_0_15px_-3px_rgba(34,197,94,0.15)]",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      line: "bg-emerald-500/30",
    },
    general: {
      accent: "text-astra-red",
      border: "border-astra-red/20",
      glow: "shadow-[0_0_15px_-3px_rgba(230,59,23,0.15)]",
      badge: "bg-astra-red/10 text-astra-red-light border-astra-red/20",
      line: "bg-astra-red/30",
    },
  };

  const colors = colorClasses[variant];

  if (direction === "vertical") {
    const stepHeight = 64;
    const totalSteps = steps.length;

    return (
      <div className="flex flex-col items-center">
        <h3 className="mb-6 text-lg font-bold text-white/90">{title}</h3>
        <div className="relative w-full" style={{ maxWidth: "700px" }}>
          {steps.map((step, index) => {
            const topWidthPct = 100 - index * (60 / totalSteps);
            const bottomWidthPct = 100 - (index + 1) * (60 / totalSteps);
            const topLeft = (100 - topWidthPct) / 2;
            const topRight = topLeft + topWidthPct;
            const bottomLeft = (100 - bottomWidthPct) / 2;
            const bottomRight = bottomLeft + bottomWidthPct;

            const variantColor =
              variant === "marketing"
                ? "rgba(249,115,22,"
                : variant === "vendas"
                ? "rgba(34,197,94,"
                : "rgba(230,59,23,";

            return (
              <div key={step.label} className="flex flex-col items-center w-full">
                <div className="relative w-full" style={{ height: `${stepHeight}px` }}>
                  {/* Trapezoid shape */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id={`fgrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={`${variantColor}${0.12 + index * 0.03})`} />
                        <stop offset="100%" stopColor={`${variantColor}${0.06 + index * 0.02})`} />
                      </linearGradient>
                    </defs>
                    <polygon
                      points={`${topLeft},0 ${topRight},0 ${bottomRight},100 ${bottomLeft},100`}
                      fill={`url(#fgrad-${index})`}
                      stroke={`${variantColor}0.2)`}
                      strokeWidth="0.5"
                    />
                  </svg>
                  {/* Content overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                        {step.label}
                      </span>
                      <div className="text-2xl font-bold text-white">{step.value}</div>
                    </div>
                  </div>

                  {/* Cost badge */}
                  {step.costLabel && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+12px)] flex items-center gap-1.5 z-10">
                      <div className="w-5 h-px bg-white/10" />
                      <div className={cn("rounded-lg px-2.5 py-1 text-[10px] border whitespace-nowrap", colors.badge)}>
                        <span className="font-medium opacity-70">{step.costLabel}</span>
                        <span className="ml-1 font-bold">{step.costValue}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rate between steps */}
                {index < totalSteps - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <ChevronDown className={cn("h-3.5 w-3.5 opacity-30", colors.accent)} />
                    {steps[index + 1]?.rate && (
                      <span className={cn("rounded-full px-2.5 py-0.5 text-[9px] font-semibold border", colors.badge)}>
                        {steps[index + 1].rateLabel}: {steps[index + 1].rate}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-white/90">{title}</h3>
      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-start gap-2">
            <div className="flex flex-col items-center gap-2 min-w-[140px]">
              <div
                className={cn(
                  "flex w-full flex-col items-center justify-center rounded-xl py-5 px-3 text-center transition-all duration-300 glass hover:bg-white/[0.06] hover:-translate-y-0.5",
                  colors.border,
                  colors.glow
                )}
              >
                <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">
                  {step.label}
                </span>
                <span className="mt-1 text-2xl font-bold text-white">
                  {step.value}
                </span>
              </div>

              {step.costLabel && (
                <div className={cn("rounded-lg px-2.5 py-1 text-[10px] border", colors.badge)}>
                  <span className="font-medium opacity-60">
                    {step.costLabel}:{" "}
                  </span>
                  <span className="font-bold">
                    {step.costValue}
                  </span>
                </div>
              )}
            </div>

            {index < steps.length - 1 && (
              <div className="flex flex-col items-center justify-center pt-7 gap-1.5">
                <ArrowRight className={cn("h-4 w-4 opacity-30", colors.accent)} />
                {steps[index + 1]?.rate && (
                  <span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-semibold border", colors.badge)}>
                    {steps[index + 1].rate}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
