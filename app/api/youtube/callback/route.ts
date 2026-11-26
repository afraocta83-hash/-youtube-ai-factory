import { NextRequest, NextResponse } from "next/server";
import { completeOAuth } from "@/lib/youtube/oauth";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL("/?youtube=denied", request.url));
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  try {
    await completeOAuth(code, state);
    return NextResponse.redirect(new URL("/?youtube=connected", request.url));
  } catch (e) {
    const message = e instanceof Error ? e.message : "OAuth gagal.";
    return NextResponse.redirect(new URL("/?youtube=error&reason=" + encodeURIComponent(message.slice(0, 180)), request.url));
  }
}
