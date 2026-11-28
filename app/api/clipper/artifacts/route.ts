import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return NextResponse.json({ error: "Origin tidak diizinkan." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Origin tidak valid." }, { status: 403 });
    }
  }

  const configBase = process.env.CLIPPER_MASTER_URL?.trim().replace(/\/$/, "");
  const token = process.env.CLIPPER_API_TOKEN?.trim();
  if (!configBase || !token) {
    return NextResponse.json({ error: "VPS Master belum terhubung." }, { status: 503 });
  }

  const params = new URL(request.url).searchParams;
  const job = params.get("job") || "";
  const file = params.get("file") || "";
  if (!/^[a-f0-9-]{36}$/i.test(job) || !/^[A-Za-z0-9._-]{1,180}$/.test(file)) {
    return NextResponse.json({ error: "Referensi file tidak valid." }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${configBase}/artifacts/${encodeURIComponent(job)}/${encodeURIComponent(file)}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(60000) }
    );
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: upstream.status === 404 ? "File tidak ditemukan." : "Gagal mengambil file hasil." }, { status: upstream.status || 502 });
    }
    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
    headers.set("Content-Disposition", `inline; filename="${file.replace(/["\\\\]/g, "")}"`);
    headers.set("Cache-Control", "private, no-store");
    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Tidak dapat menghubungi VPS Master." }, { status: 502 });
  }
}
