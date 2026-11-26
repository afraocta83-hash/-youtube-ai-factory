import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "lerry_yt_refresh";
const STATE_COOKIE = "lerry_yt_oauth_state";

function config() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI;
  const keyHex = process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY;
  if (!clientId || !clientSecret || !redirectUri || !keyHex || !/^[a-fA-F0-9]{64}$/.test(keyHex)) {
    throw new Error("Konfigurasi YouTube OAuth belum lengkap. Periksa YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REDIRECT_URI, dan YOUTUBE_TOKEN_ENCRYPTION_KEY (64 karakter hex).");
  }
  return { clientId, clientSecret, redirectUri, key: Buffer.from(keyHex, "hex") };
}

export async function beginOAuth() {
  const c = config();
  const state = randomBytes(24).toString("hex");
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: c.clientId, redirect_uri: c.redirectUri, response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload",
    access_type: "offline", prompt: "consent", state
  }).toString();
  return url.toString();
}

export async function completeOAuth(code: string, state: string) {
  const c = config();
  const jar = await cookies();
  const expected = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  if (!expected || !state || state !== expected) throw new Error("OAuth state tidak valid atau kedaluwarsa.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: c.clientId, client_secret: c.clientSecret, redirect_uri: c.redirectUri, grant_type: "authorization_code" }),
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok || !data.refresh_token) throw new Error(data.error_description || data.error || "Google tidak mengembalikan refresh token. Putuskan akses aplikasi lalu hubungkan ulang dengan consent.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", c.key, iv);
  const encrypted = Buffer.concat([cipher.update(data.refresh_token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  jar.set(TOKEN_COOKIE, Buffer.concat([iv, tag, encrypted]).toString("base64url"), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 180
  });
}

export async function getRefreshToken() {
  const c = config();
  const value = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!value) return null;
  try {
    const packed = Buffer.from(value, "base64url");
    const iv = packed.subarray(0, 12), tag = packed.subarray(12, 28), encrypted = packed.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", c.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch { return null; }
}

export async function getYoutubeAccessToken() {
  const c = config();
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("Akun YouTube belum terhubung. Hubungkan akun terlebih dahulu.");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: c.clientId, client_secret: c.clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(data.error_description || data.error || "Gagal memperbarui akses YouTube.");
  return data.access_token as string;
}

export async function disconnectYoutube() {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
}
