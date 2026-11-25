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
      narration: { type: "STRING" }, dialogue: { type: "STRING" }, sound: { type: "STRING" },
      imagePrompt: { type: "STRING" }, subtitle: { type: "STRING" }
    }, required: ["number","seconds","visual","narration","dialogue","sound","imagePrompt","subtitle"] } },
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
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt || prompt.length > 700) return NextResponse.json({ error: "Masukkan ide cerita maksimal 700 karakter." }, { status: 400 });
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "GEMINI_API_KEY belum tersedia di environment Production." }, { status: 503 });
    const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();
    const instruction = `Kamu adalah tim produksi YouTube Shorts animasi keluarga Indonesia. Pemilik hanya memberi topik; tim mengembangkan seluruh detail. Buat paket produksi lengkap dalam Bahasa Indonesia untuk topik: "${prompt}". Target 60-90 detik, vertikal 9:16, ramah keluarga, hook kuat, alur jelas dan ending memuaskan. Jika topik sejarah/fakta, jangan mengarang tanggal, kutipan, tokoh, atau klaim. Bedakan fakta terverifikasi dari rekonstruksi dramatis. Jika belum punya bukti sumber, tulis catatan verifikasi dan query sumber yang harus dicek, jangan berpura-pura telah melakukan riset. Tulis naskah narasi/dialog lengkap. Buat 6-10 adegan dengan durasi total sesuai target. Setiap imagePrompt rinci, konsisten gaya animasi 2D sinematik, komposisi vertikal, tanpa teks dalam gambar. Jangan memaksakan karakter Lerry/Ayah jika tidak relevan. Buat metadata YouTube, thumbnail prompt, catatan fact-check dan checklist QC. Output harus sesuai JSON schema.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are a careful Indonesian animation production team. Return valid structured JSON only." }] },
        contents: [{ role: "user", parts: [{ text: instruction }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.7, maxOutputTokens: 12000 }
      }),
      signal: AbortSignal.timeout(55000)
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || `Gemini error ${response.status}`, model }, { status: response.status === 429 ? 429 : 502 });
    const text = data?.candidates?.[0]?.content?.parts?.map((p: {text?:string}) => p.text || "").join("");
    if (!text) return NextResponse.json({ error: "Gemini tidak mengembalikan paket produksi. Coba lagi sebentar." }, { status: 502 });
    const production = JSON.parse(text);
    if (!Array.isArray(production.scenes) || production.scenes.length < 4) return NextResponse.json({ error: "Hasil storyboard belum memenuhi jumlah adegan minimum." }, { status: 502 });
    return NextResponse.json({ ok: true, model, production });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message.includes("JSON") ? "Format hasil AI tidak valid. Coba ulangi." : message }, { status: 500 });
  }
}
