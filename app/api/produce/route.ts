import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const schema = {
  type: "OBJECT",
  properties: {
    workingTitle: { type: "STRING" },
    hook: { type: "STRING" },
    synopsis: { type: "STRING" },
    script: { type: "STRING" },
    durationSeconds: { type: "NUMBER" },
    scenes: { type: "ARRAY", items: { type: "OBJECT", properties: {
      number: { type: "NUMBER" }, seconds: { type: "NUMBER" }, visual: { type: "STRING" },
      action: { type: "STRING", enum: ["idle","walk","run","surprised","point"] },
      narration: { type: "STRING" }, dialogue: { type: "STRING" }, sound: { type: "STRING" },
      imagePrompt: { type: "STRING" }, subtitle: { type: "STRING" }
    }, required: ["number","seconds","visual","action","narration","dialogue","sound","imagePrompt","subtitle"] } },
    title: { type: "STRING" },
    description: { type: "STRING" },
    hashtags: { type: "ARRAY", items: { type: "STRING" } },
    thumbnailPrompt: { type: "STRING" },
    factCheckNotes: { type: "ARRAY", items: { type: "STRING" } },
    sourceQueries: { type: "ARRAY", items: { type: "STRING" } },
    qcChecklist: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: ["workingTitle","hook","synopsis","script","durationSeconds","scenes","title","description","hashtags","thumbnailPrompt","factCheckNotes","sourceQueries","qcChecklist"]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const story = typeof body?.story === "string" ? body.story : (typeof body?.prompt === "string" ? body.prompt : "");
    if (!story.trim() || story.length > 12000) return NextResponse.json({ error: "Masukkan cerita buatan owner maksimal 12.000 karakter." }, { status: 400 });
    const freeLlmBaseUrl = process.env.FREELLM_BASE_URL?.trim().replace(/\/+$/, "");
    const freeLlmKey = process.env.FREELLM_API_KEY?.trim();
    const freeLlmModel = (process.env.FREELLM_MODEL || "free-smart").trim();
    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = (process.env.GEMINI_MODEL || "gemini-3.8-flash").trim();
    let model = "";
    let text = "";

    const instruction = `Kamu adalah kru produksi, BUKAN PENULIS CERITA. Cerita berikut ditulis dan dimiliki owner. DILARANG mengarang, menambah, menghapus, memperbaiki, mengubah urutan, atau memparafrasekan plot, dialog, fakta, dan ending. Pertahankan teks cerita persis sebagai nilai script: ${JSON.stringify(story)}. Tugasmu hanya memecah cerita yang sama menjadi 4-8 adegan visual, menentukan durasi, arahan kamera/gerak, aksi karakter (pilih hanya idle, walk, run, surprised, point), prompt gambar, musik/efek, subtitle yang diambil verbatim dari teks cerita (jangan menambah kata), serta metadata. Jika ada detail visual yang tidak disebut dalam cerita, gunakan interpretasi visual netral dan tandai sebagai interpretasi, jangan jadikan fakta cerita. Untuk sejarah, tandai klaim yang perlu diverifikasi; jangan mengarang sumber atau tanggal. Durasi total wajib 15-60 detik. Format vertikal 9:16, gaya animasi 2D konsisten. Jangan membuat naskah baru atau dialog tambahan. synopsis harus ringkasan netral tanpa mengubah alur. hook hanya boleh berupa kutipan persis dari cerita. Output JSON sesuai schema: ${JSON.stringify(schema)}.`;

    if (freeLlmBaseUrl) {
      model = freeLlmModel;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (freeLlmKey) headers.Authorization = `Bearer ${freeLlmKey}`;
      const response = await fetch(`${freeLlmBaseUrl}/v1/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: freeLlmModel,
          messages: [
            { role: "system", content: "You are a careful Indonesian animation production team. Return valid JSON only and obey the supplied JSON schema." },
            { role: "user", content: instruction }
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 12000
        }),
        signal: AbortSignal.timeout(55000)
      });
      const data = await response.json();
      if (!response.ok) return NextResponse.json({ error: data?.error?.message || `FreeLLM error ${response.status}`, provider: "freellm", model }, { status: response.status === 429 ? 429 : 502 });
      const messageContent = data?.choices?.[0]?.message?.content;
      text = typeof messageContent === "string"
        ? messageContent
        : Array.isArray(messageContent)
          ? messageContent.map((part: { text?: string }) => part?.text || "").join("")
          : "";
      if (!text) return NextResponse.json({ error: "FreeLLM tidak mengembalikan JSON storyboard.", provider: "freellm", model }, { status: 502 });
    } else {
      if (!geminiKey) return NextResponse.json({ error: "FREELLM_BASE_URL belum diatur. Alternatif Gemini juga belum tersedia." }, { status: 503 });
      model = geminiModel;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "You are a careful Indonesian animation production team. Return valid structured JSON only." }] },
          contents: [{ role: "user", parts: [{ text: instruction }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.2, maxOutputTokens: 12000 }
        }),
        signal: AbortSignal.timeout(55000)
      });
      const data = await response.json();
      if (!response.ok) return NextResponse.json({ error: data?.error?.message || `Gemini error ${response.status}`, model }, { status: response.status === 429 ? 429 : 502 });
      text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
      if (!text) return NextResponse.json({ error: "Gemini tidak mengembalikan paket produksi. Coba lagi sebentar." }, { status: 502 });
    }
    const production = JSON.parse(text);
    if (!production || typeof production !== "object" || !Array.isArray(production.scenes) || production.scenes.length < 4 || production.scenes.length > 10) {
      return NextResponse.json({ error: "Storyboard Shorts harus berisi 4-10 adegan." }, { status: 502 });
    }

    const totalSeconds = production.scenes.reduce((sum: number, scene: { seconds?: number }) => {
      const seconds = Number(scene?.seconds);
      return sum + (Number.isFinite(seconds) && seconds > 0 ? seconds : 0);
    }, 0);
    if (production.scenes.some((scene: { seconds?: number }) => !Number.isFinite(Number(scene?.seconds)) || Number(scene.seconds) <= 0)) {
      return NextResponse.json({ error: "Ada durasi adegan yang tidak valid." }, { status: 502 });
    }
    if (totalSeconds < 15 || totalSeconds > 60) {
      return NextResponse.json({ error: "Durasi hasil storyboard harus 15-60 detik. Coba ulangi." }, { status: 502 });
    }

    const allowedActions = new Set(["idle", "walk", "run", "surprised", "point"]);
    for (const scene of production.scenes) {
      if (!allowedActions.has(scene.action)) scene.action = "idle";
    }

    // The owner's submitted story is the canonical source. Never trust generated
    // text as a replacement for it, and reject invented spoken/subtitle lines.
    const textFields = ["narration", "dialogue", "subtitle"] as const;
    const inventedLines: string[] = [];
    for (const [index, scene] of production.scenes.entries()) {
      for (const field of textFields) {
        const line = typeof scene?.[field] === "string" ? scene[field].trim() : "";
        if (line && !story.includes(line)) inventedLines.push(`Adegan ${index + 1}: ${field}`);
      }
      if (typeof scene?.imagePrompt !== "string" || scene.imagePrompt.trim().length < 20) {
        return NextResponse.json({ error: `Arahan visual adegan ${index + 1} belum cukup jelas.` }, { status: 502 });
      }
    }
    if (inventedLines.length) {
      return NextResponse.json({
        error: "Storyboard menambahkan atau memparafrasekan teks cerita. Tidak ada naskah yang diterima; silakan coba ulangi.",
        validation: { inventedLines }
      }, { status: 502 });
    }

    // Preserve exact owner input byte-for-byte in the canonical script field.
    production.script = story;
    production.ownerStory = story;
    production.durationSeconds = totalSeconds;
    return NextResponse.json({ ok: true, model, ownerStoryPreserved: true, production });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message.includes("JSON") ? "Format hasil AI tidak valid. Coba ulangi." : message }, { status: 500 });
  }
}
