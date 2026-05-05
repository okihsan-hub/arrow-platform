import Link from "next/link";

export function HomeFinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-slate-800">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-950/80 via-corporate-950 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(37,99,235,0.25),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-24">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.75rem] lg:leading-tight">
          İşinizi büyütmeye hazır mısınız?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
          Demo, teklif veya keşif görüşmesi için ekibimizle iletişime geçin; ihtiyaçlarınıza uygun paketi birlikte netleştirelim.
        </p>
        <Link
          href="/contact"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-corporate-accent px-10 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 ring-2 ring-white/10 transition hover:bg-corporate-accent-hover hover:ring-white/20"
        >
          Bizimle iletişime geçin
        </Link>
      </div>
    </section>
  );
}
