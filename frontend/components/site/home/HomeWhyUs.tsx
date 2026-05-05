import { homeWhyUs } from "@/components/site/home/home-sales-data";

export function HomeWhyUs() {
  return (
    <section className="border-y border-slate-800 bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-corporate-accent">Güven</h2>
        <p className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Neden Arrow Bilişim?</p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeWhyUs.map((line) => (
            <li
              key={line}
              className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-4 text-base font-medium text-slate-100"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-corporate-accent text-sm font-bold text-white">
                ✓
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
