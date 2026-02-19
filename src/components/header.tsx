"use client";

import { Calendar, Filter, MapPin, Users, ChevronDown } from "lucide-react";

interface HeaderProps {
  clientName?: string;
}

export function Header({ clientName = "Escola Exemplo" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-6 glass border-0 border-b border-white/[0.06]">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-astra-red to-astra-red-dark text-white font-bold text-xs">
          {clientName.charAt(0)}
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white/90">{clientName}</h1>
          <p className="text-[10px] text-white/30">FVM Astra</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FilterButton icon={Calendar} label="Período" />
        <FilterButton icon={Calendar} label="Data" />
        <FilterButton icon={Filter} label="Fonte" />
        <FilterButton icon={Users} label="Gênero" />
        <FilterButton icon={MapPin} label="Localização" />
      </div>
    </header>
  );
}

function FilterButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/40 hover:bg-white/[0.06] hover:text-white/60 hover:border-white/[0.12] transition-all duration-200">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
      <ChevronDown className="h-2.5 w-2.5 opacity-50" />
    </button>
  );
}
