"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Müşteriler" },
  { href: "/licenses", label: "Lisanslar" },
  { href: "/devices", label: "Cihazlar" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-4 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Arrow Bilişim</p>
          <h1 className="text-lg font-bold">Lisans Paneli</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
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
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
