"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plug,
  Facebook,
  BarChart3,
  Sheet,
  Webhook,
  Loader2,
  Check,
  RefreshCw,
  Unplug,
  AlertTriangle,
  Clock,
  ExternalLink,
  Download,
  Upload,
  Mail,
} from "lucide-react";

interface FacebookStatus {
  connected: boolean;
  isExpired?: boolean;
  adAccountName?: string;
  adAccountId?: string;
  userName?: string;
  lastSyncAt?: string;
  connectedAt?: string;
}

interface GoogleSheetsStatus {
  connected: boolean;
  userEmail?: string;
  userName?: string;
  lastSyncAt?: string;
}

export default function IntegracoesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/30">Carregando...</div>}>
      <IntegracoesContent />
    </Suspense>
  );
}

function IntegracoesContent() {
  const searchParams = useSearchParams();
  const [fbStatus, setFbStatus] = useState<FacebookStatus | null>(null);
  const [fbLoading, setFbLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  // Google Sheets state
  const [gsStatus, setGsStatus] = useState<GoogleSheetsStatus | null>(null);
  const [gsLoading, setGsLoading] = useState(true);
  const [gsDisconnecting, setGsDisconnecting] = useState(false);

  // Check for OAuth callback result
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  const fetchFbStatus = useCallback(async () => {
    setFbLoading(true);
    try {
      const res = await fetch("/api/integrations/facebook/status");
      const json = await res.json();
      setFbStatus(json);
    } catch {
      setFbStatus({ connected: false });
    } finally {
      setFbLoading(false);
    }
  }, []);

  const fetchGsStatus = useCallback(async () => {
    setGsLoading(true);
    try {
      const res = await fetch("/api/integrations/google-sheets/status");
      const json = await res.json();
      setGsStatus(json);
    } catch {
      setGsStatus({ connected: false });
    } finally {
      setGsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFbStatus();
    fetchGsStatus();
  }, [fetchFbStatus, fetchGsStatus]);

  async function handleFbConnect() {
    window.location.href = "/api/integrations/facebook/connect";
  }

  async function handleFbSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/integrations/facebook/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) {
        setSyncResult({ type: "error", text: json.error || "Erro na sincronização" });
      } else {
        setSyncResult({
          type: "success",
          text: `Sincronizado: ${json.results?.campaigns || 0} campanhas, ${json.results?.funnelRows || 0} métricas, ${json.results?.utmRows || 0} UTMs`,
        });
        fetchFbStatus();
      }
    } catch {
      setSyncResult({ type: "error", text: "Erro de conexão" });
    } finally {
      setSyncing(false);
    }
  }

  async function handleFbDisconnect() {
    if (!confirm("Tem certeza que deseja desconectar o Facebook Ads?")) return;
    setDisconnecting(true);
    try {
      const res = await fetch("/api/integrations/facebook/disconnect", { method: "POST" });
      if (res.ok) {
        setFbStatus({ connected: false });
        setSyncResult(null);
      }
    } catch { /* ignore */ }
    finally { setDisconnecting(false); }
  }

  function formatDate(dateStr: string | undefined | null) {
    if (!dateStr) return "Nunca";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateStr));
  }

  async function handleGsConnect() {
    window.location.href = "/api/integrations/google-sheets/connect";
  }

  async function handleGsDisconnect() {
    if (!confirm("Tem certeza que deseja desconectar o Google Planilhas?")) return;
    setGsDisconnecting(true);
    try {
      const res = await fetch("/api/integrations/google-sheets/disconnect", { method: "POST" });
      if (res.ok) {
        setGsStatus({ connected: false });
      }
    } catch { /* ignore */ }
    finally { setGsDisconnecting(false); }
  }

  function getErrorMessage(code: string) {
    switch (code) {
      case "denied": return "Acesso negado pelo Facebook.";
      case "no_ad_accounts": return "Nenhuma conta de anúncios encontrada.";
      case "token_error": return "Erro ao obter token. Tente novamente.";
      case "db_error": return "Erro ao salvar integração. Tente novamente.";
      case "google_denied": return "Acesso negado pelo Google.";
      case "google_token_error": return "Erro ao obter token do Google. Tente novamente.";
      case "google_db_error": return "Erro ao salvar integração Google. Tente novamente.";
      default: return "Erro na conexão. Tente novamente.";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Integrações</h2>
        <p className="text-sm text-white/35">
          Conecte suas fontes de dados para alimentar o funil automaticamente
        </p>
      </div>

      {/* OAuth callback messages */}
      {(successParam === "facebook" || successParam === "google_sheets") && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {successParam === "facebook" ? "Facebook Ads" : "Google Planilhas"} conectado com sucesso!
        </div>
      )}
      {errorParam && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {getErrorMessage(errorParam)}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* ===== FACEBOOK ADS ===== */}
        <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 glass gradient-border">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-blue-500/15 border-blue-500/20">
              <Facebook className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white/90">Facebook Ads</h3>
                {fbLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white/20" />
                ) : fbStatus?.connected ? (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Conectado
                  </span>
                ) : fbStatus?.isExpired ? (
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    Token expirado
                  </span>
                ) : null}
              </div>

              {fbStatus?.connected ? (
                <div className="mt-2 space-y-3">
                  {/* Connected info */}
                  <div className="rounded-lg glass p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-white/30">Conta:</span>
                      <span className="text-white/70 font-medium">{fbStatus.adAccountName || fbStatus.adAccountId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-white/30">Usuário:</span>
                      <span className="text-white/70">{fbStatus.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Clock className="h-3 w-3 text-white/20" />
                      <span className="text-white/30">Última sync:</span>
                      <span className="text-white/50">{formatDate(fbStatus.lastSyncAt)}</span>
                    </div>
                  </div>

                  {/* Sync result */}
                  {syncResult && (
                    <div className={`rounded-lg px-3 py-2 text-[11px] ${
                      syncResult.type === "success"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                    }`}>
                      {syncResult.text}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleFbSync}
                      disabled={syncing}
                      className="flex-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 px-3 py-2 text-[11px] font-medium hover:bg-blue-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      {syncing ? "Sincronizando..." : "Sincronizar agora"}
                    </button>
                    <button
                      onClick={handleFbDisconnect}
                      disabled={disconnecting}
                      className="rounded-xl px-3 py-2 text-[11px] font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Unplug className="h-3.5 w-3.5" />
                      Desconectar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm text-white/35">
                    Conecte sua conta do Facebook Ads para importar dados de campanhas automaticamente.
                  </p>
                  <button
                    onClick={handleFbConnect}
                    disabled={fbLoading}
                    className="mt-4 rounded-xl bg-astra-red/15 text-astra-red-light border border-astra-red/25 hover:bg-astra-red/25 glow-sm px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Conectar Facebook Ads
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== GOOGLE ADS ===== */}
        <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 glass hover:bg-white/[0.06] gradient-border">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-red-500/15 border-red-500/20">
              <BarChart3 className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white/90">Google Ads</h3>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  Em breve
                </span>
              </div>
              <p className="mt-1 text-sm text-white/35">
                Integre com o Google Ads para acompanhar campanhas de pesquisa e display.
              </p>
              <button
                disabled
                className="mt-4 rounded-xl bg-white/[0.03] text-white/20 border border-white/[0.06] cursor-not-allowed px-4 py-2 text-sm font-medium"
              >
                Indisponível
              </button>
            </div>
          </div>
        </div>

        {/* ===== GOOGLE PLANILHAS ===== */}
        <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 glass gradient-border">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-emerald-500/15 border-emerald-500/20">
              <Sheet className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white/90">Google Planilhas</h3>
                {gsLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white/20" />
                ) : gsStatus?.connected ? (
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    Conectado
                  </span>
                ) : null}
              </div>

              {gsStatus?.connected ? (
                <div className="mt-2 space-y-3">
                  <div className="rounded-lg glass p-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Mail className="h-3 w-3 text-white/20" />
                      <span className="text-white/30">Conta:</span>
                      <span className="text-white/70 font-medium">{gsStatus.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Clock className="h-3 w-3 text-white/20" />
                      <span className="text-white/30">Última sync:</span>
                      <span className="text-white/50">{formatDate(gsStatus.lastSyncAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="/configuracoes"
                      className="flex-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-2 text-[11px] font-medium hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Importar
                    </a>
                    <a
                      href="/configuracoes"
                      className="flex-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3 py-2 text-[11px] font-medium hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Exportar
                    </a>
                    <button
                      onClick={handleGsDisconnect}
                      disabled={gsDisconnecting}
                      className="rounded-xl px-3 py-2 text-[11px] font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Unplug className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm text-white/35">
                    Conecte planilhas do Google para importar e exportar dados automaticamente.
                  </p>
                  <button
                    onClick={handleGsConnect}
                    disabled={gsLoading}
                    className="mt-4 rounded-xl bg-astra-red/15 text-astra-red-light border border-astra-red/25 hover:bg-astra-red/25 glow-sm px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Conectar Google Planilhas
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ===== WEBHOOKS ===== */}
        <div className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 glass hover:bg-white/[0.06] gradient-border">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-purple-500/15 border-purple-500/20">
              <Webhook className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white/90">Webhooks</h3>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  Em breve
                </span>
              </div>
              <p className="mt-1 text-sm text-white/35">
                Configure webhooks para receber dados em tempo real de qualquer plataforma.
              </p>
              <button
                disabled
                className="mt-4 rounded-xl bg-white/[0.03] text-white/20 border border-white/[0.06] cursor-not-allowed px-4 py-2 text-sm font-medium"
              >
                Indisponível
              </button>
            </div>
          </div>
        </div>
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
