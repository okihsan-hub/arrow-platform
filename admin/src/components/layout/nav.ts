export type NavItem = { href: string; label: string };

export const adminNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Müşteriler" },
  { href: "/licenses", label: "Lisanslar" },
  { href: "/license-renew-requests", label: "Yenileme Talepleri" },
  { href: "/license-requests", label: "Lisans Talepleri" },
  { href: "/devices", label: "Cihazlar" },
  { href: "/updates", label: "Update Management" },
];
