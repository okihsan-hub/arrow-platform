import Link from "next/link";
import { cookies } from "next/headers";

async function fetchUsers(accessToken: string) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/admin/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return (await res.json()) as Array<{ id: number; email: string; role: string; is_active: boolean }>;
}

async function fetchLicenses(accessToken: string) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/admin/licenses`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return (await res.json()) as Array<{ id: number; status: string }>;
}

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const access = (await cookies()).get("access_token")?.value;
  const [users, licenses] = access ? await Promise.all([fetchUsers(access), fetchLicenses(access)]) : [null, null];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-400">Özet — mevcut backend API’leri kullanılır; sözleşmeler değiştirilmedi.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard href="/admin/users" title="Users" value={users?.length ?? "—"} subtitle="Kayıtlı hesaplar" />
        <DashboardCard href="/admin/licenses" title="Licenses" value={licenses?.length ?? "—"} subtitle="Lisans kayıtları" />
        <DashboardCard href="/admin/references" title="References" value="—" subtitle="Yakında CRUD" />
        <DashboardCard href="/admin/settings" title="Settings" value="—" subtitle="Yapılandırma" />
      </div>

      <div className="mt-10 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-sm font-medium text-slate-300">Son kullanıcılar</h2>
        {!users?.length ? (
          <p className="mt-4 text-sm text-slate-500">Yüklenemedi veya boş. Tam liste için Users sayfasına gidin.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-800">
            {users.slice(0, 5).map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-slate-200">{u.email}</span>
                <span className="text-slate-500">
                  {u.role} · {u.is_active ? "aktif" : "pasif"}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/users" className="mt-4 inline-block text-sm font-medium text-corporate-accent hover:underline">
          Tüm kullanıcılar →
        </Link>
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  title,
  value,
  subtitle
}: {
  href: string;
  title: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700 hover:bg-slate-900"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </Link>
  );
}
