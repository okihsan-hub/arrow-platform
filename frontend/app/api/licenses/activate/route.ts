import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const base = process.env.API_BASE_URL || "http://localhost:8000";
  const body = await req.json();

  const ts = req.headers.get("x-timestamp");
  const nonce = req.headers.get("x-nonce");
  const sig = req.headers.get("x-signature");
  const ua = req.headers.get("user-agent") || undefined;

  const res = await fetch(`${base}/api/licenses/activate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(ts ? { "X-Timestamp": ts } : {}),
      ...(nonce ? { "X-Nonce": nonce } : {}),
      ...(sig ? { "X-Signature": sig } : {}),
      ...(ua ? { "User-Agent": ua } : {})
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const data = await res.json().catch(() => ({ valid: false, reason: "upstream_error" }));
  return NextResponse.json(data, { status: 200 });
}

