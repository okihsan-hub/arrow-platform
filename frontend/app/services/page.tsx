export const metadata = { title: "Hizmetler" };

export default function ServicesPage() {
  const services = [
    {
      title: "Özel yazılım geliştirme",
      body: "İş süreçlerinize uygun web ve kurumsal uygulamalar; güvenlik ve performans odaklı teslim."
    },
    {
      title: "Lisans ve ürün yönetimi",
      body: "Arrow Restaurant ve benzeri ürünlerde merkezi lisans kontrolü, cihaz bağlama ve operasyonel raporlama."
    },
    {
      title: "Sistem entegrasyonu",
      body: "API’ler, veri aktarımı ve mevcut altyapılarınızla uyumlu entegrasyon projeleri."
    },
    {
      title: "Danışmanlık ve bakım",
      body: "Mimari gözden geçirme, güvenlik sertleştirme ve sürekli operasyon desteği."
    }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-white">Hizmetler</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Arrow Bilişim olarak kurumsal müşterilerimize uçtan uca teknoloji hizmeti sunuyoruz. Taleplerinizi birlikte
        netleştirip ölçülebilir sonuçlara çeviriyoruz.
      </p>

      <ul className="mt-12 grid gap-6 md:grid-cols-2">
        {services.map((s) => (
          <li key={s.title} className="rounded-lg border border-slate-800 bg-slate-900/30 p-6">
            <h2 className="text-lg font-medium text-white">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.body}</p>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-sm text-slate-500">
        Web:{" "}
        <a href="https://www.arrowbilisim.com" className="text-corporate-accent hover:underline">
          www.arrowbilisim.com
        </a>
      </p>
    </div>
  );
}
