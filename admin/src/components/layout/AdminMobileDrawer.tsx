"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { adminNav } from "@/components/layout/nav";
import { useMobileNav } from "@/components/layout/MobileNavContext";

export function AdminMobileDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, closeMenu } = useMobileNav();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function logout() {
    closeMenu();
    clearToken();
    router.replace("/login");
  }

  if (!open) return null;

  return (
    <div className="admin-mobile-drawer-root fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Kapat" onClick={closeMenu} />
      <aside className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col border-r border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400">Arrow Bilişim</p>
            <p className="text-base font-bold">Lisans Paneli</p>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 text-slate-300"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {adminNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-4 py-3 text-base font-medium",
                  active ? "bg-emerald-600/20 text-emerald-200" : "text-slate-300 hover:bg-slate-800",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 w-full items-center justify-center rounded-lg border border-red-900/50 bg-red-950/50 px-4 text-base font-semibold text-red-300"
          >
            Çıkış
          </button>
        </div>
      </aside>
    </div>
  );
}
