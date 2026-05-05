import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/site/BrandMark";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ana Sayfa",
  description:
    "Arrow Bilişim — yazılım, otomasyon ve teknoloji çözümleri. Kurumsal web, restoran otomasyonu, lisans yönetimi ve teknik destek.",
  path: "/",
  keywords: ["Arrow Bilişim", "kurumsal yazılım", "restoran otomasyonu", "lisans yönetimi", "İstanbul"]
});
const modules = [
  {
    title: "Web yazılım",
    body: "Kurumsal siteler, yönetim panelleri ve müşteri odaklı web uygulamaları; performans ve güvenlik öncelikli."
  },
  {
    title: "Restoran otomasyonu",
    body: "Sipariş–mutfak hattında izlenebilirlik, şube uyumu ve günlük operasyon için uçtan uca dijitalleşme."
  },
  {
    title: "Lisans yönetimi",
    body: "Ürün ve cihaz bazlı yetkilendirme, merkezi doğrulama ve raporlama ile sürdürülebilir ticarileştirme."
  },
  {
    title: "Teknik destek",
    body: "Canlı sistemler için önceliklendirilmiş destek, versiyon geçişleri ve kritik süreçlerde yanınızda olma."
  }
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-slate-800/90">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.18),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/80 to-corporate-950" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28 lg:py-32">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-14">
            <BrandMark className="lg:mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-corporate-accent">Kurumsal teknoloji</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-[3.35rem] lg:leading-[1.08]">
                Arrow Bilişim
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-corporate-accent md:text-xl">
                Yazılım, otomasyon ve teknoloji çözümleri
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400">
                İşletmenizin dijital süreçlerini güvenilir mimari, net iletişim ve sürdürülebilir destek ile hayata geçiriyoruz.
                www.arrowbilisim.com ile projelerinize değer katan uzun vadeli bir teknoloji ortağı olmayı hedefliyoruz.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/services"
                  className="rounded-lg bg-corporate-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-corporate-accent/20 transition hover:bg-corporate-accent-hover"
                >
                  Hizmetlerimiz
                </Link>
                <Link
                  href="/references"
                  className="rounded-lg border border-slate-500/80 bg-slate-900/50 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-slate-400 hover:bg-slate-800/60"
                >
                  Referanslarımız
                </Link>
                <Link href="/contact" className="text-sm font-medium text-slate-400 underline-offset-4 hover:text-white hover:underline">
                  İletişim
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h2 className="text-sm font-medium uppercase tracking-wider text-corporate-accent">Odak alanlarımız</h2>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">Öne çıkan modüller</p>
          <p className="mt-3 text-slate-400">
            İhtiyaç duyduğunuz katmanları birlikte netleştirip, tek sözleşme altında uçtan uca veya modüler ilerleyebiliriz.
          </p>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <li
              key={m.title}
              className="flex flex-col rounded-xl border border-slate-800/90 bg-slate-900/30 p-6 transition hover:border-slate-700 hover:bg-slate-900/45"
            >
              <h3 className="text-base font-semibold text-white">{m.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{m.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/25">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-medium text-white">Projenizi birlikte netleştirelim.</p>
            <p className="mt-1 text-sm text-slate-400">Kapsam, süre ve bütçe için ön görüşme talebinde bulunabilirsiniz.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-corporate-950 transition hover:bg-slate-200"
          >
            Bize yazın
          </Link>
        </div>
      </section>
    </div>
  );
}
