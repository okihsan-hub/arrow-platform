import Link from "next/link";

import { BrandLogo } from "@/components/site/BrandLogo";
import { FooterNav } from "@/components/site/FooterNav";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-12 md:gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start md:col-span-5 md:gap-6">
          <div className="shrink-0 pt-0.5">
            <BrandLogo preset="footer" href="/" />
          </div>
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-slate-400">
              Yazılım, otomasyon ve teknoloji çözümleri. Kurumsal web, restoran otomasyonu, lisans ve entegrasyon.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              <Link href="https://www.arrowbilisim.com" className="text-corporate-accent/90 hover:underline">
                www.arrowbilisim.com
              </Link>
            </p>
          </div>
        </div>

        <div className="md:col-span-4">
          <FooterNav />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-5 md:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">İletişim</p>
          <p className="mt-3 text-sm text-slate-400">Teklif ve destek talepleri için iletişim formumuzu kullanın.</p>
          <Link
            href="/contact"
            className="mt-4 inline-flex rounded-md bg-corporate-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-corporate-accent-hover"
          >
            Bize yazın
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Arrow Bilişim. Tüm hakları saklıdır.</p>
          <p className="text-xs text-slate-600">Kurumsal görünüm; yönetim paneli ile aynı renk ve tipografi ailesi.</p>
        </div>
      </div>
    </footer>
  );
}
