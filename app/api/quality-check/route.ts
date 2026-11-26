import { NextResponse } from "next/server";

type Scene = {
  seconds?: number;
  imagePrompt?: string;
  narration?: string;
  dialogue?: string;
  subtitle?: string;
};

export async function POST(req: Request) {
  try {
    const p = await req.json();
    const issues: string[] = [];
    const warnings: string[] = [];
    const script = typeof p.script === "string" ? p.script : "";
    const ownerStory = typeof p.ownerStory === "string" ? p.ownerStory : "";
    const scenes: Scene[] = Array.isArray(p.scenes) ? p.scenes : [];

    if (script.trim().length < 40) issues.push("Cerita owner terlalu pendek atau kosong.");
    if (!ownerStory.trim()) issues.push("Cerita asli owner wajib dikirim; QC tidak boleh melewati pemeriksaan integritas naskah.");
    else if (script !== ownerStory) issues.push("Naskah hasil produksi tidak sama persis dengan cerita asli owner.");
    if (scenes.length < 4 || scenes.length > 10) issues.push("Storyboard Shorts harus berisi 4-10 adegan.");

    const invalidDurations = scenes.some((scene) => !Number.isFinite(Number(scene.seconds)) || Number(scene.seconds) <= 0);
    if (invalidDurations) issues.push("Ada durasi adegan yang tidak valid.");
    const seconds = scenes.reduce((n, scene) => n + (Number(scene.seconds) || 0), 0);
    if (seconds < 15 || seconds > 60) issues.push("Total durasi Shorts harus 15-60 detik.");

    const prompts = scenes.map((scene) => String(scene.imagePrompt || ""));
    if (prompts.some((value) => value.trim().length < 25)) issues.push("Ada adegan dengan prompt visual kurang dari 25 karakter.");

    const inventedLines: string[] = [];
    if (ownerStory) {
      scenes.forEach((scene, index) => {
        for (const field of ["narration", "dialogue", "subtitle"] as const) {
          const line = typeof scene[field] === "string" ? scene[field]!.trim() : "";
          if (line && !ownerStory.includes(line)) inventedLines.push(`Adegan ${index + 1}: ${field}`);
        }
      });
      if (inventedLines.length) issues.push("Narasi, dialog, atau subtitle mengandung teks yang bukan kutipan persis dari cerita owner.");
    }

    if (scenes.some((scene) => !scene.narration && !scene.dialogue && !scene.subtitle)) {
      warnings.push("Ada adegan tanpa teks narasi/dialog/subtitle.");
    }
    if (!p.title || String(p.title).length > 100) warnings.push("Judul YouTube kosong atau terlalu panjang.");
    if (!p.description) warnings.push("Deskripsi YouTube belum tersedia.");
    if (!Array.isArray(p.factCheckNotes) || p.factCheckNotes.length === 0) warnings.push("Catatan pemeriksaan fakta belum ada.");

    const passed = issues.length === 0;
    return NextResponse.json({
      ok: true,
      passed,
      score: Math.max(0, 100 - issues.length * 20 - warnings.length * 5),
      issues,
      warnings,
      checks: {
        scriptLength: script.length,
        ownerStoryExactMatch: ownerStory ? script === ownerStory : false,
        sceneCount: scenes.length,
        totalSceneSeconds: seconds,
        visualPromptCount: prompts.filter((value) => value.trim().length >= 25).length,
        inventedLines,
      },
      note: "QC ini memeriksa struktur dan integritas teks. Ini belum menilai kualitas visual/audio MP4, sinkronisasi bibir, fakta eksternal, atau hak cipta.",
    });
  } catch {
    return NextResponse.json({ error: "Data produksi tidak valid." }, { status: 400 });
  }
}
