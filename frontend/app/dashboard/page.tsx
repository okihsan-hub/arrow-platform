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

export default async function DashboardPage() {
  const access = (await cookies()).get("access_token")?.value;
  const me = access ? await fetchMe(access) : null;

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      {me ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          Logged in as <strong>{me.email}</strong> ({me.role})
        </p>
      ) : (
        <p className="muted" style={{ marginBottom: 0 }}>
          Could not load profile.
        </p>
      )}
    </div>
  );
}

