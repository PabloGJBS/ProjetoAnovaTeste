import Image from "next/image";
import Link from "next/link";

const stats = [
  { label: "Total investido", value: "R$ 250M+", trend: "+15%" },
  { label: "Investidores ativos", value: "2.5k+", trend: "+8%" },
  { label: "Operações concluídas", value: "35+", trend: "+12%" },
  { label: "Investimento mínimo", value: "R$ 1.000", trend: null },
];

const steps = [
  {
    title: "Cadastro e validação",
    body: "Crie clientes e valide documentos rapidamente.",
    icon: "01"
  },
  {
    title: "Importe títulos",
    body: "Suba Excel ou CSV para alimentar o catálogo.",
    icon: "02"
  },
  {
    title: "Aloque capital",
    body: "Distribua valores e registre cada operação.",
    icon: "03"
  },
  {
    title: "Acompanhe carteira",
    body: "Visão consolidada com dados enriquecidos.",
    icon: "04"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
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
          <div className="text-xs uppercase tracking-[0.35em] text-white/70">Anova Investimentos</div>
        </div>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.35em] text-white/50 md:flex">
          <span className="cursor-pointer transition-colors hover:text-white">Início</span>
          <span className="cursor-pointer transition-colors hover:text-white">Títulos</span>
          <span className="cursor-pointer transition-colors hover:text-white">Sobre</span>
          <span className="cursor-pointer transition-colors hover:text-white">Contato</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/80 transition-all duration-300 hover:border-white/50 hover:text-white"
            href="/login"
          >
            Entrar
          </Link>
          <Link
            className="btn-primary rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em]"
            href="/login"
          >
            Acessar
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-surface">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)]"></span>
              Sistema de Gestão de Investimentos
            </div>
            <h1 className="font-display text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl">
              Gerencie seus
              <span className="text-gradient"> investimentos </span>
              de forma simples e eficiente
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/60">
              Centralize importação de títulos, organize clientes e acompanhe carteiras com dados enriquecidos em tempo real.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                className="btn-primary animate-pulse-glow rounded-full px-8 py-4 text-center text-xs uppercase tracking-[0.35em]"
                href="/login"
              >
                Acessar sistema
              </Link>
              <Link
                className="btn-outline rounded-full px-8 py-4 text-center text-xs uppercase tracking-[0.35em]"
                href="/login"
              >
                Ver plataforma
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-xs uppercase tracking-[0.3em] text-white/40">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Seguro
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confiável
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Eficiente
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((item, index) => (
              <div
                key={item.label}
                className="stat-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl font-semibold text-white">{item.value}</div>
                  {item.trend && (
                    <span className="badge badge-success">{item.trend}</span>
                  )}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.35em] text-white/50">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-display text-3xl text-white md:text-4xl">
            Como a <span className="text-gradient">Anova Investimentos</span> funciona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Fluxo simples e orientado a dados para gestão de clientes e carteiras de investimento.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="step-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
                {step.icon}
              </div>
              <h3 className="font-display text-lg text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/5 bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-8 px-6 py-16 md:flex-row">
          <div>
            <h2 className="font-display text-2xl text-white md:text-3xl">
              Pronto para começar?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Acesse o sistema e gerencie seus investimentos de forma eficiente.
            </p>
          </div>
          <Link
            className="btn-primary rounded-full px-8 py-4 text-xs uppercase tracking-[0.35em]"
            href="/login"
          >
            Acessar agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <div className="text-xs text-white/40">
            © 2026 Anova Investimentos. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-xs text-white/40">
            <span className="cursor-pointer transition-colors hover:text-white">Termos</span>
            <span className="cursor-pointer transition-colors hover:text-white">Privacidade</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
