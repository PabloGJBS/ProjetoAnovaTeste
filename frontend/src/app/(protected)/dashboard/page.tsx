"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ensureClientId, getAuth, type AuthState } from "@/lib/auth";
import { PerformanceChart, AllocationChart, samplePerformanceData, sampleAllocationData } from "@/components/ChartComponents";

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

type RecentAllocation = {
  allocation_id: number;
  amount: number;
  created_at: string;
  client: { id: number; name: string; email?: string | null };
  title: Record<string, string | number | null> | null;
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

export default function Dashboard() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [recent, setRecent] = useState<RecentAllocation[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const state = getAuth();
    setAuth(state);
    if (state?.role === "admin") {
      loadRecent();
      return;
    }
    loadPortfolio(state);
  }, []);

  const loadPortfolio = async (state: AuthState | null) => {
    setError("");
    const id = await ensureClientId(state);
    if (!id) {
      setError("Não foi possível identificar seu cliente.");
      return;
    }
    try {
      const data = await apiFetch<Portfolio>(`/api/v1/allocations/client/${id}/portfolio`);
      setPortfolio(data);
    } catch (err) {
      setError(String(err));
    }
  };

  const loadRecent = async () => {
    setError("");
    try {
      const data = await apiFetch<RecentAllocation[]>("/api/v1/allocations/recent?limit=20");
      setRecent(data);
    } catch (err) {
      setError(String(err));
    }
  };

  const distribution = useMemo(() => {
    if (!portfolio?.items.length) return [] as { label: string; value: number; color: string }[];
    const totals = new Map<string, number>();
    let total = 0;
    for (const item of portfolio.items) {
      const type = (item.title?.type as string) || "Outro";
      totals.set(type, (totals.get(type) || 0) + item.amount);
      total += item.amount;
    }
    const colors = ["#ffffff", "rgba(255,255,255,0.7)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"];
    return Array.from(totals.entries())
      .map(([label, value], index) => ({
        label,
        value: total ? (value / total) * 100 : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [portfolio]);

  const totalInvested = useMemo(() => {
    if (!portfolio?.items.length) return 0;
    return portfolio.items.reduce((acc, item) => acc + item.amount, 0);
  }, [portfolio]);

  const topBucket = distribution[0];

  // Admin view
  if (auth?.role === "admin") {
    return (
      <div className="grid gap-6">
        {/* Header Section */}
        <section className="glass-panel grid-hero rounded-3xl p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Resumo</p>
              <h1 className="font-display text-3xl text-white">Atividade recente</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Últimas alocações realizadas pelos clientes.</p>
            </div>
            <div className="flex gap-3">
              <div className="stat-card min-w-[140px]">
                <div className="text-2xl font-semibold text-white">{recent.length}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Alocações</div>
              </div>
              <div className="stat-card min-w-[140px]">
                <div className="text-2xl font-semibold text-white">
                  {formatCurrency(recent.reduce((acc, item) => acc + item.amount, 0))}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Total</div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            {error}
          </div>
        )}

        {/* Recent Allocations Table */}
        <div className="table-modern">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 px-6 py-4">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--muted)]">Cliente</span>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--muted)]">Título</span>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--muted)]">Valor</span>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--muted)]">Data</span>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-[var(--muted)]">
              <svg className="mx-auto mb-3 h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Sem alocações recentes.
            </div>
          ) : (
            recent.map((item, index) => {
              const titleLabel = (item.title?.issuer as string) || (item.title?.type as string) || "-";
              return (
                <div
                  key={item.allocation_id}
                  className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr] items-center gap-4 px-6 py-4 transition-colors hover:bg-white/[0.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    <div className="font-medium text-white">{item.client.name}</div>
                    <div className="text-xs text-[var(--muted)]">{item.client.email || "-"}</div>
                  </div>
                  <div className="min-w-0 truncate text-white/80" title={titleLabel}>{titleLabel}</div>
                  <div className="font-medium text-white">{formatCurrency(item.amount)}</div>
                  <div className="text-xs text-[var(--muted)]">{formatDate(item.created_at)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Client view
  const [showTitles, setShowTitles] = useState(false);

  return (
    <div className="grid gap-6">
      {/* Header Section */}
      <section className="glass-panel grid-hero rounded-3xl p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Distribuição</p>
            <button
              onClick={() => setShowTitles(!showTitles)}
              className="group flex items-center gap-2 text-left transition-colors hover:opacity-80"
            >
              <h1 className="font-display text-3xl text-white">Seu portfólio</h1>
              <svg
                className={`h-5 w-5 text-[var(--muted)] transition-transform duration-300 ${showTitles ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {showTitles ? 'Clique para ocultar detalhes.' : 'Clique para ver seus títulos.'}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="stat-card min-w-[160px]">
              <div className="text-2xl font-semibold text-white">{formatCurrency(totalInvested)}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Total investido</div>
            </div>
            <div
              className="stat-card min-w-[100px] cursor-pointer transition-transform hover:scale-105"
              onClick={() => setShowTitles(!showTitles)}
            >
              <div className="text-2xl font-semibold text-white">{portfolio?.items.length || 0}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Alocações</div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
          </svg>
          {error}
        </div>
      )}

      {/* Portfolio Titles Table - Expandable */}
      {showTitles && (
        <section className="glass-panel rounded-3xl p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Detalhes</p>
              <h2 className="font-display text-xl text-white">Meus títulos</h2>
            </div>
            <button
              onClick={() => setShowTitles(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white"
            >
              ✕
            </button>
          </div>

          {portfolio?.items.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">
              <svg className="mx-auto mb-3 h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Você ainda não possui títulos alocados.
            </div>
          ) : (
            <div className="table-modern">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Tipo</th>
                    <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Emissor</th>
                    <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Indexador</th>
                    <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Taxa</th>
                    <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Valor</th>
                    <th className="px-4 py-4 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio?.items.map((item, index) => (
                    <tr
                      key={item.allocation_id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-4 py-4">
                        <span className="badge badge-warning">
                          {(item.title?.type as string) || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-white">
                          {(item.title?.issuer as string) || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white/70">
                        {(item.title?.indexer as string) || "-"}
                      </td>
                      <td className="px-4 py-4 text-right text-white/70">
                        {(item.title?.rate_text as string) ||
                          (item.title?.rate ? `${Number(item.title.rate).toFixed(2)}%` : "-")}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-white">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-[var(--muted)]">
                        {formatDate(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.02]">
                    <td colSpan={4} className="px-4 py-4 text-right text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      Total investido
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-white">
                      {formatCurrency(totalInvested)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart data={samplePerformanceData} title="Performance da carteira" />
        <AllocationChart
          data={distribution.length > 0
            ? distribution.map(d => ({ name: d.label, value: Math.round(d.value), color: d.color }))
            : sampleAllocationData
          }
          title="Alocação por tipo"
        />
      </div>

      {/* Distribution Bars */}
      <section className="glass-panel grid-hero rounded-3xl p-8">
        <h2 className="font-display text-xl text-white">Distribuição detalhada</h2>
        <div className="mt-6 space-y-5">
          {distribution.length === 0 ? (
            <div className="py-4 text-sm text-[var(--muted)]">
              <svg className="mx-auto mb-3 h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-center">Ainda não há alocações.</p>
            </div>
          ) : (
            distribution.map((item, index) => (
              <div key={item.label} className="space-y-2" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">{item.label}</span>
                  <span className="font-medium text-white">{item.value.toFixed(0)}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
