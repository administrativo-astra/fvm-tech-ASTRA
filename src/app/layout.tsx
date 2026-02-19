import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

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
        <div className="flex min-h-screen bg-astra-dark">
          <Sidebar />
          <div className="flex-1 pl-[240px]">
            <Header />
            <main className="p-6 relative">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
