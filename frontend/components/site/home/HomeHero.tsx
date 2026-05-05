import Link from "next/link";
import { Fragment } from "react";

function TrustBadgeSeparator({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-slate-500/55 ${className}`}
      aria-hidden
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-80">
        <path
          d="M7 2.5 10.5 7 7 11.5 3.5 7 7 2.5z"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const trustBadges = ["Aktif kullanımda", "Yerinde kurulum", "Teknik destek dahil"] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div className="pointer-events-none absolute inset-0 bg-corporate-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(37,99,235,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(37,99,235,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-corporate-950 opacity-95" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 lg:py-36">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-400">Arrow Bilişim</p>
          <p
            className="inline-flex w-fit items-center rounded-full border border-emerald-500/40 bg-emerald-950/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-300 shadow-sm shadow-emerald-900/40"
            role="status"
          >
            Kurulum + destek dahil
          </p>
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl xl:text-[3.5rem] xl:leading-[1.07]">
          Restoran Otomasyonu ve Yazılım Çözümleri
        </h1>

        <p className="mt-4 text-sm font-medium text-slate-300 md:text-base">
          Türkiye genelinde aktif kullanım
        </p>

        <p className="mt-8 max-w-3xl text-lg font-medium leading-relaxed text-slate-100 md:text-xl lg:text-2xl lg:leading-snug">
          Restoranınız için hızlı, güvenilir ve lisanslı otomasyon sistemleri.
          <span className="mt-3 block font-normal text-slate-300 md:text-xl md:leading-relaxed lg:text-xl">
            QR menü, sipariş yönetimi ve cihaz lisans sistemi tek platformda.
          </span>
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
          <Link
            href="/contact?konu=demo-talebi"
            className="group relative inline-flex min-h-[3.375rem] items-center justify-center overflow-hidden rounded-2xl bg-corporate-accent px-11 py-[1.15rem] text-lg font-bold leading-none text-white shadow-[0_0_0_1px_rgba(96,165,250,0.4),0_0_48px_rgba(37,99,235,0.55),0_12px_40px_rgba(0,0,0,0.45)] ring-2 ring-blue-300/50 transition hover:bg-corporate-accent-hover hover:shadow-[0_0_0_1px_rgba(147,197,253,0.5),0_0_64px_rgba(59,130,246,0.65),0_16px_48px_rgba(0,0,0,0.5)] hover:ring-blue-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 md:min-h-[3.5rem] md:px-12 md:py-6 md:text-xl"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/0 via-white/15 to-white/0 opacity-60 transition group-hover:opacity-80" />
            <span className="relative">Demo Talep Et</span>
          </Link>
          <Link
            href="/references"
            className="inline-flex items-center justify-center rounded-xl border-2 border-blue-400/80 bg-blue-950/40 px-7 py-[0.9rem] text-sm font-semibold text-white backdrop-blur transition hover:border-blue-300 hover:bg-blue-900/50 md:px-8 md:py-4 md:text-base"
          >
            Referansları Gör
          </Link>
        </div>

        <div className="mt-5 flex max-w-2xl flex-wrap items-center gap-x-1.5 gap-y-2 sm:gap-x-2" aria-label="Güven sinyalleri">
          {trustBadges.map((label, i) => (
            <Fragment key={label}>
              {i > 0 ? <TrustBadgeSeparator className="mx-0.5 sm:mx-1" /> : null}
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200 shadow-sm shadow-black/20 sm:text-[11px]">
                {label}
              </span>
            </Fragment>
          ))}
        </div>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 md:mt-6 md:text-[0.95rem]">
          Demo talebi sonrası 24 saat içinde kurulum yapılabilir.
        </p>

        <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-white/10 pt-10">
          <p className="text-lg font-semibold tracking-wide text-white md:text-xl">
            <span className="bg-gradient-to-r from-blue-400 to-white bg-clip-text text-transparent">18+</span>
            <span className="ml-2 text-slate-200">yıl sektör deneyimi</span>
          </p>
          <span className="hidden h-6 w-px bg-white/15 sm:block" aria-hidden />
          <p className="text-sm text-slate-400">Kurulumdan desteğe uçtan uca restoran otomasyonu</p>
        </div>
      </div>
    </section>
  );
}
