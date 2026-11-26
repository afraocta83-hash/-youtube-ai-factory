import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 15;

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || "afraocta83-hash";
const REPO = process.env.GITHUB_REPOSITORY_NAME || "-youtube-ai-factory";
const WORKFLOW = process.env.GITHUB_RENDER_WORKFLOW || "render-short.yml";
const BRANCH = process.env.GITHUB_RENDER_BRANCH || "experiment/openmontage-video-engine";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!accessToken || !supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Login owner Supabase diperlukan sebelum render." }, { status: 401 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Sesi owner tidak valid atau sudah kedaluwarsa. Login ulang." }, { status: 401 });
    }
    const token = process.env.GITHUB_ACTIONS_TOKEN;
    if (!token) {
      return NextResponse.json({
        error: "Render sekali klik belum aktif. Tambahkan GITHUB_ACTIONS_TOKEN sebagai environment variable server-side di Vercel (izin Actions: write). Token tidak boleh memakai prefix NEXT_PUBLIC_."
      }, { status: 503 });
    }
    const body = await request.json();
    const production = body?.production;
    if (!production || typeof production !== "object" || production.ownerStory !== production.script ||
        !Array.isArray(production.scenes) || production.scenes.length < 4 || production.scenes.length > 10) {
      return NextResponse.json({ error: "Paket produksi tidak valid atau cerita owner berubah." }, { status: 400 });
    }
    const story = String(production.ownerStory || "");
    const total = production.scenes.reduce((sum: number, scene: {seconds?: number}) => sum + Number(scene.seconds || 0), 0);
    if (story.trim().length < 40 || total < 15 || total > 60) {
      return NextResponse.json({ error: "Cerita wajib minimal 40 karakter dan durasi video 15-60 detik." }, { status: 400 });
    }
    const productionJson = JSON.stringify(production);
    if (Buffer.byteLength(productionJson, "utf8") > 60000) {
      return NextResponse.json({ error: "Paket produksi melebihi batas 60 KB GitHub Actions." }, { status: 413 });
    }
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ref: BRANCH, inputs: { production_json: productionJson } }),
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `GitHub menolak job render (${response.status}). Periksa izin token dan nama workflow. ${detail.slice(0, 400)}` }, { status: response.status === 404 ? 502 : response.status });
    }
    return NextResponse.json({ ok: true, branch: BRANCH, workflow: WORKFLOW, message: "Render job berhasil dikirim." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Tidak dapat memulai render." }, { status: 500 });
  }
}
