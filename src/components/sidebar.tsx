"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  ShoppingCart,
  Plug,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
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
  },
];

function AstraLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main A shape with arch cutout between legs */}
      <path
        d="M50 8 L89 87 C91 91 89 94 85 91 L67 65 C61 53 56 49 50 49 C44 49 39 53 33 65 L15 91 C11 94 9 91 11 87 Z"
        fill="#E63B17"
      />
      {/* Inner decorative arc */}
      <path
        d="M31 74 C37 60 43 55 50 55 C57 55 63 60 69 74"
        stroke="#E63B17"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Constellation - center top node */}
      <circle cx="50" cy="58" r="2.8" fill="#E63B17" />
      {/* Constellation - left node */}
      <circle cx="39" cy="67" r="2.8" fill="#E63B17" />
      {/* Constellation - right node */}
      <circle cx="60" cy="65" r="2.8" fill="#E63B17" />
      {/* Connection: left stub → left node */}
      <line x1="32" y1="71" x2="39" y2="67" stroke="#E63B17" strokeWidth="2.8" strokeLinecap="round" />
      {/* Connection: left node → center top */}
      <line x1="39" y1="67" x2="50" y2="58" stroke="#E63B17" strokeWidth="2.8" strokeLinecap="round" />
      {/* Connection: center top → right node */}
      <line x1="50" y1="58" x2="60" y2="65" stroke="#E63B17" strokeWidth="2.8" strokeLinecap="round" />
      {/* Connection: right node → right stub */}
      <line x1="60" y1="65" x2="67" y2="63" stroke="#E63B17" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
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

      {/* Collapse toggle */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="p-3">
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
