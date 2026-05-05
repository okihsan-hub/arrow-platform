export const metadata = { title: "References (admin)" };

export default function AdminReferencesPlaceholderPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">References</h1>
      <p className="mt-2 text-sm text-slate-400">
        Bu sayfa ileride referans kartları için yönetim (CRUD) arayüzü olacaktır. Şimdilik kamuya açık referans örnekleri{" "}
        <a href="/references" className="text-corporate-accent hover:underline">
          /references
        </a>{" "}
        sayfasında.
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-10 text-center text-sm text-slate-500">
        CRUD yakında — backend sözleşmesi henüz eklenmedi.
      </div>
    </div>
  );
}
