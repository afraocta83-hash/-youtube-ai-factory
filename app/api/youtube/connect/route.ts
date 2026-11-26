import { NextResponse } from "next/server";
import { beginOAuth } from "@/lib/youtube/oauth";
export const runtime = "nodejs";
export async function GET() {
  try { return NextResponse.redirect(await beginOAuth()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "OAuth belum siap." }, { status: 503 }); }
}
