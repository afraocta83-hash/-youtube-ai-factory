import { NextResponse } from "next/server";
import { isOwnerRequest } from "../../../lib/owner-auth";

export const runtime = "nodejs";
export const maxDuration = 15;

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || "afraocta83-hash";
const REPO = process.env.GITHUB_REPOSITORY_NAME || "-youtube-ai-factory";
const WORKFLOW = process.env.GITHUB_RENDER_WORKFLOW || "render-short.yml";
const BRANCH = process.env.GITHUB_RENDER_BRANCH || "experiment/openmontage-video-engine";

export async function POST(request: Request) {
  if (!isOwnerRequest(request)) {
    return NextResponse.json({ error: "Login owner diperlukan sebelum mengirim render." }, { status: 401 });
  }

  const token = process.env.GITHUB_ACTIONS_TOKEN;
  if (!token) {
    return NextResponse.json({
      error: "GITHUB_ACTIONS_TOKEN belum dipasang sebagai Secret server-side di Vercel Preview. Jangan gunakan prefix NEXT_PUBLIC_."
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const production = body?.production;
    if (!production || typeof production !== "object" ||
        typeof production.ownerStory !== "string" ||
        production.ownerStory !== production.script ||
        !Array.isArray(production.scenes) ||
        production.scenes.length < 4 || production.scenes.length > 6) {
      return NextResponse.json({ error: "Paket produksi tidak valid atau cerita owner berubah." }, { status: 400 });
    }

    const story = production.ownerStory;
    let total = 0;
    for (const [index, scene] of production.scenes.entries()) {
      const seconds = Number(scene?.seconds);
      if (!Number.isInteger(seconds) || seconds <= 0 || seconds > 20) {
        return NextResponse.json({ error: `Durasi adegan ${index + 1} tidak valid.` }, { status: 400 });
      }
      total += seconds;
      for (const field of ["narration", "dialogue", "subtitle"] as const) {
        const line = typeof scene?.[field] === "string" ? scene[field].trim() : "";
        if (line && !story.includes(line)) {
          return NextResponse.json({ error: `Teks ${field} adegan ${index + 1} bukan kutipan cerita owner.` }, { status: 400 });
        }
      }
      if (typeof scene?.imagePrompt !== "string" || scene.imagePrompt.trim().length < 20) {
        return NextResponse.json({ error: `Prompt visual adegan ${index + 1} belum valid.` }, { status: 400 });
      }
    }
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
      return NextResponse.json({
        error: `GitHub menolak job render (${response.status}). Periksa izin token dan nama workflow. ${detail.slice(0, 400)}`
      }, { status: response.status === 404 ? 502 : response.status });
    }

    return NextResponse.json({ ok: true, branch: BRANCH, workflow: WORKFLOW, message: "Render job berhasil dikirim." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Tidak dapat memulai render." }, { status: 500 });
  }
}
