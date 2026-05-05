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

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const access = (await cookies()).get("access_token")?.value;
  const users = access ? await fetchUsers(access) : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Users</h1>
      <p className="mt-2 text-sm text-slate-400">Kaynak: GET /api/admin/users</p>

      {!users ? (
        <p className="mt-8 text-sm text-slate-500">Liste yüklenemedi veya yetki yok.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-slate-500">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{u.email}</td>
                  <td className="px-4 py-3 text-slate-400">{u.role}</td>
                  <td className="px-4 py-3 text-slate-400">{u.is_active ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
