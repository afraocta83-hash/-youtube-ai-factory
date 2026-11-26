import { NextResponse } from "next/server";
import { OWNER_COOKIE } from "../../../../lib/owner-auth";

export const runtime = "nodejs";

export async function POST() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", `${OWNER_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
  return response;
}
