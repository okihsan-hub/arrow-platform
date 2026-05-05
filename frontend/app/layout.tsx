import "./globals.css";

import type { Metadata } from "next";

import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Arrow Bilişim",
    template: "%s | Arrow Bilişim"
  },
  description: "Arrow Bilişim — kurumsal teknoloji ve yazılım çözümleri · www.arrowbilisim.com"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-corporate-950 text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
