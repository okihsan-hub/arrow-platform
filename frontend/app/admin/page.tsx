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

export default async function AdminPage() {
  const access = (await cookies()).get("access_token")?.value;
  const users = access ? await fetchUsers(access) : null;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Admin</h2>
      <p className="muted">Simple dashboard: list users.</p>
      {users ? (
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} className="card" style={{ padding: 12 }}>
              <div>
                <strong>{u.email}</strong>
              </div>
              <div className="muted">
                role: {u.role} • active: {String(u.is_active)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No access or failed to load.</p>
      )}
    </div>
  );
}

