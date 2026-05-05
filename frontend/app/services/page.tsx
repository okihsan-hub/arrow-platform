import type { Metadata } from "next";
import Link from "next/link";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Hizmetler",
  description:
    "Kurumsal web sitesi, restoran otomasyonu, QR menü, lisans yönetimi, bayi ve müşteri panelleri, CRM ve entegrasyon altyapıları.",
  path: "/services",
  keywords: ["kurumsal web", "QR menü", "restoran yazılımı", "lisans", "SAP entegrasyon", "CRM"]
});

const services = [
  {
    title: "Kurumsal web sitesi",
    body: "Markanızı doğru kurumsal dille anlatan, hızlı ve bakımı kolay web siteleri. SEO dostu yapı, mobil uyumluluk ve içerik yönetimi ihtiyaçlarınıza göre şekillenir."
  },
  {
    title: "Restoran otomasyon sistemleri",
    body: "Siparişten mutfağa, ödemeden günlük kapanışa kadar şube süreçlerini tek çatı altında toplayan sistemler; yoğun saate dayanıklı ve merkezi raporlamaya uyumlu."
  },
  {
    title: "QR menü çözümleri",
    body: "Masa bazlı güvenilir menüsunumları, güncellenen içerikler ve gerektiğinde çok dilli sunum. Mevcut POS veya web altyapınızla uyumlu entegrasyon seçenekleri."
  },
  {
    title: "Lisans yönetimi",
    body: "Ürün ve cihaz lisanslarının merkezi doğrulanması, kullanım sınırları ve denetim kayıtları. Özellikle çok noktalı ve abonelik modeli işletmeler için uygundur."
  },
  {
    title: "Bayi ve müşteri panelleri",
    body: "Bayi ağınız veya kurumsal müşterileriniz için rol tabanlı paneller: sipariş, stok görünürlüğü, talep yönetimi ve self-servis raporlar."
  },
  {
    title: "CRM / muhasebe / IK altyapıları",
    body: "Mevcut yazılımlarınızla konuşan API köprüleri, veri senkronu ve özelleştirilmiş iş akışları. Tekil paket satışından ziyade süreçlerinize oturan entegrasyonlar."
  }
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-corporate-accent">Hizmetler</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">Size özel teknoloji katmanları</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Arrow Bilişim olarak kurumsal müşterilere yazılım, otomasyon ve entegrasyon hizmeti sunuyoruz. İhtiyaçlarınızı birlikte
          önceliklendirip fazlı ve sürdürülebilir bir yol haritası çıkarıyoruz.
        </p>
      </header>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <li key={s.title}>
            <article className="flex h-full flex-col rounded-xl border border-slate-800/90 bg-slate-900/35 p-6 transition hover:border-slate-700 hover:bg-slate-900/50">
              <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-2 text-lg font-semibold text-white">{s.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{s.body}</p>
              <Link
                href="/contact"
                className="mt-6 inline-flex text-xs font-semibold uppercase tracking-wide text-corporate-accent hover:underline"
              >
                Teklif için iletişim →
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-6">
        <p className="text-sm text-slate-400">
          Web:&nbsp;
          <a href="https://www.arrowbilisim.com" className="font-medium text-corporate-accent hover:underline">
            www.arrowbilisim.com
          </a>
        </p>
        <Link
          href="/references"
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
        >
          Referanslara göz atın
        </Link>
      </div>
    </div>
  );
}
