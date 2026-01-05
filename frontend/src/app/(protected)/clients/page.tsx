"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getAuth } from "@/lib/auth";

type Client = {
  id: number;
  name: string;
  document: string;
  email?: string | null;
  created_at: string;
};

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

export default function ClientsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<Client[]>([]);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [portfolioError, setPortfolioError] = useState("");
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const data = await apiFetch<Client[]>("/api/v1/clients");
      setItems(data);
    } catch (err) {
      setError(String(err));
    }
  };

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    setAuthorized(true);
    load();
  }, [router]);

  const createClient = async () => {
    setError("");
    setCreating(true);
    try {
      await apiFetch<Client>("/api/v1/clients", {
        method: "POST",
        body: JSON.stringify({ name, document, email }),
      });
      setName("");
      setDocument("");
      setEmail("");
      await load();
    } catch (err) {
      setError(String(err));
    } finally {
      setCreating(false);
    }
  };

  const openPortfolio = async (client: Client) => {
    setSelected(client);
    setPortfolio(null);
    setPortfolioError("");
    setLoadingPortfolio(true);
    try {
      const data = await apiFetch<Portfolio>(`/api/v1/allocations/client/${client.id}/portfolio`);
      setPortfolio(data);
    } catch (err) {
      setPortfolioError(String(err));
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const closePortfolio = () => {
    setSelected(null);
    setPortfolio(null);
    setPortfolioError("");
  };

  const deleteClient = async (client: Client) => {
    const confirmed = window.confirm(`Excluir cliente ${client.name}?`);
    if (!confirmed) return;
    setError("");
    setDeletingId(client.id);
    try {
      await apiFetch(`/api/v1/clients/${client.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== client.id));
      if (selected?.id === client.id) {
        closePortfolio();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (!authorized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Carregando
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Create Client Form */}
      <div className="glass-panel grid-hero rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Gestão</p>
            <h1 className="font-display text-3xl text-white">Clientes</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Adicione e gerencie os clientes do sistema.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Nome</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
              placeholder="Nome completo"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Documento</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
              placeholder="CPF ou CNPJ"
              value={document}
              onChange={(event) => setDocument(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Email</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              className="btn-primary w-full rounded-full py-3 text-xs uppercase tracking-[0.3em] disabled:opacity-60"
              onClick={createClient}
              disabled={creating}
            >
              {creating ? "Criando..." : "Criar cliente"}
            </button>
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
      </div>

      {/* Client List */}
      <div className="glass-panel rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-white">Lista de clientes</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{items.length} clientes cadastrados</p>
          </div>
          <button
            className="btn-outline rounded-full px-5 py-2 text-xs uppercase tracking-[0.3em]"
            onClick={load}
          >
            Atualizar
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--muted)]">
              <svg className="mb-3 h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm">Nenhum cliente cadastrado.</p>
            </div>
          ) : (
            items.map((client, index) => (
              <div
                key={client.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{client.name}</div>
                      <div className="text-sm text-[var(--muted)]">{client.document}</div>
                      {client.email && (
                        <div className="text-sm text-[var(--muted)]">{client.email}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openPortfolio(client)}
                      className="btn-outline rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
                    >
                      Ver carteira
                    </button>
                    <button
                      onClick={() => deleteClient(client)}
                      disabled={deletingId === client.id}
                      className="rounded-full border border-[var(--danger)]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 disabled:opacity-60"
                    >
                      {deletingId === client.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Portfolio Modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-auto rounded-3xl border border-white/10 bg-[var(--surface)] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold text-white">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Carteira do cliente</p>
                  <h2 className="font-display text-2xl text-white">{selected.name}</h2>
                  <p className="text-sm text-[var(--muted)]">{selected.email || selected.document}</p>
                </div>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
                onClick={closePortfolio}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            {portfolioError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
                {portfolioError}
              </div>
            )}

            {loadingPortfolio ? (
              <div className="mt-8 flex items-center justify-center gap-3 py-12 text-[var(--muted)]">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Carregando carteira...
              </div>
            ) : portfolio && portfolio.items.length > 0 ? (
              <div className="table-modern mt-6">
                <div className="grid grid-cols-[1.3fr_0.8fr_0.9fr_0.8fr_0.9fr_0.8fr] gap-4 px-4 py-4">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Título</span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Tipo</span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Indexador</span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Taxa</span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Vencimento</span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Valor</span>
                </div>
                {portfolio.items.map((item) => {
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
                      className="grid grid-cols-[1.3fr_0.8fr_0.9fr_0.8fr_0.9fr_0.8fr] items-center gap-4 border-t border-white/5 px-4 py-4 text-sm transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white" title={issuer ? String(issuer) : "Título"}>
                          {(issuer as string) || "Título"}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {formatDate(item.created_at)} · #{item.allocation_id}
                        </div>
                      </div>
                      <div className="min-w-0 truncate text-white/70" title={type ? String(type) : "-"}>
                        {type ? String(type) : "-"}
                      </div>
                      <div className="min-w-0 truncate text-white/70" title={indexer ? String(indexer) : "-"}>
                        {indexer ? String(indexer) : "-"}
                      </div>
                      <div className="min-w-0 truncate text-white/70" title={rateLabel}>
                        {rateLabel}
                      </div>
                      <div className="min-w-0 truncate text-white/70">{formatDate(maturity ? String(maturity) : null)}</div>
                      <div className="font-medium text-white">{formatCurrency(item.amount)}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center py-12 text-[var(--muted)]">
                <svg className="mb-3 h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Nenhuma alocação encontrada.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
