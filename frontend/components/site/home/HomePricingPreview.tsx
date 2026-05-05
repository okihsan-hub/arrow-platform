import Link from "next/link";

/** Set to false to hide this block without removing the route wiring. */
const SHOW_HOME_PRICING_PREVIEW = true;

const SHARED_POINTS = ["Aylık lisanslı sistem", "Cihaz bazlı fiyatlandırma"] as const;

const tiers = [
  { key: "starter", name: "Starter", emphasized: false },
  { key: "pro", name: "Pro", emphasized: true },
  { key: "enterprise", name: "Enterprise", emphasized: false }
] as const;

export function HomePricingPreview() {
  if (!SHOW_HOME_PRICING_PREVIEW) return null;

  return (
    <section className="border-t border-slate-800 bg-slate-950/40">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <header className="max-w-2xl">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-corporate-accent">Planlar</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Fiyat ön izleme</p>
          <p className="mt-4 text-base text-slate-400 md:text-lg">
            Paket iskeleti; tutarlar ve kapsam demo sonrası netleşir.
          </p>
        </header>

        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <li key={tier.key} className="flex lg:justify-center">
              <article
                className={`flex h-full w-full max-w-md flex-col rounded-xl border bg-slate-900/55 p-6 shadow-lg shadow-black/20 md:p-7 ${
                  tier.emphasized
                    ? "border-corporate-accent/50 ring-2 ring-corporate-accent/25 lg:scale-[1.02] lg:z-[1]"
                    : "border-slate-700/90 hover:border-blue-500/35"
                }`}
              >
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <ul className="mt-6 flex flex-col gap-3">
                  {SHARED_POINTS.map((line) => (
                    <li key={line} className="flex gap-2 text-sm leading-snug text-slate-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-corporate-accent" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-slate-500">
          <Link href="/contact?konu=demo-talebi" className="font-medium text-corporate-accent hover:underline">
            Demo talep edin
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
