"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  ShoppingCart,
  Plug,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { OrgSwitcher } from "@/components/org-switcher";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: Megaphone,
  },
  {
    label: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
  },
  {
    label: "Integrações",
    href: "/integracoes",
    icon: Plug,
    adminOnly: true,
  },
];

function AstraLogo({ size = 32 }: { size?: number }) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 0 L95 105 Q97 112 90 110 L68 68 Q62 52 50 52 Q38 52 32 68 L10 110 Q3 112 5 105 Z" fill="#E63B17"/>
        <path d="M30 80 Q38 62 50 62 Q62 62 70 80" stroke="#0A0A0A" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <circle cx="42" cy="72" r="3" fill="#0A0A0A"/>
        <circle cx="50" cy="64" r="3" fill="#0A0A0A"/>
        <circle cx="58" cy="70" r="3" fill="#0A0A0A"/>
        <line x1="42" y1="72" x2="50" y2="64" stroke="#0A0A0A" strokeWidth="2.5"/>
        <line x1="50" y1="64" x2="58" y2="70" stroke="#0A0A0A" strokeWidth="2.5"/>
      </svg>
    );
  }

  return (
    <Image
      src="/astra-logo.png"
      alt="Astra"
      width={size}
      height={size}
      className="object-contain"
      priority
      onError={() => setImgError(true)}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/organization")
      .then((res) => res.json())
      .then((json) => {
        if (json.profile?.role) setUserRole(json.profile.role);
      })
      .catch(() => {});
  }, []);

  const isAdmin = userRole === "owner" || userRole === "admin";

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-astra-dark border-r border-white/[0.06] text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <AstraLogo size={34} />
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-white">
                FVM <span className="text-astra-red">Astra</span>
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                Funil Metrificado
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <AstraLogo size={30} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Org Switcher */}
      <div className="py-3">
        <OrgSwitcher collapsed={collapsed} />
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive &&
                  "bg-astra-red/10 text-astra-red shadow-[inset_0_0_0_1px_rgba(230,59,23,0.15)]",
                !isActive &&
                  "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive && "text-astra-red",
                  !isActive && "group-hover:text-white/70"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-astra-red" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="p-3 space-y-1">
        {isAdmin && (
          <Link
            href="/configuracoes"
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname.startsWith("/configuracoes")
                ? "bg-astra-red/10 text-astra-red shadow-[inset_0_0_0_1px_rgba(230,59,23,0.15)]"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
            )}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Configurações</span>}
          </Link>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 disabled:opacity-50"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>{loggingOut ? "Saindo..." : "Sair"}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl p-2 text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
