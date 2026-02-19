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
      accent: "text-blue-400",
      border: "border-blue-500/20",
      glow: "shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)]",
      badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      line: "bg-blue-500/30",
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
    return (
      <div className="flex flex-col items-center gap-0">
        <h3 className="mb-6 text-lg font-bold text-white/90">{title}</h3>
        {steps.map((step, index) => {
          const widthPercent = 100 - index * (50 / steps.length);
          return (
            <div key={step.label} className="flex flex-col items-center w-full">
              <div
                className="relative flex items-center justify-center"
                style={{ width: `${widthPercent}%`, maxWidth: "500px" }}
              >
                <div
                  className={cn(
                    "flex w-full flex-col items-center justify-center rounded-xl py-4 px-4 text-center transition-all duration-300 glass hover:bg-white/[0.06]",
                    colors.border,
                    colors.glow
                  )}
                >
                  <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">
                    {step.label}
                  </span>
                  <span className={cn("text-2xl font-bold text-white mt-0.5")}>
                    {step.value}
                  </span>
                </div>

                {step.costLabel && (
                  <div className="absolute -right-36 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <div className="w-6 h-px bg-white/10" />
                    <div className={cn("rounded-lg px-2.5 py-1 text-[10px] border", colors.badge)}>
                      <span className="font-medium opacity-70">
                        {step.costLabel}
                      </span>
                      <span className="ml-1 font-bold">
                        {step.costValue}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="flex flex-col items-center py-1.5">
                  <ChevronDown className={cn("h-4 w-4 opacity-40", colors.accent)} />
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
