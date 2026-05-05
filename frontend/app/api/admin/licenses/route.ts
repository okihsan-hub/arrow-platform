import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function mustInt(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  const access = (await cookies()).get("access_token")?.value;
  if (!access) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const form = await req.formData();
  const customerId = mustInt(form.get("customer_id")?.toString() ?? null);
  const resellerId = mustInt(form.get("reseller_id")?.toString() ?? null);
  const maxDevices = mustInt(form.get("max_devices")?.toString() ?? null) ?? 1;
  const productName = (form.get("product_name")?.toString() || "Arrow Restaurant").trim();
  const startsAt = (form.get("starts_at")?.toString() || "").trim();
  const expiresAt = (form.get("expires_at")?.toString() || "").trim();

  if (!customerId || !startsAt || !expiresAt) {
    return NextResponse.json({ detail: "customer_id, starts_at, expires_at required" }, { status: 400 });
  }

  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/admin/licenses`, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${access}` },
    body: JSON.stringify({
      customer_id: customerId,
      reseller_id: resellerId,
      product_name: productName,
      starts_at: startsAt,
      expires_at: expiresAt,
      max_devices: maxDevices
    })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { detail: "Failed" }, { status: res.status });
  }

  return NextResponse.redirect(new URL("/admin/licenses", req.url), { status: 303 });
}

