"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Filter, MapPin, Users, ChevronDown, Check } from "lucide-react";

interface HeaderProps {
  clientName?: string;
}

const filterOptions: Record<string, string[]> = {
  Período: ["Últimos 7 dias", "Últimos 15 dias", "Últimos 30 dias", "Último trimestre", "Personalizado"],
  Data: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],
  Fonte: ["Todas", "Facebook Ads", "Google Ads", "Instagram", "Orgânico"],
  Gênero: ["Todos", "Masculino", "Feminino"],
  Localização: ["Todas", "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba"],
};

export function Header({ clientName = "Escola Exemplo" }: HeaderProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    Período: "Últimos 30 dias",
    Data: "Janeiro",
    Fonte: "Todas",
    Gênero: "Todos",
    Localização: "Todas",
  });
  const [openFilter, setOpenFilter] = useState<string | null>(null);

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
        <FilterDropdown
          icon={Calendar}
          label="Período"
          options={filterOptions["Período"]}
          value={activeFilters["Período"]}
          isOpen={openFilter === "Período"}
          onToggle={() => setOpenFilter(openFilter === "Período" ? null : "Período")}
          onSelect={(v) => { setActiveFilters({ ...activeFilters, Período: v }); setOpenFilter(null); }}
        />
        <FilterDropdown
          icon={Calendar}
          label="Data"
          options={filterOptions["Data"]}
          value={activeFilters["Data"]}
          isOpen={openFilter === "Data"}
          onToggle={() => setOpenFilter(openFilter === "Data" ? null : "Data")}
          onSelect={(v) => { setActiveFilters({ ...activeFilters, Data: v }); setOpenFilter(null); }}
        />
        <FilterDropdown
          icon={Filter}
          label="Fonte"
          options={filterOptions["Fonte"]}
          value={activeFilters["Fonte"]}
          isOpen={openFilter === "Fonte"}
          onToggle={() => setOpenFilter(openFilter === "Fonte" ? null : "Fonte")}
          onSelect={(v) => { setActiveFilters({ ...activeFilters, Fonte: v }); setOpenFilter(null); }}
        />
        <FilterDropdown
          icon={Users}
          label="Gênero"
          options={filterOptions["Gênero"]}
          value={activeFilters["Gênero"]}
          isOpen={openFilter === "Gênero"}
          onToggle={() => setOpenFilter(openFilter === "Gênero" ? null : "Gênero")}
          onSelect={(v) => { setActiveFilters({ ...activeFilters, Gênero: v }); setOpenFilter(null); }}
        />
        <FilterDropdown
          icon={MapPin}
          label="Localização"
          options={filterOptions["Localização"]}
          value={activeFilters["Localização"]}
          isOpen={openFilter === "Localização"}
          onToggle={() => setOpenFilter(openFilter === "Localização" ? null : "Localização")}
          onSelect={(v) => { setActiveFilters({ ...activeFilters, Localização: v }); setOpenFilter(null); }}
        />
      </div>
    </header>
  );
}

function FilterDropdown({
  icon: Icon,
  label,
  options,
  value,
  isOpen,
  onToggle,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  options: string[];
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) onToggle();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${
          isOpen
            ? "border-astra-red/25 bg-astra-red/10 text-astra-red-light"
            : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60 hover:border-white/[0.12]"
        }`}
      >
        <Icon className="h-3 w-3" />
        <span>{label}</span>
        <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${isOpen ? "rotate-180 opacity-80" : "opacity-50"}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 min-w-[180px] rounded-xl glass-strong border border-white/[0.08] p-1.5 shadow-xl shadow-black/30 animate-fade-in z-50">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onSelect(option)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-medium transition-all duration-150 ${
                value === option
                  ? "bg-astra-red/10 text-astra-red-light"
                  : "text-white/50 hover:bg-white/[0.05] hover:text-white/70"
              }`}
            >
              <span>{option}</span>
              {value === option && <Check className="h-3 w-3 text-astra-red" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
