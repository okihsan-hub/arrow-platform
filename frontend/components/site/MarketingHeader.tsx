"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { BrandLogo } from "@/components/site/BrandLogo";
import { marketingNavLinkClass } from "@/components/site/marketing-nav-classes";
import { isNavActive, marketingNav } from "@/data/site-nav";

export function MarketingHeader() {
  const pathname = usePathname();
  const sheetId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 md:py-3">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center"
          onClick={() => setOpen(false)}
          aria-label="Arrow Bilişim — ana sayfa"
        >
          <BrandLogo preset="header" priority />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex flex-wrap items-center gap-1" aria-label="Ana navigasyon">
            {marketingNav.map((item) => {
              const active = isNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={marketingNavLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/login"
            className="ml-2 rounded-md border border-corporate-border bg-corporate-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-corporate-accent-hover"
          >
            Giriş
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/login"
            className="rounded-md border border-corporate-border bg-corporate-accent px-3 py-2 text-xs font-semibold text-white"
          >
            Giriş
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={sheetId}
            onClick={() => setOpen(true)}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Menü
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] md:hidden" role="presentation">
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            id={sheetId}
            role="dialog"
            aria-modal="true"
            aria-label="Site menüsü"
            className="absolute inset-y-0 right-0 flex w-[min(88vw,20rem)] flex-col border-l border-slate-800 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <span className="text-sm font-semibold text-white">Menü</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Kapat
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Mobil navigasyon">
              {marketingNav.map((item) => {
                const active = isNavActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`${marketingNavLinkClass(active)} text-left`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-800 p-4">
              <p className="text-xs text-slate-500">
                Müşteri veya admin hesabınız için web üzerinden giriş yapın.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}