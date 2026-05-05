import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/login/LoginForm";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Giriş",
  description: "Arrow Bilişim müşteri ve yönetici hesabı ile güvenli giriş.",
  path: "/login",
  keywords: ["giriş", "Arrow Bilişim", "hesap"],
  robots: { index: false, follow: true }
});

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm text-slate-500">Yükleniyor…</div>}>
      <LoginForm />
    </Suspense>
  );
}
