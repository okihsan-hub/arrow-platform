import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900/50 to-corporate-950">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="text-sm font-medium uppercase tracking-wider text-corporate-accent">Kurumsal teknoloji</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">Arrow Bilişim</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            İşletmeniz için güvenilir yazılım, lisans ve entegrasyon çözümleri. www.arrowbilisim.com üzerinden projelerinize
            değer katan sürdürülebilir teknoloji ortağıyız.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-md bg-corporate-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-corporate-accent-hover"
            >
              İletişime geçin
            </Link>
            <Link
              href="/services"
              className="rounded-md border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Hizmetlerimiz
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-xl font-semibold text-white">Neden Arrow Bilişim?</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { t: "Güvenilir mimari", d: "Ölçeklenebilir, bakımı kolay sistem tasarımı." },
            { t: "Kurumsal odak", d: "Operasyonunuza uygun çözüm ve destek süreçleri." },
            { t: "Şeffaf iletişim", d: "www.arrowbilisim.com ile net kanallar ve hızlı geri bildirim." }
          ].map((x) => (
            <li key={x.t} className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
              <h3 className="font-medium text-white">{x.t}</h3>
              <p className="mt-2 text-sm text-slate-400">{x.d}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
