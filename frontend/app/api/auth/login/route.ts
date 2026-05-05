import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const body = await req.json();

  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = (await res.json().catch(() => null)) as
    | { access_token: string; refresh_token: string }
    | { detail?: string }
    | null;

  if (!res.ok || !data || !("access_token" in data) || !("refresh_token" in data)) {
    return NextResponse.json({ detail: (data as any)?.detail || "Login failed" }, { status: 401 });
  }

  const out = NextResponse.json({ ok: true });
  out.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  out.cookies.set("refresh_token", data.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/"
  });
  return out;
}

