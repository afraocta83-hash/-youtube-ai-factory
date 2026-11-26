import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createOwnerSession, ownerCookieHeader } from "../../../../lib/owner-auth";

export const runtime = "nodejs";

// Best-effort per-instance throttling. This adds friction to password guessing
// without introducing a paid database or another credential dependency.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  // Vercel supplies x-real-ip at the edge. Avoid trusting a client-supplied
  // X-Forwarded-For value for the primary rate-limit identity.
  return request.headers.get("x-real-ip") || "unknown";
}

function pruneExpired(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.resetAt <= now) attempts.delete(key);
  }
  // Bound memory if a server instance receives many distinct client IPs.
  if (attempts.size > 1000) {
    const oldest = [...attempts.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (const [key] of oldest.slice(0, attempts.size - 1000)) attempts.delete(key);
  }
}

export async function POST(request: Request) {
  const expected = process.env.OWNER_PASSWORD || "";
  if (expected.length < 24) {
    return NextResponse.json({ error: "OWNER_PASSWORD belum diatur. Tambahkan password owner minimal 24 karakter di Vercel Preview." }, { status: 503 });
  }

  const now = Date.now();
  pruneExpired(now);
  const key = clientKey(request);
  const record = attempts.get(key);
  if (record && record.count >= MAX_FAILURES && record.resetAt > now) {
    const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login gagal. Coba lagi setelah masa jeda berakhir." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const supplied = typeof body?.password === "string" ? body.password : "";
    const a = Buffer.from(supplied);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      const current = attempts.get(key);
      if (!current || current.resetAt <= now) {
        attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        current.count += 1;
      }
      return NextResponse.json({ error: "Password owner salah." }, { status: 401 });
    }

    attempts.delete(key);
    const session = createOwnerSession();
    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", ownerCookieHeader(session.value, session.maxAge));
    return response;
  } catch {
    return NextResponse.json({ error: "Permintaan login tidak valid." }, { status: 400 });
  }
}
