"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getAuth, type AuthState } from "@/lib/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const state = getAuth();
    if (!state) {
      router.replace("/login");
      return;
    }
    setAuth(state);
  }, [router]);

  if (!auth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-3xl px-8 py-6 text-sm uppercase tracking-[0.3em] text-[var(--muted)]">
          Carregando
        </div>
      </div>
    );
  }

  return <AppShell auth={auth}>{children}</AppShell>;
}
