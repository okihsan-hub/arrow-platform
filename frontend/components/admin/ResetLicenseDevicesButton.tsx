"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Toast = { kind: "success" | "error"; message: string };

type Props = { licenseId: number };

export function ResetLicenseDevicesButton({ licenseId }: Props) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissToast = useCallback(() => {
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = null;
    setToast(null);
  }, []);

  const pushToast = useCallback((t: Toast) => {
    setToast(t);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => {
      toastRef.current = null;
      setToast(null);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading]);

  async function confirmReset() {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("license_id", String(licenseId));
      const res = await fetch("/api/admin/licenses/reset-devices", {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" }
      });
      if (!res.ok) {
        const raw = (await res.json().catch(() => ({}))) as { detail?: unknown };
        const detail = raw.detail;
        let message = "İşlem başarısız.";
        if (typeof detail === "string") message = detail;
        else if (Array.isArray(detail)) {
          const parts = detail.map((item) =>
            typeof item === "object" && item !== null && "msg" in item
              ? String((item as { msg: unknown }).msg)
              : String(item)
          );
          message = parts.join(" ") || message;
        }
        pushToast({ kind: "error", message });
        return;
      }
      await res.json().catch(() => null);
      setOpen(false);
      router.refresh();
      pushToast({ kind: "success", message: "Cihazlar sıfırlandı." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-amber-900/80 bg-amber-950/30 px-3 py-2 text-sm text-amber-200 hover:bg-amber-950/50"
      >
        Reset devices
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            aria-label="Kapat"
            disabled={loading}
            className="absolute inset-0 bg-black/60"
            onClick={() => !loading && setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-xl"
          >
            <p id={titleId} className="text-sm text-slate-200">
              Tüm cihazları sıfırlamak istediğinize emin misiniz?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void confirmReset()}
                className="rounded-md border border-amber-800 bg-amber-950/40 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-950/60 disabled:opacity-50"
              >
                {loading ? "…" : "Sıfırla"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex w-[min(100vw-2rem,24rem)] -translate-x-1/2 justify-center px-4">
          <output
            className={`pointer-events-auto rounded-md border px-4 py-2.5 text-sm shadow-lg ${
              toast.kind === "success"
                ? "border-emerald-800/80 bg-emerald-950/90 text-emerald-100"
                : "border-red-800/80 bg-red-950/90 text-red-100"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={dismissToast}
                className="shrink-0 rounded px-1.5 text-xs opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </span>
          </output>
        </div>
      ) : null}
    </>
  );
}
