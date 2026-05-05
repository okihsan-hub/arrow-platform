import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/ContactForm";
import { ContactWhatsAppLink } from "@/components/contact/ContactWhatsAppLink";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "İletişim",
  description:
    "Arrow Bilişim demo talebi ve iletişim: sisteminizi birlikte kuralım. Form, WhatsApp veya e-posta ile ulaşın.",
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
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-[2.375rem] lg:leading-tight">
          Demo talep edin, sisteminizi birlikte kuralım
        </h1>
        <div
          className="mt-6 flex gap-3 rounded-xl border border-corporate-accent/35 bg-corporate-accent/[0.08] px-4 py-3.5 md:px-5"
          role="note"
        >
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-corporate-accent/25 text-corporate-accent"
            aria-hidden
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <p className="text-sm font-semibold leading-snug text-slate-100 md:text-[15px]">
            Demo sonrası 24 saat içinde kurulum yapılabilir
          </p>
        </div>
        <p className="mt-5 text-base leading-relaxed text-slate-400">
          Aşağıdan demo talebinizi iletin veya doğrudan WhatsApp ile yazın; ekibimiz en kısa sürede dönüş yapar.
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
            <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">WhatsApp</h3>
            <div className="mt-3">
              <ContactWhatsAppLink />
            </div>
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

            <div className="mt-10">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-800" aria-hidden />
                <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">veya</span>
                <div className="h-px flex-1 bg-slate-800" aria-hidden />
              </div>
              <p className="mt-6 text-center text-sm text-slate-400">Form yerine anında mesaj göndermek için</p>
              <div className="mt-3">
                <ContactWhatsAppLink emphasis />
              </div>
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
