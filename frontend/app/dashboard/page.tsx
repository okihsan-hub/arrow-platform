import Link from "next/link";
import { cookies } from "next/headers";

async function fetchMe(accessToken: string) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return (await res.json()) as { email: string; role: string };
}

export const metadata = { title: "Panel" };

export default async function DashboardPage() {
  const access = (await cookies()).get("access_token")?.value;
  const me = access ? await fetchMe(access) : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-8">
        <h1 className="text-xl font-semibold text-white">Panel</h1>
        {me ? (
          <>
            <p className="mt-4 text-sm text-slate-400">
              <span className="text-slate-200">{me.email}</span> · rol:{" "}
              <span className="font-medium text-white">{me.role}</span>
            </p>
            {me.role === "admin" ? (
              <Link
                href="/admin"
                className="mt-6 inline-flex rounded-md bg-corporate-accent px-4 py-2 text-sm font-semibold text-white hover:bg-corporate-accent-hover"
              >
                Admin paneline git
              </Link>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Profil yüklenemedi.</p>
        )}
      </div>
    </div>
  );
}
