"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ensureClientId, getAuth, type AuthState } from "@/lib/auth";

type PortfolioItem = {
  allocation_id: number;
  amount: number;
  created_at: string;
  title: Record<string, string | number | null> | null;
};

type Portfolio = {
  client_id: number;
  items: PortfolioItem[];
};

const formatRate = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("pt-BR");
};

const getTitleValue = (title: PortfolioItem["title"], key: string) => {
  if (!title) return null;
  const value = title[key];
  if (value === null || value === undefined || value === "") return null;
  return value;
};

export default function PortfolioPage() {
  const [clientId, setClientId] = useState("");
  const [data, setData] = useState<Portfolio | null>(null);
  const [error, setError] = useState("");
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const state = getAuth();
    setAuth(state);
    if (state?.role !== "admin") {
      loadForCurrentUser(state);
    }
  }, []);

  const loadForCurrentUser = async (state: AuthState | null) => {
    setError("");
    setData(null);
    const id = await ensureClientId(state);
    if (!id) {
      setError("Nao foi possivel identificar seu cliente.");
      return;
    }
    try {
      const payload = await apiFetch<Portfolio>(`/api/v1/allocations/client/${id}/portfolio`);
      setData(payload);
    } catch (err) {
      setError(String(err));
    }
  };

  const loadByClientId = async () => {
    setError("");
    setData(null);
    try {
      const payload = await apiFetch<Portfolio>(`/api/v1/allocations/client/${clientId}/portfolio`);
      setData(payload);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <section className="glass-panel rounded-[32px] p-8">
      <h1 className="font-display text-3xl">Carteira</h1>
      {auth?.role === "admin" ? (
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2"
            placeholder="ID do cliente"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          />
          <button
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-xs uppercase tracking-[0.3em] text-white"
            onClick={loadByClientId}
          >
            Buscar
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--muted)]">Sua carteira atual.</p>
      )}

      {error ? <div className="mt-4 text-sm text-red-700">{error}</div> : null}
      {data ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white/70">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr_0.9fr_0.8fr] gap-3 border-b border-black/10 px-4 py-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            <span>Titulo</span>
            <span>Tipo</span>
            <span>Indexador</span>
            <span>Taxa</span>
            <span>Vencimento</span>
            <span>Valor</span>
          </div>
          {data.items.map((item) => {
            const issuer = getTitleValue(item.title, "issuer");
            const type = getTitleValue(item.title, "type");
            const indexer = getTitleValue(item.title, "indexer");
            const rateText = getTitleValue(item.title, "rate_text");
            const rateValue = getTitleValue(item.title, "rate");
            const maturity = getTitleValue(item.title, "maturity_date");
            const numericRate =
              typeof rateValue === "number"
                ? rateValue
                : rateValue
                  ? Number(rateValue)
                  : null;
            const rateLabel =
              typeof rateText === "string" && rateText
                ? rateText
                : formatRate(numericRate);
            return (
              <div
                key={item.allocation_id}
                className="grid grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr_0.9fr_0.8fr] items-center gap-3 border-b border-black/5 px-4 py-4 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-display text-base" title={issuer ? String(issuer) : "Titulo"}>
                    {(issuer as string) || "Titulo"}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {formatDate(item.created_at)} · #{item.allocation_id}
                  </div>
                </div>
                <div className="min-w-0 truncate" title={type ? String(type) : "-"}>
                  {type ? String(type) : "-"}
                </div>
                <div className="min-w-0 truncate" title={indexer ? String(indexer) : "-"}>
                  {indexer ? String(indexer) : "-"}
                </div>
                <div className="min-w-0 truncate" title={rateLabel}>
                  {rateLabel}
                </div>
                <div className="min-w-0 truncate">{formatDate(maturity ? String(maturity) : null)}</div>
                <div>{formatCurrency(item.amount)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 text-sm text-[var(--muted)]">
          {auth?.role === "admin"
            ? "Informe o ID do cliente para consultar a carteira."
            : "Ainda nao ha alocacoes registradas."}
        </div>
      )}
    </section>
  );
}
