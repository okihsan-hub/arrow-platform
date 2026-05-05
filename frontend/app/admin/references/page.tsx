export const metadata = { title: "References (admin)" };

export default function AdminReferencesPlaceholderPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-white">Referanslar</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Bu bölüm ileride referans kartlarının yönetimi için kullanılacak: ekleme, düzenleme, sıralama ve yayın durumu.
        Kamuya açık liste şu an{" "}
        <a href="/references" className="text-corporate-accent hover:underline">
          /references
        </a>{" "}
        adresinde statik içerikle gösteriliyor.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="text-sm font-medium text-white">Planlanan CRUD kapsamı</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-400">
            <li>Proje adı, kısa ve uzun açıklama alanları</li>
            <li>Görsel yükleme veya harici URL (yer tutucu ile önizleme)</li>
            <li>Etiketler (çoklu; örn. restoran, otomasyon)</li>
            <li>Listede görünürlük sırası ve taslak / yayında durumu</li>
            <li>Yönetim API’si ve bu arayüzden güvenli çağrılar</li>
          </ul>
        </section>

        <section className="rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-5">
          <h2 className="text-sm font-medium text-slate-300">Arayüz taslağı</h2>
          <p className="mt-2 text-xs text-slate-500">Butonlar şimdilik devre dışı; backend hazır olunca etkinleştirilecek.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md bg-corporate-accent/40 px-3 py-2 text-xs font-semibold text-white/70"
            >
              Yeni referans
            </button>
            <button type="button" disabled className="cursor-not-allowed rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-500">
              İçe aktar (CSV)
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-md border border-slate-800">
            <div className="grid grid-cols-[1fr_6rem_5rem] gap-2 border-b border-slate-800 bg-slate-900/60 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              <span>Başlık</span>
              <span>Etiketler</span>
              <span className="text-right">Durum</span>
            </div>
            <div className="px-3 py-8 text-center text-sm text-slate-600">Kayıt yok — CRUD sonrası tablo doldurulacak</div>
          </div>
        </section>
      </div>
    </div>
  );
}
