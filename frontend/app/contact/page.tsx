import Link from "next/link";

export const metadata = { title: "İletişim" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-white">İletişim</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Projeleriniz ve iş birliği talepleriniz için Arrow Bilişim ekibiyle iletişime geçebilirsiniz.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-8">
          <h2 className="text-lg font-medium text-white">Web</h2>
          <p className="mt-3 text-slate-400">
            <a href="https://www.arrowbilisim.com" className="text-corporate-accent hover:underline">
              www.arrowbilisim.com
            </a>
          </p>
          <p className="mt-4 text-sm text-slate-500">
            E-posta adresinizi ve mesajınızı bu sayfa üzerinden (ileride form eklenecek) veya doğrudan kurumsal
            kanallarınızla iletebilirsiniz.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-8">
          <h2 className="text-lg font-medium text-white">Hızlı bağlantılar</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/services" className="text-corporate-accent hover:underline">
                Hizmetler
              </Link>
            </li>
            <li>
              <Link href="/references" className="text-corporate-accent hover:underline">
                Referanslar
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-corporate-accent hover:underline">
                Müşteri / yönetici girişi
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
