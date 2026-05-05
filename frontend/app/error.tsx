"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorFallback({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900/60 px-8 py-10">
        <p className="text-sm font-medium uppercase tracking-wider text-amber-500/90">Bir sorun oluştu</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Sayfa yüklenemedi</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Beklenmeyen bir hata meydana geldi. Tekrar deneyebilir veya ana sayfaya dönebilirsiniz.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-[10px] text-slate-600">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md bg-corporate-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-corporate-accent-hover"
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            className="rounded-md border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
