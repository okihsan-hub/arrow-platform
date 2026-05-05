/** Public marketing navigation — sync with footer where appropriate. */

export type SiteNavItem = {
  href: string;
  label: string;
  /** `/` uses exact match; other paths allow prefix match. */
  exact?: boolean;
};

export const marketingNav: SiteNavItem[] = [
  { href: "/", label: "Ana Sayfa", exact: true },
  { href: "/services", label: "Hizmetler" },
  { href: "/references", label: "Referanslar" },
  { href: "/contact", label: "İletişim" }
];

export function isNavActive(pathname: string, item: SiteNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
