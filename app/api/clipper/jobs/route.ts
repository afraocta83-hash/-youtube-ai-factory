import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function masterConfig() {
  const base = process.env.CLIPPER_MASTER_URL?.trim().replace(/\/$/, "");
  const token = process.env.CLIPPER_API_TOKEN?.trim();
  return base && token ? { base, token } : null;
}

function validSourceUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com") || url.hostname === "youtu.be" || url.hostname === "www.youtube.com");
  } catch { return false; }
}

function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) return NextResponse.json({error:"Origin tidak diizinkan."},{status:403});
  const config = masterConfig();
  if (!config) return NextResponse.json({error:"VPS Master belum terhubung. Dashboard sudah siap; antrean akan aktif setelah CLIPPER_MASTER_URL dan CLIPPER_API_TOKEN dipasang sebagai secret server-side."},{status:503});
  try {
    const body = await request.json();
    if (!validSourceUrl(body?.url)) return NextResponse.json({error:"Masukkan link YouTube HTTPS yang valid."},{status:400});
    if (body?.rights_confirmed !== true) return NextResponse.json({error:"Konfirmasi hak penggunaan video wajib dicentang."},{status:400});
    const upstream = await fetch(`${config.base}/jobs`, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${config.token}`},
      body:JSON.stringify({source_url:body.url,rights_confirmed:true}),
      cache:"no-store",signal:AbortSignal.timeout(12000)
    });
    const data = await upstream.json().catch(()=>({}));
    return NextResponse.json(data,{status:upstream.status});
  } catch {
    return NextResponse.json({error:"VPS Master tidak merespons. Coba lagi setelah koneksi mesin pulih."},{status:502});
  }
}

export async function GET(request: Request) {
  if (!checkOrigin(request)) return NextResponse.json({error:"Origin tidak diizinkan."},{status:403});
  const config = masterConfig();
  if (!config) return NextResponse.json({error:"VPS Master belum terhubung."},{status:503});
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-f0-9-]{36}$/i.test(id)) return NextResponse.json({error:"ID job tidak valid."},{status:400});
  try {
    const upstream = await fetch(`${config.base}/jobs/${encodeURIComponent(id)}`, {
      headers:{Authorization:`Bearer ${config.token}`},cache:"no-store",signal:AbortSignal.timeout(10000)
    });
    const data = await upstream.json().catch(()=>({}));
    return NextResponse.json(data,{status:upstream.status});
  } catch {
    return NextResponse.json({error:"Tidak dapat menghubungi VPS Master."},{status:502});
  }
}
