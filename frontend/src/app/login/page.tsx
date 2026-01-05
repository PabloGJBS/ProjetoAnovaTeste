"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const auth = await login(email.trim(), password);
    setLoading(false);
    if (!auth) {
      setError("Credenciais inválidas");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-white/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] top-[-60px] h-[400px] w-[400px] rounded-full bg-white/3 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[20%] h-[400px] w-[400px] rounded-full bg-white/5 blur-[150px]" />

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-50" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-[28px] border border-white/10 bg-[var(--surface)]/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.45em] text-[var(--muted)]">Acesso</p>
            <h1 className="font-display text-3xl text-white">Entrar</h1>
            <p className="text-sm text-[var(--muted)]">Use seu email corporativo para continuar.</p>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Email
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Senha
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-14 text-sm text-white placeholder:text-white/30"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((state) => !state)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
                  >
                    {showPassword ? (
                      <>
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.83 2.83" />
                        <path d="M6.6 6.6C4.5 8 3 10.2 2.2 12c1.5 3.3 5.1 6 9.8 6 1.7 0 3.2-.3 4.6-.9" />
                        <path d="M9.5 5.1c.8-.2 1.6-.3 2.5-.3 4.7 0 8.3 2.7 9.8 6-.5 1.1-1.2 2.1-2 3" />
                      </>
                    ) : (
                      <>
                        <path d="M2.2 12c1.5-3.3 5.1-6 9.8-6s8.3 2.7 9.8 6c-1.5 3.3-5.1 6-9.8 6s-8.3-2.7-9.8-6Z" />
                        <circle cx="12" cy="12" r="3.2" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-8 w-full rounded-full py-4 text-xs uppercase tracking-[0.35em] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Entrando...
              </span>
            ) : (
              "Acessar"
            )}
          </button>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
            <span>Primeiro acesso?</span>
            <Link
              className="text-white transition-colors hover:text-white/80"
              href="/register"
            >
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
