import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ configured: false, connected: false, status: "missing", message: "YOUTUBE_API_KEY belum ditambahkan ke Vercel." }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.search = new URLSearchParams({ part: "id", chart: "mostPopular", regionCode: "ID", maxResults: "1", key }).toString();
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const payload = await response.json();
    if (!response.ok) {
      const reason = String(payload?.error?.errors?.[0]?.reason || "");
      const message = reason === "quotaExceeded" || reason === "dailyLimitExceeded"
        ? "API key terbaca, tetapi kuota harian YouTube sudah habis."
        : reason === "accessNotConfigured" || reason === "serviceDisabled"
          ? "YouTube Data API v3 belum diaktifkan pada Google Cloud project."
          : response.status === 400 || response.status === 401 || reason === "keyInvalid"
            ? "API key tidak valid. Periksa YOUTUBE_API_KEY di Vercel."
            : "Google menolak akses (" + response.status + "). Periksa pembatasan API key dan izin YouTube Data API v3.";
      return NextResponse.json({ configured: true, connected: false, status: "error", message }, { status: 200, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ configured: true, connected: true, status: "connected", message: "YouTube Data API v3 terhubung untuk riset tren Indonesia.", testedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ configured: true, connected: false, status: "error", message: "Tidak dapat menghubungi Google. Coba tes koneksi lagi." }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
