import { cookies } from "next/headers";

import { CopyLicenseKeyButton } from "@/components/admin/CopyLicenseKeyButton";
import { ResetLicenseDevicesButton } from "@/components/admin/ResetLicenseDevicesButton";

type AdminLicense = {
  id: number;
  product_name: string;
  license_key: string;
  status: "active" | "suspended" | "expired" | "cancelled";
  customer_id: number;
  reseller_id: number | null;
  starts_at: string;
  expires_at: string;
  max_devices: number;
  bound_devices?: Record<string, unknown> | null;
};

type AdminUser = { id: number; email: string; role: string; is_active: boolean };

async function fetchLicenses(accessToken: string) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/admin/licenses`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return (await res.json()) as AdminLicense[];
}

async function fetchUsers(accessToken: string) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/admin/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) return null;
  return (await res.json()) as AdminUser[];
}

function deviceCount(row: AdminLicense): number {
  const b = row.bound_devices;
  if (b && typeof b === "object" && !Array.isArray(b)) return Object.keys(b).length;
  return 0;
}

type BoundDeviceRow = {
  device_id: string;
  device_name: string;
  last_seen_at: string;
  app_version: string;
};

function boundDevicesFromJson(bound: AdminLicense["bound_devices"]): BoundDeviceRow[] {
  if (!bound || typeof bound !== "object" || Array.isArray(bound)) return [];
  const rows: BoundDeviceRow[] = [];
  for (const [device_id, raw] of Object.entries(bound)) {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const o = raw as Record<string, unknown>;
      const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : "—");
      rows.push({
        device_id,
        device_name: str(o.device_name),
        last_seen_at: str(o.last_seen_at),
        app_version: str(o.app_version)
      });
    } else {
      rows.push({ device_id, device_name: "—", last_seen_at: "—", app_version: "—" });
    }
  }
  rows.sort((a, b) => a.device_id.localeCompare(b.device_id));
  return rows;
}

export const metadata = { title: "Licenses" };

export default async function AdminLicensesPage() {
  const access = (await cookies()).get("access_token")?.value;
  const [licenses, users] = access ? await Promise.all([fetchLicenses(access), fetchUsers(access)]) : [null, null];

  const userById = new Map<number, AdminUser>();
  for (const u of users ?? []) {
    userById.set(u.id, u);
  }

  const canAssignCustomer = (users?.length ?? 0) > 0;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-white">Licenses</h1>
        <p className="mt-2 text-sm text-slate-400">Mevcut backend: POST/GET /api/admin/licenses, PATCH status, POST reset-devices</p>
      </div>

      <section className="mt-10 rounded-lg border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-sm font-medium text-white">Yeni lisans</h2>
        <form action="/api/admin/licenses" method="post" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CustomerSelect users={users} />
          <Field name="reseller_id" label="reseller_id (opsiyonel)" placeholder="boş bırakılabilir" />
          <Field name="product_name" label="product_name" defaultValue="Arrow Restaurant" />
          <Field name="starts_at" label="starts_at (ISO)" placeholder="2026-05-05T00:00:00Z" required />
          <Field name="expires_at" label="expires_at (ISO)" placeholder="2027-05-05T00:00:00Z" required />
          <Field name="max_devices" label="max_devices" defaultValue="1" />
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={!canAssignCustomer}
              className="rounded-md bg-corporate-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-corporate-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Oluştur
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-white">Liste</h2>
        {!licenses?.length ? (
          <p className="mt-4 text-sm text-slate-500">Yüklenemedi, yetki yok veya kayıt yok.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {licenses.map((l) => {
              const dc = deviceCount(l);
              const devices = boundDevicesFromJson(l.bound_devices);
              return (
                <article key={l.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">ID #{l.id}</p>
                      <p className="mt-1 font-medium text-white">{l.product_name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Müşteri:{" "}
                        <span className="font-mono text-slate-400">{l.customer_id}</span>
                        {userById.get(l.customer_id) ? (
                          <span className="text-slate-400"> · {userById.get(l.customer_id)!.email}</span>
                        ) : null}
                      </p>
                    </div>
                    <span className="rounded-md border border-slate-700 px-2 py-1 text-xs font-medium uppercase text-slate-300">
                      {l.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-md border border-slate-700/80 bg-slate-950/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-500">license_key</p>
                      <CopyLicenseKeyButton licenseKey={l.license_key} />
                    </div>
                    <p className="mt-1 select-all break-all font-mono text-sm text-corporate-accent">{l.license_key}</p>
                  </div>

                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">expires_at</dt>
                      <dd className="font-mono text-slate-200">{l.expires_at}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">max_devices</dt>
                      <dd className="text-slate-200">{l.max_devices}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">device_count</dt>
                      <dd className="text-slate-200">{dc}</dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <h3 className="text-xs font-medium text-slate-500">Bound devices</h3>
                    {devices.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-600">None yet.</p>
                    ) : (
                      <div className="mt-2 overflow-x-auto rounded-md border border-slate-800 bg-slate-950/40">
                        <table className="min-w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500">
                              <th className="whitespace-nowrap px-3 py-2 font-medium">device_id</th>
                              <th className="whitespace-nowrap px-3 py-2 font-medium">device_name</th>
                              <th className="whitespace-nowrap px-3 py-2 font-medium">last_seen_at</th>
                              <th className="whitespace-nowrap px-3 py-2 font-medium">app_version</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300">
                            {devices.map((d) => (
                              <tr key={d.device_id} className="border-b border-slate-800/80 last:border-0">
                                <td className="max-w-[14rem] whitespace-normal break-all px-3 py-2 font-mono text-[11px] text-corporate-accent">
                                  {d.device_id}
                                </td>
                                <td className="max-w-[12rem] whitespace-normal break-words px-3 py-2">{d.device_name}</td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-slate-400">{d.last_seen_at}</td>
                                <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px]">{d.app_version}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <form action="/api/admin/licenses/status" method="post" className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="license_id" value={String(l.id)} />
                      <label className="text-xs text-slate-500">Durum</label>
                      <select
                        name="status"
                        defaultValue={l.status}
                        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                      >
                        <option value="active">active</option>
                        <option value="suspended">suspended</option>
                        <option value="expired">expired</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                      >
                        Güncelle
                      </button>
                    </form>
                    <ResetLicenseDevicesButton licenseId={l.id} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function CustomerSelect({ users }: { users: AdminUser[] | null }) {
  const list = [...(users ?? [])].sort((a, b) => a.id - b.id);
  return (
    <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
      <label htmlFor="license-customer" className="text-xs font-medium text-slate-400">
        Müşteri (kullanıcı)
      </label>
      {list.length === 0 ? (
        <p className="text-sm text-amber-400/90">
          Kullanıcı listesi yüklenemedi veya boş. GET /api/admin/users — sayfayı yenileyin veya önce kullanıcı oluşturun.
        </p>
      ) : (
        <select
          id="license-customer"
          name="customer_id"
          required
          defaultValue=""
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        >
          <option value="" disabled>
            — id · email seçin —
          </option>
          {list.map((u) => (
            <option key={u.id} value={String(u.id)}>
              {u.id} · {u.email}
              {!u.is_active ? " (inactive)" : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  defaultValue,
  required
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-400">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
      />
    </div>
  );
}
