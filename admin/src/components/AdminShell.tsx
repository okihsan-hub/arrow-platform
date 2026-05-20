"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { AdminMobileDrawer } from "@/components/layout/AdminMobileDrawer";
import { AdminMobileHeader } from "@/components/layout/AdminMobileHeader";
import { MobileNavProvider } from "@/components/layout/MobileNavContext";
import { adminNav } from "@/components/layout/nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <MobileNavProvider>
      <div className="admin-layout-root flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden bg-slate-950 text-slate-100 md:flex-row">
        <aside className="admin-sidebar-desktop hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex">
          <div className="border-b border-slate-800 px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Arrow Bilişim</p>
            <h1 className="text-lg font-bold">Lisans Paneli</h1>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-emerald-600/20 text-emerald-200"
                    : "text-slate-300 hover:bg-slate-800",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-800 p-3">
            <Button variant="ghost" className="w-full" onClick={logout}>
              Çıkış
            </Button>
          </div>
        </aside>

        <div className="admin-content-column flex w-full min-w-0 flex-1 flex-col overflow-x-hidden">
          <AdminMobileHeader />
          <main className="admin-main w-full min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
        </div>
      </div>
      <AdminMobileDrawer />
    </MobileNavProvider>
  );
}
