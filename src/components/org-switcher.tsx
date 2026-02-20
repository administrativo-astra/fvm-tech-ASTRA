"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  role: string;
  is_active: boolean;
}

interface OrgSwitcherProps {
  collapsed?: boolean;
}

export function OrgSwitcher({ collapsed }: OrgSwitcherProps) {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeOrg = orgs.find((o) => o.is_active);

  useEffect(() => {
    fetchOrgs();
  }, []);

  function fetchOrgs() {
    setLoading(true);
    fetch("/api/organizations")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setOrgs(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAddForm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSwitch(orgId: string) {
    if (activeOrg?.id === orgId) {
      setOpen(false);
      return;
    }

    setSwitching(true);
    try {
      const res = await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (res.ok) {
        window.location.href = "/";
      }
    } catch {
      // ignore
    } finally {
      setSwitching(false);
      setOpen(false);
    }
  }

  async function handleCreateOrg() {
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName }),
      });
      if (res.ok) {
        const json = await res.json();
        // Switch to the new org
        if (json.orgId) {
          await fetch("/api/organizations/switch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organizationId: json.orgId }),
          });
          window.location.href = "/";
        }
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
      setNewOrgName("");
      setShowAddForm(false);
    }
  }

  function getRoleLabel(role: string) {
    switch (role) {
      case "owner": return "Proprietário";
      case "admin": return "Admin";
      case "viewer": return "Visualização";
      default: return role;
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  }

  if (loading) {
    return (
      <div className="mx-3 flex items-center gap-2 rounded-xl px-3 py-2.5">
        <div className="h-8 w-8 rounded-lg bg-white/[0.06] animate-pulse" />
        {!collapsed && <div className="h-4 w-24 rounded bg-white/[0.06] animate-pulse" />}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative mx-3">
      {/* Trigger button — always clickable */}
      <button
        onClick={() => { setOpen(!open); setShowAddForm(false); }}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-200",
          "hover:bg-white/[0.04] border border-transparent",
          open && "bg-white/[0.06] border-white/[0.08]"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-astra-red/10 border border-astra-red/20 text-[10px] font-bold text-astra-red">
          {activeOrg ? getInitials(activeOrg.name) : "?"}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[12px] font-semibold text-white/80">
                {activeOrg?.name || "Sem organização"}
              </p>
              <p className="text-[9px] text-white/25">
                {activeOrg ? getRoleLabel(activeOrg.role) : "Clique para adicionar"}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-white/25 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown — always opens */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-[220px] rounded-xl border border-white/[0.08] bg-[#0f0f0f] backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-white/[0.06]">
            <p className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">
              Organizações
            </p>
          </div>

          {/* Org list */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {switching ? (
              <div className="flex items-center justify-center gap-2 py-4 text-white/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-[11px]">Alternando...</span>
              </div>
            ) : (
              <>
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitch(org.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-all duration-150",
                      org.is_active
                        ? "bg-astra-red/[0.08]"
                        : "hover:bg-white/[0.04]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold",
                        org.is_active
                          ? "bg-astra-red/15 border border-astra-red/25 text-astra-red"
                          : "bg-white/[0.06] border border-white/[0.08] text-white/40"
                      )}
                    >
                      {getInitials(org.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-[11px] font-medium",
                          org.is_active ? "text-astra-red" : "text-white/60"
                        )}
                      >
                        {org.name}
                      </p>
                      <p className="text-[9px] text-white/20">{getRoleLabel(org.role)}</p>
                    </div>
                    {org.is_active && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-astra-red" />
                    )}
                  </button>
                ))}
                {orgs.length === 0 && (
                  <p className="px-3 py-3 text-[11px] text-white/25 text-center">
                    Nenhuma organização encontrada
                  </p>
                )}
              </>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Add org section */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 text-white/25">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span className="text-[11px] font-medium">Adicionar empresa</span>
            </button>
          ) : (
            <div className="p-3 space-y-2">
              <input
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateOrg()}
                placeholder="Nome da empresa"
                autoFocus
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/80 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none transition-all"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={() => { setShowAddForm(false); setNewOrgName(""); }}
                  className="flex-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-white/30 hover:text-white/50 glass transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrg}
                  disabled={creating || !newOrgName.trim()}
                  className="flex-1 rounded-lg bg-astra-red px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-astra-red/90 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Criar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
