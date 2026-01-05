"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getApiBase } from "@/lib/api";
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "";

export default function ImportTitlesPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (!auth || auth.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!file) {
      setError("Selecione um arquivo");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${getApiBase()}/api/v1/import/titles`, {
        method: "POST",
        headers: {
          "X-ADMIN-KEY": ADMIN_KEY,
        },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data.detail || data));
        return;
      }

      setStatus(`Importados: ${data.titles_count} títulos`);
      setFile(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (selected: File | null) => {
    setFile(selected);
    setError("");
    setStatus("");
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0] || null;
    if (dropped) {
      handleFileChange(dropped);
    }
  };

  return (
    <section className="glass-panel grid-hero rounded-3xl p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">Administração</p>
          <h1 className="font-display text-3xl text-white">Importar títulos</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Envie Excel ou CSV. Apenas administradores podem importar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <label
          className={
            "relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-all duration-300 " +
            (dragging
              ? "border-white bg-white/10"
              : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10")
          }
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${dragging ? 'bg-white/20' : 'bg-white/10'}`}>
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 3h6l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 3v5h5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v6m-3-3l3-3 3 3" />
            </svg>
          </div>
          <div>
            <p className="text-base text-white">
              {dragging ? "Solte o arquivo aqui" : "Arraste o arquivo aqui ou clique para escolher"}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              XLSX ou CSV
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xlsm"
            onChange={(event) => handleFileChange(event.target.files?.[0] || null)}
          />
          {file && (
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2">
              <svg className="h-4 w-4 text-[var(--success)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="max-w-[200px] truncate text-sm text-white" title={file.name}>
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFile(null);
                }}
                className="ml-1 text-white/50 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </label>

        <button
          type="submit"
          disabled={loading || !file}
          className="btn-primary w-full rounded-full py-4 text-sm uppercase tracking-[0.3em] disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Importando...
            </span>
          ) : (
            "Enviar arquivo"
          )}
        </button>

        {/* Progress Bar during loading */}
        {loading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>Processando arquivo...</span>
              <span className="animate-pulse">Aguarde</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-white/50 to-white animate-pulse"
                style={{
                  width: '100%',
                  animation: 'loading-progress 2s ease-in-out infinite',
                }}
              />
            </div>
            <style jsx>{`
              @keyframes loading-progress {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        )}
      </form>

      {status && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-5 py-4 text-[var(--success)]">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
          </svg>
          <span className="text-sm">{status}</span>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-5 py-4 text-[var(--danger)]">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}
    </section>
  );
}
