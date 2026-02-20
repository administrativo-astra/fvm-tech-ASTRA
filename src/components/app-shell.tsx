"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

const authRoutes = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [orgName, setOrgName] = useState<string | null>(null);
  const isAuthPage = authRoutes.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isAuthPage) return;
    fetch("/api/organization")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.name) setOrgName(json.data.name);
      })
      .catch(() => {});
  }, [isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-astra-dark">
      <Sidebar />
      <div className="flex-1 pl-[240px]">
        <Header clientName={orgName || undefined} />
        <main className="p-6 relative">{children}</main>
      </div>
    </div>
  );
}
