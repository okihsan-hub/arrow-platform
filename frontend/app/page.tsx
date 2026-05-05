import type { Metadata } from "next";

import { HomeFeatures } from "@/components/site/home/HomeFeatures";
import { HomeFinalCta } from "@/components/site/home/HomeFinalCta";
import { HomeHero } from "@/components/site/home/HomeHero";
import { HomePricingPreview } from "@/components/site/home/HomePricingPreview";
import { HomeReferencesPreview } from "@/components/site/home/HomeReferencesPreview";
import { HomeWhyUs } from "@/components/site/home/HomeWhyUs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ana Sayfa",
  description:
    "Restoran otomasyonu ve yazılım çözümleri: QR menü, sipariş yönetimi, adisyon ve cihaz lisansı tek platformda. 18+ yıl deneyim. Demo talep edin.",
  path: "/",
  keywords: [
    "restoran otomasyonu",
    "QR menü",
    "adisyon yazılımı",
    "restoran yazılımı",
    "cihaz lisansı",
    "Arrow Bilişim"
  ]
});

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <HomeFeatures />
      <HomeWhyUs />
      <HomeReferencesPreview />
      <HomePricingPreview />
      <HomeFinalCta />
    </div>
  );
}
