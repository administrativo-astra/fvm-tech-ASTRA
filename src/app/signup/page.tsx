"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Building2 } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          org_name: orgName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-astra-dark relative">
        <div className="pointer-events-none fixed inset-0 bg-astra-glow" />
        <div className="relative w-full max-w-md px-6">
          <div className="rounded-2xl glass-strong p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Mail className="h-7 w-7 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white/90">Verifique seu email</h2>
            <p className="text-sm text-white/40">
              Enviamos um link de confirmação para <span className="text-white/70">{email}</span>.
              Clique no link para ativar sua conta.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 rounded-xl bg-white/[0.05] border border-white/[0.08] px-6 py-2.5 text-sm font-medium text-white/60 hover:bg-white/[0.08] transition-all"
            >
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-astra-dark relative">
      <div className="pointer-events-none fixed inset-0 bg-astra-glow" />

      <div className="relative w-full max-w-md px-6">
        {/* Logo & Title */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-astra-red/10 border border-astra-red/20">
            <span className="text-3xl font-bold gradient-text">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            FVM <span className="text-astra-red">Astra</span>
          </h1>
          <p className="mt-1 text-sm text-white/35">Crie sua conta</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="rounded-2xl glass-strong p-8 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-white/90">Criar conta</h2>
            <p className="text-sm text-white/35">Preencha os dados para começar</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                Nome da organização / escola
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Nome da escola"
                  required
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full rounded-xl glass border border-white/[0.08] bg-white/[0.03] pl-10 pr-10 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:border-astra-red/30 focus:outline-none focus:ring-1 focus:ring-astra-red/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-astra-red py-2.5 text-sm font-semibold text-white hover:bg-astra-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </button>

          <p className="text-center text-sm text-white/30">
            Já tem conta?{" "}
            <Link href="/login" className="text-astra-red hover:text-astra-red-light transition-colors">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
