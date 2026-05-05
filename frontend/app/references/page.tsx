import type { Metadata } from "next";
import Link from "next/link";

import { ReferencesWithFilters } from "@/components/site/ReferencesWithFilters";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Referanslar",
  description:
    "Arrow Bilişim referans projeleri: restoran zincirleri, otomasyon, perakende ve kurumsal portal çözümleri.",
  path: "/references",
  keywords: ["referans projeler", "otomasyon", "restoran yazılımı", "kurumsal portal", "lojistik entegrasyon"]
});
export default function ReferencesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-corporate-accent">Projeler</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Referanslar</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-400">
          Aşağıda, farklı sektörlerde teslim ettiğimiz çözümlerden örnekler yer alıyor. Kategoriye göre süzebilir; detay veya benzer
          bir proje için{" "}
          <Link href="/contact" className="text-corporate-accent underline-offset-2 hover:underline">
            iletişim
          </Link>{" "}
          sayfamızdan yazabilirsiniz.
        </p>
      </header>

      <ReferencesWithFilters />
    </div>
  );
}
