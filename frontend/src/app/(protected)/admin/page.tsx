"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    router.replace("/clients");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Redirecionando</div>
    </div>
  );
}
