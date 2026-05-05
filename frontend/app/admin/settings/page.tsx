export const metadata = { title: "Settings" };

export default function AdminSettingsPlaceholderPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <p className="mt-2 text-sm text-slate-400">
        Yer tutucu. Ortam değişkenleri ve yapılandırma dokümantasyonu için deposundaki README / RUN dosyasına bakın; API
        sözleşmesi şimdilik değiştirilmedi.
      </p>
      <ul className="mt-8 list-inside list-disc space-y-2 text-sm text-slate-500">
        <li>API_BASE_URL — frontend proxy istekleri</li>
        <li>JWT / lisans anahtarları — backend .env</li>
      </ul>
    </div>
  );
}
