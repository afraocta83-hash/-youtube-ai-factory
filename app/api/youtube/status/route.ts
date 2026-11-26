import { NextResponse } from "next/server";
import { getRefreshToken, disconnectYoutube } from "@/lib/youtube/oauth";
export const runtime = "nodejs";
export async function GET() {
  try { return NextResponse.json({ connected: Boolean(await getRefreshToken()) }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ connected: false, configured: false }, { headers: { "Cache-Control": "no-store" } }); }
}
export async function DELETE() {
  await disconnectYoutube();
  return NextResponse.json({ connected: false });
}
