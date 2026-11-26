import { NextResponse } from "next/server";
import { isOwnerRequest } from "../../../lib/owner-auth";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_DEFAULT = "openai/gpt-oss-120b";

const productionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    workingTitle: { type: "string" },
    hook: { type: "string" },
    synopsis: { type: "string" },
    scenes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          number: { type: "integer" },
          seconds: { type: "integer" },
          visual: { type: "string" },
          action: { type: "string", enum: ["idle", "walk", "run", "surprised", "point"] },
          narration: { type: "string" },
          dialogue: { type: "string" },
          sound: { type: "string" },
          imagePrompt: { type: "string" },
          subtitle: { type: "string" }
        },
        required: ["number", "seconds", "visual", "action", "narration", "dialogue", "sound", "imagePrompt", "subtitle"]
      }
    },
    title: { type: "string" },
    description: { type: "string" },
    hashtags: { type: "array", items: { type: "string" } },
    thumbnailPrompt: { type: "string" },
    factCheckNotes: { type: "array", items: { type: "string" } },
    sourceQueries: { type: "array", items: { type: "string" } }
  },
  required: ["workingTitle", "hook", "synopsis", "scenes", "title", "description", "hashtags", "thumbnailPrompt", "factCheckNotes", "sourceQueries"]
};

export async function POST(request: Request) {
  if (!isOwnerRequest(request)) {
    return NextResponse.json({ error: "Login owner diperlukan sebelum memakai mesin produksi." }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY belum dipasang sebagai Secret di Vercel Preview." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const story = typeof body?.story === "string" ? body.story : "";
    if (!story.trim() || story.length > 12000) {
      return NextResponse.json({ error: "Masukkan cerita final buatan owner maksimal 12.000 karakter." }, { status: 400 });
    }

    const model = (process.env.GROQ_MODEL || MODEL_DEFAULT).trim();
    const prompt = [
      "TUGAS: kru pra-produksi animasi YouTube Shorts berbahasa Indonesia. Bukan penulis cerita.",
      "Cerita owner adalah sumber kanonis. Jangan mengarang, menambah, menghapus, mengubah urutan, memperbaiki, atau memparafrasekan cerita.",
      "Pecah cerita menjadi 4 sampai 6 adegan visual. Durasi tiap adegan bilangan bulat; jumlah total 15 sampai 60 detik.",
      "Setiap narration, dialogue, subtitle, dan hook wajib berupa kutipan berurutan yang persis ada di cerita. Jika tidak ada dialog, isi string kosong. Jangan membuat kata-kata yang tidak tertulis.",
      "script tidak perlu dibuat karena server akan memasang teks asli secara langsung.",
      "visual dan imagePrompt adalah interpretasi gambar, bukan fakta baru. Jaga karakter, pakaian, lokasi dan gaya gambar tetap konsisten. Format vertikal 9:16, kartun 2D, deskripsi gambar ringkas dan konkret.",
      "action hanya salah satu dari idle, walk, run, surprised, point. Sound berisi arahan efek suara singkat, bukan dialog.",
      "Synopsis satu kalimat netral. Thumbnail prompt satu komposisi vertikal yang jelas. Jangan mengarang sumber atau tanggal. factCheckNotes dan sourceQueries harus kosong jika cerita tidak mengandung klaim faktual yang perlu diverifikasi.",
      "Metadata judul, deskripsi dan hashtag harus relevan dengan cerita tanpa mengubah isi cerita. Keluarkan hanya data sesuai JSON schema.",
      "CERITA OWNER (pertahankan persis):",
      story
    ].join("\n\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lerry_shorts_production",
            strict: true,
            schema: productionSchema
          }
        },
        reasoning_effort: "low",
        include_reasoning: false,
        temperature: 0.5,
        max_completion_tokens: 3200,
        stream: false
      }),
      signal: AbortSignal.timeout(55000)
    });

    const data = await response.json();
    if (!response.ok) {
      const providerMessage = data?.error?.message || `Groq error ${response.status}`;
      return NextResponse.json({
        error: response.status === 429
          ? "Kuota gratis Groq sedang mencapai batas. Tunggu reset kuota lalu coba lagi."
          : `Groq gagal membuat storyboard: ${providerMessage}`,
        provider: "groq",
        model
      }, { status: response.status === 429 ? 429 : 502 });
    }

    const choice = data?.choices?.[0];
    const text = choice?.message?.content;
    if (choice?.finish_reason === "length") {
      return NextResponse.json({ error: "Batas token tercapai. Pendekkan cerita atau kurangi detail adegan, lalu coba lagi.", provider: "groq", model }, { status: 502 });
    }
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Groq tidak mengembalikan storyboard JSON.", provider: "groq", model }, { status: 502 });
    }

    const production = JSON.parse(text);
    if (!production || typeof production !== "object" || !Array.isArray(production.scenes) ||
        production.scenes.length < 4 || production.scenes.length > 6) {
      return NextResponse.json({ error: "Storyboard harus berisi 4-6 adegan." }, { status: 502 });
    }

    let totalSeconds = 0;
    for (const [index, scene] of production.scenes.entries()) {
      const seconds = Number(scene?.seconds);
      if (!Number.isInteger(seconds) || seconds < 1 || seconds > 20) {
        return NextResponse.json({ error: `Durasi adegan ${index + 1} tidak valid.` }, { status: 502 });
      }
      totalSeconds += seconds;
      scene.number = index + 1;
      if (typeof scene.imagePrompt !== "string" || scene.imagePrompt.trim().length < 20) {
        return NextResponse.json({ error: `Arahan visual adegan ${index + 1} belum cukup jelas.` }, { status: 502 });
      }
    }
    if (totalSeconds < 15 || totalSeconds > 60) {
      return NextResponse.json({ error: "Durasi total storyboard harus 15-60 detik." }, { status: 502 });
    }

    const spokenFields = ["narration", "dialogue", "subtitle"] as const;
    const inventedLines: string[] = [];
    for (const [index, scene] of production.scenes.entries()) {
      for (const field of spokenFields) {
        const line = typeof scene?.[field] === "string" ? scene[field].trim() : "";
        if (line && !story.includes(line)) inventedLines.push(`Adegan ${index + 1}: ${field}`);
      }
    }
    if (typeof production.hook !== "string" || !story.includes(production.hook.trim()) || inventedLines.length) {
      return NextResponse.json({
        error: "Storyboard menambahkan atau mengubah teks cerita. Tidak ada naskah yang diterima; coba ulangi.",
        validation: { inventedLines, hookValid: typeof production.hook === "string" && story.includes(production.hook.trim()) }
      }, { status: 502 });
    }

    production.script = story;
    production.ownerStory = story;
    production.durationSeconds = totalSeconds;
    production.qcChecklist = [
      "Cerita asli owner dipertahankan persis.",
      "Narasi, dialog dan subtitle hanya memakai kutipan cerita.",
      "Jumlah adegan dan durasi berada dalam batas Shorts 15-60 detik.",
      "Konsistensi karakter, lokasi dan gaya visual diperiksa.",
      "MP4 final harus lolos pemeriksaan codec, resolusi, FPS, audio dan decode."
    ];

    return NextResponse.json({
      ok: true,
      provider: "groq",
      model,
      ownerStoryPreserved: true,
      usage: data?.usage || null,
      production
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message.includes("JSON") ? "Format hasil AI tidak valid. Coba ulangi." : message }, { status: 500 });
  }
}
