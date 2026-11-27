import { NextResponse } from "next/server";
import { buildResearchReport } from "@/lib/research/analysts";
export const runtime = "nodejs";
export const maxDuration = 60;
const recent = new Map<string, number>();
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) { try { if (new URL(origin).host !== new URL(request.url).host) return NextResponse.json({ error: "Origin tidak diizinkan." }, { status: 403 }); } catch { return NextResponse.json({ error: "Origin tidak valid." }, { status: 403 }); } }
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  if (recent.has(ip) && now - (recent.get(ip) || 0) < 30000) return NextResponse.json({ error: "Tunggu 30 detik sebelum riset berikutnya." }, { status: 429 });
  try {
    const body = await request.json();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const claims = Array.isArray(body.claims) ? body.claims.filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 8).map((x: string) => x.trim()) : [];
    if (topic.length < 3 || topic.length > 160) return NextResponse.json({ error: "Topik harus 3-160 karakter." }, { status: 400 });
    if (claims.length > 5) return NextResponse.json({ error: "Maksimal 5 klaim per pemeriksaan." }, { status: 400 });
    const report = await buildResearchReport(topic, claims);
    recent.set(ip, now);
    return NextResponse.json({ ok: true, report }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Riset gagal." }, { status: 502 }); }
}
