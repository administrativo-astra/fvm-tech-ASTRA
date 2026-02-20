"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { parseCSV } from "@/lib/csv-parser";
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Loader2,
  Database,
  BarChart3,
  Building2,
  Users,
  Lock,
  UserPlus,
  Trash2,
  Shield,
  Eye,
  Copy,
  CheckCircle,
} from "lucide-react";

type ImportType = "funnel" | "utm";
type ImportStatus = "idle" | "preview" | "importing" | "success" | "error";
type ActiveTab = "import" | "org" | "users" | "password";

interface OrgMember {
  id: string;
  full_name: string | null;
  role: string;
  email: string | null;
  is_self: boolean;
  created_at: string;
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("import");
  const [importType, setImportType] = useState<ImportType>("funnel");
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ imported?: number; error?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Org state
  const [orgName, setOrgName] = useState("");
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgMessage, setOrgMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileRole, setProfileRole] = useState("");

  // Users state
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "viewer">("viewer");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ type: "success" | "error"; text: string; tempPassword?: string } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/organization")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.name) setOrgName(json.data.name);
        if (json.profile?.full_name) setProfileName(json.profile.full_name);
        if (json.profile?.role) setProfileRole(json.profile.role);
      })
      .catch(() => {})
      .finally(() => setOrgLoading(false));
  }, []);

  async function handleSaveOrg() {
    setOrgSaving(true);
    setOrgMessage(null);
    try {
      const res = await fetch("/api/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      const json = await res.json();
      if (!res.ok) {
        setOrgMessage({ type: "error", text: json.error || "Erro ao salvar" });
      } else {
        setOrgMessage({ type: "success", text: "Organização atualizada!" });
      }
    } catch {
      setOrgMessage({ type: "error", text: "Erro de conexão" });
    } finally {
      setOrgSaving(false);
    }
  }

  // Users management
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.data) setMembers(json.data);
      if (json.currentRole) setCurrentRole(json.currentRole);
    } catch { /* ignore */ }
    finally { setMembersLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchMembers();
  }, [activeTab, fetchMembers]);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteResult(null);
    setCopiedPassword(false);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, full_name: inviteName }),
      });
      const json = await res.json();
      if (!res.ok) {
        setInviteResult({ type: "error", text: json.error || "Erro ao convidar" });
      } else {
        setInviteResult({
          type: "success",
          text: json.message,
          tempPassword: json.tempPassword,
        });
        setInviteEmail("");
        setInviteName("");
        fetchMembers();
      }
    } catch {
      setInviteResult({ type: "error", text: "Erro de conexão" });
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveUser(userId: string) {
    if (!confirm("Tem certeza que deseja remover este usuário da organização?")) return;
    try {
      const res = await fetch(`/api/users?userId=${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Erro ao remover");
      } else {
        fetchMembers();
      }
    } catch {
      alert("Erro de conexão");
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    try {
      const res = await fetch("/api/users/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Erro ao alterar papel");
      } else {
        fetchMembers();
      }
    } catch {
      alert("Erro de conexão");
    }
  }

  async function handleChangePassword() {
    setPwMessage(null);
    if (newPassword.length < 6) {
      setPwMessage({ type: "error", text: "A senha deve ter pelo menos 6 caracteres" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: "error", text: "As senhas não coincidem" });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPwMessage({ type: "error", text: json.error || "Erro ao alterar senha" });
      } else {
        setPwMessage({ type: "success", text: "Senha alterada com sucesso!" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwMessage({ type: "error", text: "Erro de conexão" });
    } finally {
      setPwSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "owner": return "Proprietário";
      case "admin": return "Admin";
      case "viewer": return "Usuário Padrão";
      default: return role;
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = parseCSV(text);
      setParsedRows(rows);
      setStatus("preview");
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleImport() {
    if (parsedRows.length === 0) return;
    setStatus("importing");

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: importType, data: parsedRows }),
      });

      const json = await res.json();

      if (!res.ok) {
        setResult({ error: json.error || "Erro ao importar" });
        setStatus("error");
        return;
      }

      setResult({ imported: json.imported });
      setStatus("success");
    } catch {
      setResult({ error: "Erro de conexão" });
      setStatus("error");
    }
  }

  function resetImport() {
    setStatus("idle");
    setParsedRows([]);
    setFileName("");
    setResult({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const headers = parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Configurações</h2>
        <p className="text-sm text-white/35">Gerencie sua organização e importe dados</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "import" as ActiveTab, label: "Importar Dados", icon: Upload },
          { key: "org" as ActiveTab, label: "Organização", icon: Building2 },
          { key: "users" as ActiveTab, label: "Usuários", icon: Users },
          { key: "password" as ActiveTab, label: "Alterar Senha", icon: Lock },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-astra-red/15 text-astra-red border border-astra-red/25"
                : "glass text-white/40 hover:text-white/60"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "import" && (
        <div className="space-y-6">
          {/* Import type selector */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setImportType("funnel"); resetImport(); }}
              className={`rounded-2xl p-5 text-left transition-all duration-200 ${
                importType === "funnel"
                  ? "glass-strong border border-orange-500/20 shadow-[0_0_15px_-5px_rgba(255,165,0,0.15)]"
                  : "glass hover:bg-white/[0.04]"
              }`}
            >
              <Database className={`h-6 w-6 mb-3 ${importType === "funnel" ? "text-orange-400" : "text-white/25"}`} />
              <h3 className={`text-sm font-semibold ${importType === "funnel" ? "text-white/90" : "text-white/50"}`}>
                Dados do Funil
              </h3>
              <p className="text-[11px] text-white/30 mt-1">
                Importar métricas semanais: investimento, impressões, cliques, leads, vendas...
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {["mes", "semana", "investimento", "impressoes", "cliques", "leads", "qualificados", "visitas", "vendas"].map((col) => (
                  <span key={col} className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-white/30">{col}</span>
                ))}
              </div>
            </button>
            <button
              onClick={() => { setImportType("utm"); resetImport(); }}
              className={`rounded-2xl p-5 text-left transition-all duration-200 ${
                importType === "utm"
                  ? "glass-strong border border-blue-500/20 shadow-[0_0_15px_-5px_rgba(59,130,246,0.15)]"
                  : "glass hover:bg-white/[0.04]"
              }`}
            >
              <BarChart3 className={`h-6 w-6 mb-3 ${importType === "utm" ? "text-blue-400" : "text-white/25"}`} />
              <h3 className={`text-sm font-semibold ${importType === "utm" ? "text-white/90" : "text-white/50"}`}>
                Dados UTM
              </h3>
              <p className="text-[11px] text-white/30 mt-1">
                Importar dados por campanha, conjunto e criativo com métricas de performance
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {["campanha", "conjunto", "criativo", "fonte", "leads", "qualificados", "visitas", "vendas"].map((col) => (
                  <span key={col} className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-white/30">{col}</span>
                ))}
              </div>
            </button>
          </div>

          {/* Upload area */}
          {status === "idle" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl glass border-2 border-dashed border-white/[0.08] hover:border-astra-red/25 p-12 text-center transition-all duration-300"
            >
              <Upload className="mx-auto h-10 w-10 text-white/15 group-hover:text-astra-red/50 transition-colors" />
              <h3 className="mt-4 text-sm font-semibold text-white/50 group-hover:text-white/70">
                Arraste ou clique para selecionar
              </h3>
              <p className="mt-1 text-[11px] text-white/25">
                Formatos aceitos: CSV, separado por vírgula ou ponto-e-vírgula
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Preview */}
          {status === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-white/70">{fileName}</p>
                    <p className="text-[11px] text-white/30">{parsedRows.length} linhas detectadas</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetImport}
                    className="rounded-lg px-4 py-2 text-[11px] font-medium text-white/40 hover:text-white/60 glass transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    className="rounded-lg bg-astra-red px-4 py-2 text-[11px] font-semibold text-white hover:bg-astra-red/90 transition-all glow-sm"
                  >
                    Importar {parsedRows.length} linhas
                  </button>
                </div>
              </div>

              {/* Preview table */}
              <div className="rounded-xl glass-strong overflow-hidden">
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-[11px]">
                    <thead className="sticky top-0 bg-astra-dark/95 backdrop-blur-sm">
                      <tr className="border-b border-white/[0.06]">
                        <th className="px-3 py-2 text-left text-[9px] font-semibold text-white/30 uppercase tracking-wider">#</th>
                        {headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-[9px] font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="px-3 py-2 text-white/20">{i + 1}</td>
                          {headers.map((h) => (
                            <td key={h} className="px-3 py-2 text-white/50 whitespace-nowrap max-w-[200px] truncate">
                              {row[h]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 20 && (
                    <p className="px-3 py-2 text-[10px] text-white/20 text-center">
                      ...e mais {parsedRows.length - 20} linhas
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Importing */}
          {status === "importing" && (
            <div className="rounded-2xl glass-strong p-12 text-center">
              <Loader2 className="mx-auto h-10 w-10 text-astra-red animate-spin" />
              <p className="mt-4 text-sm font-medium text-white/50">Importando {parsedRows.length} registros...</p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="rounded-2xl glass-strong p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <Check className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white/90">Importação concluída!</h3>
              <p className="text-sm text-white/40">
                <span className="text-emerald-400 font-bold">{result.imported}</span> registros importados com sucesso.
              </p>
              <button
                onClick={resetImport}
                className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-6 py-2.5 text-sm font-medium text-white/60 hover:bg-white/[0.08] transition-all"
              >
                Importar mais dados
              </button>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="rounded-2xl glass-strong p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white/90">Erro na importação</h3>
              <p className="text-sm text-red-400/70">{result.error}</p>
              <button
                onClick={resetImport}
                className="rounded-lg bg-white/[0.05] border border-white/[0.08] px-6 py-2.5 text-sm font-medium text-white/60 hover:bg-white/[0.08] transition-all"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Column mapping guide */}
          <div className="rounded-2xl glass p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white/60">Guia de colunas aceitas</h3>
            {importType === "funnel" ? (
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {[
                  { header: "mes / month / Mês", desc: "Nome do mês (ex: Janeiro)" },
                  { header: "semana / week / Semana", desc: "Nome da semana (ex: Semana 1)" },
                  { header: "investimento / spent", desc: "Valor investido (R$)" },
                  { header: "impressoes / impressions", desc: "Número de impressões" },
                  { header: "alcance / reach", desc: "Alcance" },
                  { header: "cliques / clicks", desc: "Cliques" },
                  { header: "leads / Leads", desc: "Leads gerados" },
                  { header: "qualificados / qualified_leads", desc: "Leads qualificados" },
                  { header: "visitas / visits", desc: "Visitas agendadas" },
                  { header: "vendas / sales / matriculas", desc: "Matrículas/vendas" },
                ].map((item) => (
                  <div key={item.header} className="flex gap-2">
                    <code className="shrink-0 rounded bg-orange-500/10 px-1.5 py-0.5 text-orange-400/70">{item.header}</code>
                    <span className="text-white/30">{item.desc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {[
                  { header: "campanha / utm_campaign", desc: "Nome da campanha" },
                  { header: "conjunto / utm_term / adset_name", desc: "Nome do conjunto" },
                  { header: "criativo / utm_content / ad_name", desc: "Nome do criativo" },
                  { header: "fonte / utm_source", desc: "Fonte (Facebook, Google...)" },
                  { header: "meio / utm_medium", desc: "Meio (Paid-Social, CPC...)" },
                  { header: "leads / Leads", desc: "Leads gerados" },
                  { header: "qualificados / qualified_leads", desc: "Leads qualificados" },
                  { header: "visitas / visits", desc: "Visitas" },
                  { header: "vendas / sales", desc: "Vendas/matrículas" },
                  { header: "interacoes / interactions", desc: "Total de interações UTM" },
                ].map((item) => (
                  <div key={item.header} className="flex gap-2">
                    <code className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-400/70">{item.header}</code>
                    <span className="text-white/30">{item.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "org" && (
        <div className="space-y-6">
          {/* Org info */}
          <div className="rounded-2xl glass-strong p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-astra-red/10 border border-astra-red/20">
                <Building2 className="h-6 w-6 text-astra-red" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">Organização</h3>
                <p className="text-[11px] text-white/30">Gerencie os dados da sua organização</p>
              </div>
            </div>

            {orgLoading ? (
              <div className="flex items-center gap-2 text-white/30">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                    Nome da organização
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Nome da escola"
                    className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                  />
                </div>

                {orgMessage && (
                  <div className={`rounded-xl px-4 py-3 text-sm ${
                    orgMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    {orgMessage.text}
                  </div>
                )}

                <button
                  onClick={handleSaveOrg}
                  disabled={orgSaving || !orgName.trim()}
                  className="rounded-xl bg-astra-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-astra-red/90 transition-all glow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {orgSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {orgSaving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="rounded-2xl glass p-6 space-y-3">
            <h3 className="text-sm font-semibold text-white/50">Seu perfil</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Nome</p>
                <p className="text-sm text-white/70 mt-0.5">{profileName || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Função</p>
                <p className="text-sm text-white/70 mt-0.5 capitalize">{getRoleLabel(profileRole)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Invite form */}
          <div className="rounded-2xl glass-strong p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-astra-red/10 border border-astra-red/20">
                <UserPlus className="h-6 w-6 text-astra-red" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">Adicionar Usuário</h3>
                <p className="text-[11px] text-white/30">Convide membros para acessar o painel da organização</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nome do usuário"
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                  Tipo de acesso
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "viewer")}
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all appearance-none"
                >
                  <option value="viewer" className="bg-astra-dark text-white">Usuário Padrão</option>
                  <option value="admin" className="bg-astra-dark text-white">Admin</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full rounded-xl bg-astra-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-astra-red/90 transition-all glow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {inviting ? "Adicionando..." : "Adicionar"}
                </button>
              </div>
            </div>

            {inviteResult && (
              <div className={`rounded-xl px-4 py-3 text-sm ${
                inviteResult.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}>
                <p>{inviteResult.text}</p>
                {inviteResult.tempPassword && (
                  <div className="mt-3 rounded-lg bg-black/30 p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Senha temporária</p>
                      <p className="text-sm font-mono text-white/80 mt-0.5">{inviteResult.tempPassword}</p>
                      <p className="text-[10px] text-amber-400/60 mt-1">Envie essa senha ao usuário. Ele pode alterá-la nas configurações.</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(inviteResult.tempPassword!)}
                      className="shrink-0 rounded-lg glass px-3 py-2 text-white/40 hover:text-white/70 transition-all flex items-center gap-1.5"
                    >
                      {copiedPassword ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      <span className="text-[10px]">{copiedPassword ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Role explanation */}
            <div className="rounded-xl glass p-4">
              <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Tipos de acesso</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-astra-red shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-white/70">Admin</p>
                    <p className="text-[10px] text-white/30">Acesso completo: Home, Marketing, Vendas, Integrações e Configurações</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Eye className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-white/70">Usuário Padrão</p>
                    <p className="text-[10px] text-white/30">Apenas visualização: Home, Marketing e Vendas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Members list */}
          <div className="rounded-2xl glass-strong overflow-hidden">
            <div className="border-b border-astra-red/10 bg-astra-red/[0.04] px-6 py-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-astra-red/80">
                Membros da Organização
              </h3>
              <span className="text-[10px] text-white/30">{members.length} membro{members.length !== 1 ? "s" : ""}</span>
            </div>

            {membersLoading ? (
              <div className="flex items-center justify-center gap-2 p-8 text-white/30">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-sm font-bold text-white/40">
                        {(member.full_name || member.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white/80">
                            {member.full_name || "Sem nome"}
                          </p>
                          {member.is_self && (
                            <span className="rounded-full bg-astra-red/10 border border-astra-red/20 px-1.5 py-0.5 text-[9px] font-medium text-astra-red">
                              Você
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/30">{member.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {member.role === "owner" ? (
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
                          Proprietário
                        </span>
                      ) : member.is_self ? (
                        <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-2.5 py-1 text-[10px] font-semibold text-white/50">
                          {getRoleLabel(member.role)}
                        </span>
                      ) : (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value)}
                            className="rounded-lg glass border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/70 focus:outline-none focus:border-astra-red/30 transition-all appearance-none cursor-pointer"
                          >
                            <option value="admin" className="bg-astra-dark text-white">Admin</option>
                            <option value="viewer" className="bg-astra-dark text-white">Usuário Padrão</option>
                          </select>
                          <button
                            onClick={() => handleRemoveUser(member.id)}
                            className="rounded-lg p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Remover usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PASSWORD TAB ===== */}
      {activeTab === "password" && (
        <div className="max-w-lg">
          <div className="rounded-2xl glass-strong p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-astra-red/10 border border-astra-red/20">
                <Lock className="h-6 w-6 text-astra-red" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">Alterar Senha</h3>
                <p className="text-[11px] text-white/30">Defina uma nova senha para sua conta</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
              </div>

              {pwMessage && (
                <div className={`rounded-xl px-4 py-3 text-sm ${
                  pwMessage.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}>
                  {pwMessage.text}
                </div>
              )}

              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !newPassword || !confirmPassword}
                className="rounded-xl bg-astra-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-astra-red/90 transition-all glow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {pwSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {pwSaving ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
