import { homeFeatures } from "@/components/site/home/home-sales-data";

export function HomeFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <header className="max-w-2xl">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-corporate-accent">Çözüm</h2>
        <p className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">Başlıca Özellikler</p>
        <p className="mt-4 text-base text-slate-400 md:text-lg">
          Operasyonu sadeleştiren modüller; ihtiyaçınıza göre paketlenebilir ve birlikte genişler.
        </p>
      </header>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {homeFeatures.map((item) => (
          <li
            key={item.title}
            className="flex flex-col rounded-xl border border-slate-700/90 bg-slate-900/50 p-6 shadow-lg shadow-black/20 transition hover:border-blue-500/40 hover:bg-slate-900/70"
          >
            <span className="h-1 w-12 rounded-full bg-corporate-accent" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
