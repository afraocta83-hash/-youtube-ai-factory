import { NextRequest, NextResponse } from "next/server";
import { getYoutubeAccessToken } from "@/lib/youtube/oauth";
import { withAgentSpan } from "@/lib/agents/telemetry";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body?.ownerApproved !== true) return NextResponse.json({ error: "Persetujuan owner untuk upload wajib diberikan." }, { status: 403 });
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags.map((x: unknown) => String(x).replace(/^#/, "").trim()).filter(Boolean).slice(0, 30) : [];
    const privacyStatus = body.privacyStatus === "public" ? "public" : body.privacyStatus === "unlisted" ? "unlisted" : "private";
    if (!title || title.length > 100) return NextResponse.json({ error: "Judul YouTube wajib diisi dan maksimal 100 karakter." }, { status: 400 });
    const token = await getYoutubeAccessToken();
    const response = await withAgentSpan("publishing.youtube-upload-session", { "agent.name":"YouTube Publishing Agent", "agent.engine":"YouTube Data API v3", "approval.owner":true, "youtube.privacy":privacyStatus }, () => fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": "video/mp4" },
      body: JSON.stringify({ snippet: { title, description, tags, categoryId: "27", defaultLanguage: "id" }, status: { privacyStatus, selfDeclaredMadeForKids: false } }),
      cache: "no-store"
    }));
    if (!response.ok) return NextResponse.json({ error: "YouTube menolak sesi upload: " + (await response.text()).slice(0, 500) }, { status: 502 });
    const uploadUrl = response.headers.get("location");
    if (!uploadUrl) return NextResponse.json({ error: "YouTube tidak mengembalikan URL upload." }, { status: 502 });
    return NextResponse.json({ ok: true, uploadUrl, privacyStatus }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Tidak dapat menyiapkan upload YouTube." }, { status: 503 });
  }
}
