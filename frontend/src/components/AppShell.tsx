"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout, type AuthState } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/import-titles", label: "Importar", adminOnly: true },
  { href: "/titles", label: "Titulos" },
  { href: "/clients", label: "Clientes", adminOnly: true },
];

export default function AppShell({
  auth,
  children,
}: {
  auth: AuthState;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="px-6 pt-8">
        <div className="glass-panel grid-hero mx-auto flex w-full max-w-6xl items-center justify-between rounded-3xl px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1">
              <Image
                src="https://anovainvestimentos.com.br/wp-content/uploads/2025/09/Logo.png"
                alt="Anova Investimentos"
                width={40}
                height={40}
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Anova Investimentos</p>
              <p className="font-display text-lg text-white">Painel operacional</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80">
              {auth.name || auth.email || auth.role}
            </span>
            <button
              onClick={onLogout}
              className="btn-outline rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              Sair
            </button>
          </div>
        </div>
        <nav className="mx-auto mt-6 flex w-full max-w-6xl flex-wrap gap-3">
          {NAV.filter((item) => (item.adminOnly ? auth.role === "admin" : true)).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-full px-5 py-2 text-sm uppercase tracking-[0.2em] transition-all duration-300 " +
                  (active
                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    : "border border-white/10 text-white/70 hover:border-white/30 hover:text-white")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto mt-8 w-full max-w-6xl px-6 pb-16">{children}</main>
    </div>
  );
}
