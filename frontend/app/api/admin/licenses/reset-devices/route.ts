import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const access = (await cookies()).get("access_token")?.value;
  if (!access) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const form = await req.formData();
  const licenseId = Number(form.get("license_id")?.toString() || "0");
  if (!licenseId) return NextResponse.json({ detail: "license_id required" }, { status: 400 });

  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const res = await fetch(`${base}/api/admin/licenses/${licenseId}/reset-devices`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store"
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(data || { detail: "Failed" }, { status: res.status });
  }

  return NextResponse.redirect(new URL("/admin/licenses", req.url), { status: 303 });
}

