"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "@/lib/api";
import { ensureClientId, getAuth, type AuthState } from "@/lib/auth";

type Title = {
  id: string;
  type: string;
  issuer: string;
  rate?: number | null;
  rate_text?: string | null;
  indexer?: string | null;
  maturity_date?: string | null;
  min_application?: number | null;
  rating?: string | null;
};

const formatRate = (value?: number | null) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCurrency = (value?: number | null) => {
  if (!value && value !== 0) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("pt-BR");
};

// Portal Component for consistency
const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};

export default function TitlesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [items, setItems] = useState<Title[]>([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Title | null>(null);
  const [quantity, setQuantity] = useState("");
  const [allocError, setAllocError] = useState("");
  const [allocStatus, setAllocStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    setAuth(getAuth());
    load();
  }, []);

  const load = async () => {
    setError("");
    try {
      const data = await apiFetch<Title[]>("/api/v1/titles");
      setItems(data);
    } catch (err) {
      setError(String(err));
    }
  };

  const closeModal = () => {
    setSelected(null);
    setQuantity("");
    setAllocError("");
    setAllocStatus("");
  };

  const onAllocate = async () => {
    if (!selected) return;
    setAllocError("");
    setAllocStatus("");
    setLoading(true);

    const clientId = await ensureClientId(auth);
    if (!clientId) {
      setAllocError("Não foi possível identificar seu cliente.");
      setLoading(false);
      return;
    }

    const unitValue = selected.min_application;
    if (!unitValue) {
      setAllocError("Título sem valor mínimo definido.");
      setLoading(false);
      return;
    }

    const parsedQuantity = Number.parseInt(quantity, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setAllocError("Informe uma quantidade inteira válida.");
      setLoading(false);
      return;
    }

    const totalValue = parsedQuantity * unitValue;

    try {
      await apiFetch("/api/v1/allocations", {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          title_id: selected.id,
          amount: totalValue,
        }),
      });
      setAllocStatus("Alocação registrada com sucesso.");
      setQuantity("");
    } catch (err) {
      setAllocError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const canAllocate = auth?.role !== "admin";
  const availableTypes = useMemo(
    () =>
      Array.from(
        new Set(items.map((item) => item.type).filter((item): item is string => Boolean(item)))
      ).sort((a, b) => a.localeCompare(b)),
    [items]
  );
  const tableItems = useMemo(() => {
    if (selectedTypes.length === 0) return items;
    return items.filter((item) => item.type && selectedTypes.includes(item.type));
  }, [items, selectedTypes]);
  const modalRateLabel = selected?.rate_text || formatRate(selected?.rate);
  const unitValue = selected?.min_application;
  const parsedQuantity = Number.parseInt(quantity, 10);
  const totalValue =
    unitValue && Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? unitValue * parsedQuantity
      : null;

  return (
    <>
      <section className="glass-panel grid-hero rounded-3xl p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Investimentos</p>
            <h1 className="font-display text-3xl text-white">Catálogo de títulos</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Títulos disponíveis para alocação.</p>
            {selectedTypes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {selectedTypes.map((type) => (
                  <span key={type} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/80">
                    {type}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex gap-3">
            <button
              className="btn-outline rounded-full px-5 py-2 text-xs uppercase tracking-[0.3em]"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              Filtrar
            </button>
            <button
              className="btn-primary rounded-full px-5 py-2 text-xs uppercase tracking-[0.3em]"
              onClick={load}
            >
              Atualizar
            </button>
            {showFilters && (
              <div className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-white/10 bg-[var(--surface)] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Tipo</p>
                <div className="mt-3 space-y-2 text-sm">
                  {availableTypes.length === 0 ? (
                    <div className="text-xs text-[var(--muted)]">Sem opções.</div>
                  ) : (
                    availableTypes.map((type) => (
                      <label key={type} className="flex cursor-pointer items-center gap-3 text-white/80 hover:text-white">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-white/20 bg-white/10"
                          checked={selectedTypes.includes(type)}
                          onChange={(event) => {
                            setSelectedTypes((prev) =>
                              event.target.checked
                                ? [...prev, type]
                                : prev.filter((item) => item !== type)
                            );
                          }}
                        />
                        <span>{type}</span>
                      </label>
                    ))
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    className="text-xs uppercase tracking-[0.3em] text-[var(--muted)] hover:text-white"
                    onClick={() => setSelectedTypes([])}
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    className="btn-primary rounded-full px-4 py-2 text-xs uppercase tracking-[0.3em]"
                    onClick={() => setShowFilters(false)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
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

        <div className="table-modern mt-6">
          {tableItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--muted)]">
              <svg className="mb-3 h-12 w-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Nenhum título disponível.</p>
            </div>
          ) : (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="w-[10%] px-4 py-4 text-left text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Tipo</th>
                  <th className="w-[22%] px-4 py-4 text-left text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Emissor</th>
                  <th className="w-[14%] px-4 py-4 text-left text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Indexador</th>
                  <th className="w-[10%] px-4 py-4 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Taxa</th>
                  <th className="w-[14%] px-4 py-4 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Vencimento</th>
                  <th className="w-[12%] px-4 py-4 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Min.</th>
                  <th className="w-[10%] px-4 py-4 text-right text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]"></th>
                </tr>
              </thead>
              <tbody>
                {tableItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-4">
                      <span className="badge badge-warning" title={item.type || "-"}>
                        {item.type || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block truncate font-medium text-white" title={item.issuer || "-"}>
                        {item.issuer || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block truncate text-white/70" title={item.indexer || "-"}>
                        {item.indexer || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-white/70">
                      <span className="block truncate" title={item.rate_text || ""}>
                        {item.rate_text || formatRate(item.rate)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums text-white/70">
                      {formatDate(item.maturity_date)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums font-medium text-white">
                      {formatCurrency(item.min_application)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {canAllocate ? (
                        <button
                          onClick={() => setSelected(item)}
                          className="btn-outline rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em]"
                        >
                          Alocar
                        </button>
                      ) : (
                        <span className="badge">Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Allocation Modal with Portal */}
      {selected && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={closeModal}>
            <div
              className="w-full max-w-md animate-fade-in rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Nova alocação</p>
                  <h2 className="font-display text-2xl text-white">{selected.issuer}</h2>
                  <p className="text-sm text-[var(--muted)]">{selected.type}</p>
                </div>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white"
                  onClick={closeModal}
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Indexador</span>
                  <span className="text-white">{selected.indexer || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Taxa</span>
                  <span className="text-white">{modalRateLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Vencimento</span>
                  <span className="text-white">{formatDate(selected.maturity_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Valor unitário</span>
                  <span className="font-medium text-white">{formatCurrency(selected.min_application)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    Quantidade de títulos
                  </label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30"
                    placeholder="Ex: 10"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Total estimado</span>
                  <span className="text-lg font-semibold text-white">{totalValue ? formatCurrency(totalValue) : "-"}</span>
                </div>

                {allocError && (
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
                    </svg>
                    {allocError}
                  </div>
                )}
                {allocStatus && (
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3 text-sm text-[var(--success)]">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
                    </svg>
                    {allocStatus}
                  </div>
                )}

                <button
                  onClick={onAllocate}
                  disabled={loading || !unitValue}
                  className="btn-primary w-full rounded-full py-4 text-xs uppercase tracking-[0.3em] disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Salvando...
                    </span>
                  ) : (
                    "Confirmar alocação"
                  )}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
