import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createOwnerSession, ownerCookieHeader } from "../../../../lib/owner-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const expected = process.env.OWNER_PASSWORD || "";
  if (expected.length < 24) {
    return NextResponse.json({ error: "OWNER_PASSWORD belum diatur. Tambahkan password owner minimal 24 karakter di Vercel Preview." }, { status: 503 });
  }
  try {
    const body = await request.json();
    const supplied = typeof body?.password === "string" ? body.password : "";
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: "Password owner salah." }, { status: 401 });
    }
    const session = createOwnerSession();
    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", ownerCookieHeader(session.value, session.maxAge));
    return response;
  } catch {
    return NextResponse.json({ error: "Permintaan login tidak valid." }, { status: 400 });
  }
}
