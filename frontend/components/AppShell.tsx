"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark } from "@/components/site/BrandMark";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const MARKETING_PATHS = new Set(["/", "/services", "/references", "/contact"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  const marketing = MARKETING_PATHS.has(pathname);

  if (marketing) {
    return (
      <div className="flex min-h-screen flex-col bg-corporate-950 text-slate-100">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-corporate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <span className="text-sm font-semibold tracking-tight text-white">Arrow Bilişim</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/" className="rounded-md px-2 py-1 transition hover:bg-slate-800 hover:text-white">
              Ana sayfa
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-corporate-border bg-corporate-accent px-3 py-1.5 text-sm font-medium text-white transition hover:bg-corporate-accent-hover"
            >
              Giriş
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
