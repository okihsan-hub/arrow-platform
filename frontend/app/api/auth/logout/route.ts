import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const out = NextResponse.redirect(new URL("/", req.url));
  out.cookies.set("access_token", "", { httpOnly: true, maxAge: 0, path: "/" });
  out.cookies.set("refresh_token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return out;
}

