"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { detail?: string } | null;
        setError(typeof data?.detail === "string" ? data.detail : "Giriş başarısız");
        return;
      }
      window.location.href = next;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8">
        <h1 className="text-xl font-semibold text-white">Giriş</h1>
        <p className="mt-2 text-sm text-slate-400">
          Yönetici hesabıyla giriş yaptıktan sonra{" "}
          <Link href="/admin" className="text-corporate-accent hover:underline">
            Admin
          </Link>{" "}
          paneline erişebilirsiniz.
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-400">Email</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Şifre</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-corporate-accent py-2.5 text-sm font-semibold text-white hover:bg-corporate-accent-hover disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          Geliştirme ortamı: kök `.env` içindeki <code className="text-slate-400">SEED_ADMIN_EMAIL</code> /{" "}
          <code className="text-slate-400">SEED_ADMIN_PASSWORD</code>
        </p>
      </div>
    </div>
  );
}
