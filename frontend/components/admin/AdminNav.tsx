"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/licenses", label: "Licenses" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/references", label: "References" },
  { href: "/admin/settings", label: "Settings" }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-800 bg-slate-900 md:w-56 md:flex-shrink-0 md:border-b-0 md:border-r md:border-slate-800">
      <div className="flex flex-col gap-1 p-4">
        <Link href="/" className="mb-4 text-sm font-semibold text-white">
          Arrow Bilişim
          <span className="mt-0.5 block text-xs font-normal text-slate-500">Admin</span>
        </Link>
        <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
          {items.map((item) => {
            const active =
              item.exact === true ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-corporate-accent text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action="/api/auth/logout" method="post" className="mt-4 md:mt-6">
          <button
            type="submit"
            className="w-full rounded-md border border-slate-700 px-3 py-2 text-left text-sm text-slate-300 hover:border-slate-600 hover:bg-slate-800"
          >
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
