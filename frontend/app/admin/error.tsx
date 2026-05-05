"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminErrorFallback({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-lg border border-slate-800 bg-slate-900/60 px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-500/90">Yönetim paneli</p>
        <h1 className="mt-2 text-lg font-semibold text-white">Sayfa hata verdi</h1>
        <p className="mt-2 text-sm text-slate-400">İşlemi tekrar deneyin veya panele dönün.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-corporate-accent px-4 py-2 text-sm font-medium text-white hover:bg-corporate-accent-hover"
          >
            Tekrar dene
          </button>
          <Link href="/admin" className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
