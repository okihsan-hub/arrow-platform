import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/ContactForm";
import { WhatsAppPlaceholder } from "@/components/contact/WhatsAppPlaceholder";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "İletişim",
  description:
    "Arrow Bilişim ile iletişim: proje talebi, teklif ve destek için form ve iletişim bilgileri. Kurumsal teknoloji ortağınıza yazın.",
  path: "/contact",
  keywords: ["iletişim", "teklif", "Arrow Bilişim iletişim", "kurumsal yazılım destek"]
});

type ContactPageProps = {
  searchParams?: Promise<{ konu?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const q = (await searchParams) ?? {};
  const defaultSubject = q.konu === "demo-talebi" ? "Demo talebi — restoran otomasyonu" : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-corporate-accent">İletişim</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Bize ulaşın</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Proje talebi, teknik soru veya ortaklık için formu doldurun; ekibimiz en kısa sürede dönüş yapar. Acil kanallar için
          aşağıdaki yer tutucu bilgileri kullanabilirsiniz (kurumsal bilgiler yayına alındığında güncellenecektir).
        </p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <section className="lg:col-span-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">İletişim bilgileri</h2>
          <ul className="mt-6 space-y-6 text-sm">
            <li>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Telefon</p>
              <p className="mt-1 font-mono text-slate-200">+90 (212) 000 00 00</p>
              <p className="mt-1 text-xs text-slate-600">Yer tutucu — güncellenecek</p>
            </li>
            <li>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">E-posta</p>
              <a href="mailto:info@arrowbilisim.com" className="mt-1 inline-block text-corporate-accent hover:underline">
                info@arrowbilisim.com
              </a>
              <p className="mt-1 text-xs text-slate-600">Örnek adres — güncellenecek</p>
            </li>
            <li>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Adres</p>
              <p className="mt-1 max-w-sm leading-relaxed text-slate-300">
                Maslak Mahallesi, Büyükdere Caddesi No: 0, Sarıyer / İstanbul
              </p>
              <p className="mt-1 text-xs text-slate-600">Yer tutucu — güncellenecek</p>
            </li>
            <li>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Web</p>
              <a
                href="https://www.arrowbilisim.com"
                className="mt-1 inline-block text-corporate-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.arrowbilisim.com
              </a>
            </li>
          </ul>

          <div className="mt-8">
            <WhatsAppPlaceholder />
          </div>

          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Harita</h2>
            <div className="mt-4 flex aspect-[21/10] items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center">
              <p className="max-w-[14rem] text-sm leading-relaxed text-slate-500">
                Konum haritası yer tutucu — harita bileşeni entegrasyonu sonrası eklenecek.
              </p>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="rounded-xl border border-slate-800 bg-slate-900/35 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-white">Mesaj formu</h2>
            <p className="mt-2 text-sm text-slate-500">
              Zorunlu alanları doldurun. Bu sürümde gönderim yalnızca arayüz demosudur; backend bağlantısı eklendiğinde aynı
              form kullanılabilir.
            </p>
            <div className="mt-8">
              <ContactForm defaultSubject={defaultSubject} />
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            <Link href="/login" className="text-corporate-accent hover:underline">
              Müşteri / yönetici girişi
            </Link>
            ·{" "}
            <Link href="/services" className="text-corporate-accent hover:underline">
              Hizmetler
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
