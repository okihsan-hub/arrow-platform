"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { footerNavLinkClass } from "@/components/site/marketing-nav-classes";
import type { SiteNavItem } from "@/data/site-nav";
import { isNavActive } from "@/data/site-nav";

const footerLinks: SiteNavItem[] = [
  { href: "/", label: "Ana Sayfa", exact: true },
  { href: "/services", label: "Hizmetler" },
  { href: "/references", label: "Referanslar" },
  { href: "/contact", label: "İletişim" },
  { href: "/login", label: "Giriş" }
];

export function FooterNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label="Alt bilgi bağlantıları">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Bağlantılar</p>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
        {footerLinks.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <li key={item.href}>
              <Link href={item.href} className={`text-sm ${footerNavLinkClass(active)}`} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
