export const metadata = { title: "Referanslar" };

const samples = [
  { name: "Örnek A.Ş.", sector: "Perakende", note: "Kurumsal portal ve raporlama altyapısı." },
  { name: "Demo Lojistik", sector: "Lojistik", note: "Operasyon takip paneli ve API entegrasyonları." },
  { name: "Sample Hotel Group", sector: "Turizm / Restoran", note: "Şube bazlı yazılım lisans süreçleri." },
  { name: "Tech Partner Ltd.", sector: "Teknoloji", note: "Güvenli kimlik doğrulama ve yönetim konsolu." },
  { name: "Metro Enerji", sector: "Enerji", note: "Saha verisi toplama ve izleme." },
  { name: "Anadolu Üretim", sector: "İmalat", note: "ERP köprüleme ve bildirim servisleri." }
];

export default function ReferencesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Referanslar</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Arrow Bilişim ile çalışan kurumların bir kısmı (örnek kartlar — gerçek referans içeriği ileride
        güncellenebilir).
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {samples.map((c) => (
          <li
            key={c.name}
            className="flex flex-col rounded-lg border border-slate-800 bg-slate-900/40 p-6 transition hover:border-slate-700"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-corporate-accent">{c.sector}</span>
            <h2 className="mt-2 text-lg font-semibold text-white">{c.name}</h2>
            <p className="mt-3 flex-1 text-sm text-slate-400">{c.note}</p>
            <span className="mt-4 text-xs text-slate-600">www.arrowbilisim.com</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
