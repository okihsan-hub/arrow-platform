import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const body = await req.json();
  const res = await fetch(`${base}/api/licenses/validate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  const data = await res.json().catch(() => ({ valid: false, reason: "upstream_error" }));
  return NextResponse.json(data, { status: 200 });
}

