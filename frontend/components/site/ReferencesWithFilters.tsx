"use client";

import { useMemo, useState } from "react";

import type { ReferenceFilterId } from "@/data/references-content";
import { referenceFilters, referenceItems } from "@/data/references-content";

const ACTIVE_PROJECT_BADGE = "Aktif kullanımda";

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-700/80 bg-gradient-to-br from-slate-800/90 via-slate-900 to-corporate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(37,99,235,0.12),transparent_50%)]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
        <span className="rounded-md border border-slate-600/60 bg-slate-950/40 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Görsel alanı
        </span>
        <span className="text-xs font-medium text-slate-400">{label}</span>
      </div>
      <span className="absolute right-3 top-3 rounded-full border border-emerald-500/50 bg-emerald-950/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300 shadow-lg">
        {ACTIVE_PROJECT_BADGE}
      </span>
    </div>
  );
}

export function ReferencesWithFilters() {
  const [active, setActive] = useState<ReferenceFilterId>("all");

  const filtered = useMemo(() => {
    if (active === "all") return referenceItems;
    return referenceItems.filter((r) => r.filter === active);
  }, [active]);

  return (
    <div>
      <div
        className="mt-10 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Referans kategorileri"
      >
        {referenceFilters.map((f) => {
          const selected = active === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(f.id)}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "border-corporate-accent bg-corporate-accent text-white"
                  : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-slate-500" aria-live="polite">
        {filtered.length} proje gösteriliyor
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-lg border border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-sm text-slate-500">
          Bu kategoride örnek bulunmuyor. &quot;Tümü&quot; filtresiyle tüm projeleri görebilirsiniz.
        </p>
      ) : (
        <ul className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((ref) => (
            <li key={ref.name}>
              <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-800/90 bg-slate-900/35 shadow-lg shadow-black/20 transition duration-200 hover:border-slate-700 hover:bg-slate-900/50 hover:shadow-xl hover:shadow-black/25">
                <div className="p-4 pb-0">
                  <ImagePlaceholder label={ref.imageLabel} />
                </div>
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <h2 className="text-lg font-semibold leading-snug text-white">{ref.name}</h2>
                  <p className="mt-2 text-xs font-medium text-slate-500">{ref.location}</p>

                  <div className="mt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Kullanılan modüller:
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Kullanılan modüller">
                      {ref.modules.map((mod) => (
                        <li key={mod}>
                          <span className="inline-flex rounded-md border border-corporate-accent/35 bg-corporate-accent/10 px-2 py-1 text-[11px] font-bold tracking-wide text-blue-100">
                            {mod}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{ref.description}</p>

                  <div className="mt-4 rounded-lg border border-emerald-800/40 bg-emerald-950/25 px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Sonuç:</p>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-emerald-300 drop-shadow-sm">
                      {ref.outcome}
                    </p>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Etiketler">
                    {ref.tags.map((tag) => (
                      <li key={tag}>
                        <span className="inline-block rounded-full border border-slate-700/90 bg-slate-950/50 px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate-300">
                          {tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
