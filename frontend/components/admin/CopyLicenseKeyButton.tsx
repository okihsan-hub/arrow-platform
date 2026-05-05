"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type State = "idle" | "copied" | "error";

export function CopyLicenseKeyButton({ licenseKey }: { licenseKey: string }) {
  const [state, setState] = useState<State>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetLater = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setState("idle"), 2000);
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setState("copied");
      resetLater();
    } catch {
      setState("error");
      resetLater();
    }
  }, [licenseKey, resetLater]);

  return (
    <div className="flex shrink-0 items-center gap-2">
      {state === "copied" ? <span className="text-xs tabular-nums text-emerald-400">Copied!</span> : null}
      {state === "error" ? <span className="text-xs text-red-400">Failed</span> : null}
      <button
        type="button"
        onClick={copy}
        title="Kopyala"
        aria-label="Lisans anahtarını kopyala"
        className="rounded border border-slate-600 p-1.5 text-slate-400 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      </button>
    </div>
  );
}
