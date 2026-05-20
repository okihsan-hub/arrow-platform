"use client";

import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { useMobileNav } from "@/components/layout/MobileNavContext";

export function AdminMobileHeader() {
  const router = useRouter();
  const { openMenu } = useMobileNav();

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <header className="admin-mobile-header-bar sticky top-0 z-40 flex min-h-14 w-full shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-900/95 px-4 py-2 backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={openMenu}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-100"
        aria-label="Menüyü aç"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Arrow Bilişim</p>
        <p className="truncate text-sm font-bold text-slate-100">Lisans Paneli</p>
      </div>
      <button
        type="button"
        onClick={logout}
        className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm font-semibold text-slate-300"
        aria-label="Çıkış"
      >
        Çıkış
      </button>
    </header>
  );
}
