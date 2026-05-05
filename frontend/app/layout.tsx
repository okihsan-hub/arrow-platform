import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppShell } from "@/components/AppShell";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Arrow Bilişim",
    template: "%s | Arrow Bilişim"
  },
  description:
    "Arrow Bilişim — yazılım, otomasyon ve teknoloji çözümleri. Kurumsal web, restoran otomasyonu, lisans yönetimi.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Arrow Bilişim",
    url: absoluteUrl("/")
  },
  twitter: {
    card: "summary_large_image",
    title: "Arrow Bilişim",
    description:
      "Yazılım, otomasyon ve teknoloji çözümleri. Kurumsal web, restoran otomasyonu ve lisans yönetimi."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen bg-corporate-950 text-slate-100 antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
