import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div className="pointer-events-none absolute inset-0 bg-corporate-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(37,99,235,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(37,99,235,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-corporate-950 opacity-95" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 lg:py-36">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-400">Arrow Bilişim</p>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-6xl xl:text-[3.5rem] xl:leading-[1.07]">
          Restoran Otomasyonu ve Yazılım Çözümleri
        </h1>

        <p className="mt-8 max-w-3xl text-lg font-medium leading-relaxed text-slate-100 md:text-xl lg:text-2xl lg:leading-snug">
          Restoranınız için hızlı, güvenilir ve lisanslı otomasyon sistemleri.
          <span className="mt-3 block font-normal text-slate-300 md:text-xl md:leading-relaxed lg:text-xl">
            QR menü, sipariş yönetimi ve cihaz lisans sistemi tek platformda.
          </span>
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/contact?konu=demo-talebi"
            className="inline-flex items-center justify-center rounded-xl bg-corporate-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/35 ring-2 ring-blue-400/30 transition hover:bg-corporate-accent-hover hover:ring-blue-300/40"
          >
            Demo Talep Et
          </Link>
          <Link
            href="/references"
            className="inline-flex items-center justify-center rounded-xl border-2 border-blue-400/80 bg-blue-950/40 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:border-blue-300 hover:bg-blue-900/50"
          >
            Referansları Gör
          </Link>
        </div>

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
