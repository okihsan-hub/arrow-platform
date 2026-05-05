import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white">Arrow Bilişim</p>
          <p className="mt-1 text-xs text-slate-500">
            Kurumsal teknoloji ve yazılım çözümleri ·{" "}
            <Link href="https://www.arrowbilisim.com" className="text-slate-400 hover:text-white">
              www.arrowbilisim.com
            </Link>
          </p>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Arrow Bilişim. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
