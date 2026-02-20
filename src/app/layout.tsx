import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FVM Astra - Funil de Vendas Metrificado",
  description: "Sistema de gestão de funil de vendas metrificado para instituições de ensino",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} noise`} suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
