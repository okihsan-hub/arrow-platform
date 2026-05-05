import Link from "next/link";

const nav = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/services", label: "Hizmetler" },
  { href: "/references", label: "Referanslar" },
  { href: "/contact", label: "İletişim" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex flex-col gap-0.5">
          <span className="text-lg font-semibold tracking-tight text-white">Arrow Bilişim</span>
          <span className="text-xs text-slate-500">www.arrowbilisim.com</span>
        </Link>
        <div className="flex flex-wrap items-center gap-6">
          <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="rounded-md border border-corporate-border bg-corporate-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-corporate-accent-hover"
          >
            Giriş
          </Link>
        </div>
      </div>
    </header>
  );
}
