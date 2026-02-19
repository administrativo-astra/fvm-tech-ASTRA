"use client";

import { Plug, Facebook, BarChart3, Database, Webhook } from "lucide-react";

const integrations = [
  {
    name: "Facebook Ads",
    description: "Conecte sua conta do Facebook Ads para importar dados de campanhas automaticamente.",
    icon: Facebook,
    status: "available" as const,
    color: "bg-blue-500/15 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    name: "Google Ads",
    description: "Integre com o Google Ads para acompanhar campanhas de pesquisa e display.",
    icon: BarChart3,
    status: "coming_soon" as const,
    color: "bg-red-500/15 border-red-500/20",
    iconColor: "text-red-400",
  },
  {
    name: "CRM / Planilhas",
    description: "Importe dados de vendas via planilha ou conecte seu CRM para atualizar dados automaticamente.",
    icon: Database,
    status: "available" as const,
    color: "bg-emerald-500/15 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    name: "Webhooks",
    description: "Configure webhooks para receber dados em tempo real de qualquer plataforma.",
    icon: Webhook,
    status: "coming_soon" as const,
    color: "bg-purple-500/15 border-purple-500/20",
    iconColor: "text-purple-400",
  },
];

export default function IntegracoesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Integrações</h2>
        <p className="text-sm text-white/35">
          Conecte suas fontes de dados para alimentar o funil automaticamente
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 glass hover:bg-white/[0.06] gradient-border"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${integration.color}`}
              >
                <integration.icon className={`h-6 w-6 ${integration.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white/90">{integration.name}</h3>
                  {integration.status === "coming_soon" && (
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                      Em breve
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/35">
                  {integration.description}
                </p>
                <button
                  disabled={integration.status === "coming_soon"}
                  className={`mt-4 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    integration.status === "available"
                      ? "bg-astra-red/15 text-astra-red-light border border-astra-red/25 hover:bg-astra-red/25 glow-sm"
                      : "bg-white/[0.03] text-white/20 border border-white/[0.06] cursor-not-allowed"
                  }`}
                >
                  {integration.status === "available" ? "Conectar" : "Indisponível"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl glass border-dashed p-8 text-center">
        <Plug className="mx-auto h-10 w-10 text-white/15" />
        <h3 className="mt-3 text-sm font-semibold text-white/60">
          Precisa de outra integração?
        </h3>
        <p className="mt-1 text-sm text-white/30">
          Entre em contato conosco para solicitar novas integrações.
        </p>
        <button className="mt-4 rounded-xl glass px-4 py-2 text-sm font-medium text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all duration-200">
          Solicitar Integração
        </button>
      </div>
    </div>
  );
}
