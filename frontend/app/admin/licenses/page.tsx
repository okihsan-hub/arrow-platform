import Link from "next/link";
import { cookies } from "next/headers";

async function fetchLicenses(accessToken: string) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/admin/licenses`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return (await res.json()) as Array<{
    id: number;
    product_name: string;
    license_key: string;
    status: "active" | "suspended" | "expired" | "cancelled";
    customer_id: number;
    reseller_id: number | null;
    starts_at: string;
    expires_at: string;
    max_devices: number;
  }>;
}

export default async function AdminLicensesPage() {
  const access = (await cookies()).get("access_token")?.value;
  const licenses = access ? await fetchLicenses(access) : null;

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Licenses</h2>
        <Link href="/admin">Back</Link>
      </div>

      <p className="muted" style={{ marginTop: 10 }}>
        Minimal admin module: create + list + update status.
      </p>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Create license</h3>
        <form action="/api/admin/licenses" method="post" className="row" style={{ flexWrap: "wrap" }}>
          <input className="input" name="customer_id" placeholder="customer_id" style={{ maxWidth: 160 }} />
          <input className="input" name="reseller_id" placeholder="reseller_id (optional)" style={{ maxWidth: 200 }} />
          <input
            className="input"
            name="product_name"
            placeholder="product_name"
            defaultValue="Arrow Restaurant"
            style={{ maxWidth: 220 }}
          />
          <input className="input" name="starts_at" placeholder="starts_at (ISO)" style={{ maxWidth: 210 }} />
          <input className="input" name="expires_at" placeholder="expires_at (ISO)" style={{ maxWidth: 210 }} />
          <input className="input" name="max_devices" placeholder="max_devices" defaultValue="1" style={{ maxWidth: 160 }} />
          <button className="button buttonPrimary" type="submit">
            Create
          </button>
        </form>
        <p className="muted" style={{ marginBottom: 0 }}>
          ISO example: <code>2026-05-05T00:00:00Z</code>
        </p>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {licenses ? (
          licenses.map((l) => (
            <div key={l.id} className="card" style={{ padding: 12 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>#{l.id}</strong> <span className="muted">•</span> {l.product_name}
                </div>
                <div className="muted">{l.status}</div>
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                key: <code>{l.license_key}</code>
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                customer_id: {l.customer_id} • reseller_id: {String(l.reseller_id)} • max_devices: {l.max_devices}
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <form action="/api/admin/licenses/status" method="post" className="row">
                  <input type="hidden" name="license_id" value={String(l.id)} />
                  <select name="status" className="input" style={{ maxWidth: 200 }}>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="expired">expired</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  <button className="button" type="submit">
                    Update status
                  </button>
                </form>
                <form action="/api/admin/licenses/reset-devices" method="post" className="row">
                  <input type="hidden" name="license_id" value={String(l.id)} />
                  <button className="button" type="submit">
                    Reset devices
                  </button>
                </form>
              </div>
            </div>
          ))
        ) : (
          <p className="muted">No access or failed to load licenses.</p>
        )}
      </div>
    </div>
  );
}

