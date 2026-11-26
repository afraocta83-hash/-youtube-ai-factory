import { createHmac, timingSafeEqual } from "node:crypto";

export const OWNER_COOKIE = "lerry_owner_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return process.env.OWNER_PASSWORD || "";
}

function signature(expiresAt: string) {
  return createHmac("sha256", secret()).update(expiresAt).digest("hex");
}

export function createOwnerSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return { value: `${expiresAt}.${signature(expiresAt)}`, maxAge: SESSION_SECONDS };
}

export function isOwnerRequest(request: Request) {
  const key = secret();
  if (!key) return false;
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader.split(";").map(part => part.trim()).find(part => part.startsWith(`${OWNER_COOKIE}=`));
  if (!cookie) return false;
  const value = decodeURIComponent(cookie.slice(OWNER_COOKIE.length + 1));
  const [expiresAt, supplied] = value.split(".");
  if (!expiresAt || !supplied || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;
  const expected = signature(expiresAt);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function ownerCookieHeader(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${OWNER_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}
