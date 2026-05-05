import Link from "next/link";

import { homePreviewProjects } from "@/components/site/home/home-sales-data";

export function HomeReferencesPreview() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <header className="max-w-xl">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-corporate-accent">Referanslar</h2>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Sektörden örnekler</p>
          <p className="mt-4 text-base text-slate-400 md:text-lg">
            Farklı iş modellerinde teslim ettiğimiz çözümlerden kısa bir seçki.
          </p>
        </header>
        <Link
          href="/references"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-corporate-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-corporate-accent-hover md:self-auto"
        >
          Tüm referanslar →
        </Link>
      </div>

      <ul className="mt-14 grid gap-6 md:grid-cols-3">
        {homePreviewProjects.map((p) => (
          <li key={p.name}>
            <article className="flex h-full flex-col rounded-xl border border-slate-700/80 bg-slate-900/45 p-6 transition hover:border-blue-500/35">
              <span className="inline-flex w-fit rounded-full border border-blue-500/40 bg-blue-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-300">
                {p.category}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{p.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{p.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
