import { NextResponse } from "next/server";
import { runLangflow } from "@/lib/agents/langflow";
import { withAgentSpan } from "@/lib/agents/telemetry";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL_DEFAULT = "openai/gpt-oss-120b";
const recentRequests = new Map<string, number>();

const productionSchema = {
  type: "object", additionalProperties: false,
  properties: {
    idea: { type: "string" }, workingTitle: { type: "string" }, hook: { type: "string" },
    story: { type: "string" }, synopsis: { type: "string" },
    scenes: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      number: { type: "integer" }, seconds: { type: "integer" }, visual: { type: "string" },
      action: { type: "string", enum: ["idle", "walk", "run", "surprised", "point"] },
      narration: { type: "string" }, dialogue: { type: "string" }, sound: { type: "string" },
      imagePrompt: { type: "string" }, subtitle: { type: "string" }
    }, required: ["number","seconds","visual","action","narration","dialogue","sound","imagePrompt","subtitle"] } },
    title: { type: "string" }, description: { type: "string" }, hashtags: { type: "array", items: { type: "string" } },
    thumbnailPrompt: { type: "string" }, factCheckNotes: { type: "array", items: { type: "string" } },
    sourceQueries: { type: "array", items: { type: "string" } }
  },
  required: ["idea","workingTitle","hook","story","synopsis","scenes","title","description","hashtags","thumbnailPrompt","factCheckNotes","sourceQueries"]
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try { if (new URL(origin).host !== new URL(request.url).host) return NextResponse.json({error:"Origin tidak diizinkan."},{status:403}); }
    catch { return NextResponse.json({error:"Origin tidak valid."},{status:403}); }
  }
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  for (const [key, stamp] of recentRequests) if (now - stamp > 10 * 60 * 1000) recentRequests.delete(key);
  const last = recentRequests.get(ip);
  if (last && now - last < 15 * 1000) return NextResponse.json({error:"Tunggu 15 detik sebelum membuat cerita berikutnya."},{status:429});
  const apiKeys = [...new Set([process.env.GROQ_API_KEY,process.env.GROQ_API_KEY2,process.env.GROQ_API_KEY3].map(k=>k?.trim()).filter((k):k is string=>Boolean(k)))];
  const langflowConfigured = Boolean(process.env.LANGFLOW_BASE_URL && process.env.LANGFLOW_FLOW_ID);
  if (!apiKeys.length && !langflowConfigured) return NextResponse.json({ error: "Mesin produksi cerita belum dikonfigurasi." }, { status: 503 });

  try {
    const body = await request.json();
    const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
    if (!idea) return NextResponse.json({ error: "Masukkan ide terlebih dahulu." }, { status: 400 });

    const model = (process.env.GROQ_MODEL || MODEL_DEFAULT).trim();
    const prompt = [
      "Kamu adalah produser storyboard dan art director animasi YouTube Shorts berbahasa Indonesia.",
      "OWNER HANYA MEMBERIKAN IDE SINGKAT. Tugasmu adalah menjadi penulis cerita dan produser Shorts: kembangkan ide menjadi cerita orisinal yang utuh, menarik, memiliki hook kuat, alur jelas, penutup memuaskan, narasi Bahasa Indonesia, dan dialog seperlunya. Jangan meminta owner menulis cerita. Jangan mengklaim fakta spesifik yang belum pasti; tandai klaim yang perlu diverifikasi.",
      "Tulis field story sebagai cerita final lengkap. Bagi cerita final tersebut menjadi 4-6 adegan berurutan. narration tiap adegan harus berupa kutipan persis yang berurutan dari field story agar renderer dapat menyusun audio dan subtitle. Dialogue boleh berupa dialog karakter yang memang menjadi bagian dari story; jika tidak ada, isi string kosong. Subtitle harus berupa kutipan pendek dari narration adegan.",
      "PENTING: setiap objek scenes WAJIB memuat SEMUA properti berikut: number (integer), seconds (integer), visual (string), action (idle, walk, run, surprised, point), narration (string), dialogue (string), sound (string), imagePrompt (string), subtitle (string). narration tidak boleh dihilangkan; isi dengan narasi adegan. Jika tidak ada dialog karakter, dialogue tetap wajib diisi sebagai string kosong.",
      "Buat cerita dan 4-6 adegan dengan durasi tiap adegan bilangan bulat 4-12 detik, total 20-60 detik. Setiap adegan punya narasi kutipan dari story, aksi visual, prompt gambar konkret, efek suara, dan subtitle singkat.",
      "Sebelum mengirim JSON, periksa satu per satu bahwa SETIAP adegan memiliki kesembilan properti wajib: number, seconds, visual, action, narration, dialogue, sound, imagePrompt, subtitle. Output hanya JSON valid sesuai schema.",
      "Bertindak sebagai art director untuk animasi kartun 2D Lerry. JANGAN meminta visual 3D atau fotorealistis: renderer saat ini membuat animasi 2D berbasis SVG/vector. Karakter utama wajib selalu identik: kepala putih bulat besar tanpa hidung dan tanpa rambut, mata kartun hitam dengan alis ekspresif, tubuh ramping seperti stickman, kaus biru polos, lengan dan kaki hitam, tangan hitam seperti sarung tangan, sepatu hitam, outline hitam tebal. Jangan ubah bentuk kepala, wajah, proporsi, identitas, atau warna kaus. Variasi hanya ekspresi, pose, aksi, latar dan properti adegan. Setiap adegan harus punya komposisi latar berbeda yang sesuai cerita; tulis visual dan imagePrompt sebagai arahan latar 2D sederhana yang dapat dibuat dengan bentuk vektor, bukan janji gambar AI khusus. Pilih lokasi konkret (mis. kota/jalan, rumah/kamar, sekolah, alam, perpustakaan, bengkel, luar angkasa) dan 1-3 properti utama yang relevan. Setiap adegan menyebut ukuran shot, sudut kamera, gerakan kamera sederhana, pencahayaan, aksi tunggal yang terbaca, dan detail latar. Hindari teks di dalam gambar, watermark, karakter ganda, anatomi cacat, dan perubahan desain tokoh. Vertikal 9:16. action hanya idle, walk, run, surprised, point.",
      "Judul YouTube menarik tetapi tidak menyesatkan. Deskripsi dan hashtag relevan. thumbnailPrompt mendeskripsikan satu thumbnail yang jelas, tanpa teks kecil. Output hanya JSON sesuai schema.",
      "IDE SINGKAT DARI OWNER (KEMBANGKAN MENJADI CERITA FINAL):", idea
    ].join("\n\n");

    const requestBody = JSON.stringify({ model, messages:[{role:"user",content:prompt}], response_format:{type:"json_schema",json_schema:{name:"lerry_shorts_production",strict:true,schema:productionSchema}}, reasoning_effort:"low", include_reasoning:false, temperature:0.7, max_completion_tokens:4200, stream:false });
    let raw: string | null = null;
    let provider = "groq";
    let data: any = null;
    if (langflowConfigured) {
      try {
        raw = await withAgentSpan("storyboard.langflow", { "agent.name": "Langflow Storyboard Agent", "agent.provider": "langflow", "input.length": idea.length }, () => runLangflow(prompt));
        provider = "langflow";
      } catch (error) {
        if (!apiKeys.length) throw error;
        console.warn("Langflow gagal; menggunakan Groq fallback:", error instanceof Error ? error.message : "unknown");
      }
    }
    if (!raw) {
      let response: Response | null = null;
      for (const [i,key] of apiKeys.entries()) {
        response=await withAgentSpan("storyboard.groq", { "agent.name": "Groq Storyboard Agent", "agent.provider": "groq", "llm.model": model, "input.length": idea.length, "provider.key_index": i + 1 }, () => fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:requestBody,signal:AbortSignal.timeout(55000)}));
        data=await response.json();
        if(response.ok||![401,403].includes(response.status)||i===apiKeys.length-1) break;
      }
      if(!response) return NextResponse.json({error:"Layanan produksi cerita tidak tersedia."},{status:503});
      if(!response.ok) return NextResponse.json({error:response.status===429?"Layanan produksi sedang mencapai batas penggunaan. Coba lagi beberapa saat.":`Mesin produksi cerita gagal: ${data?.error?.message||response.status}`},{status:response.status===429?429:502});
      const choice=data?.choices?.[0];
      if(choice?.finish_reason==="length") return NextResponse.json({error:"Batas token tercapai. Coba ide yang lebih sederhana."},{status:502});
      raw=choice?.message?.content;
    }
    if(typeof raw!=="string"||!raw.trim()) return NextResponse.json({error:"Mesin produksi tidak mengembalikan hasil yang valid."},{status:502});

    const p=await withAgentSpan("storyboard.validate", { "agent.name": "Storyboard QC Agent", "agent.scene_schema": "lerry-shorts-v1" }, async () => JSON.parse(raw!));
    if(!Array.isArray(p.scenes)||p.scenes.length<4||p.scenes.length>6) throw new Error("Storyboard harus berisi 4-6 adegan.");
    if(typeof p.story!=="string"||p.story.trim().length<80) throw new Error("AI mengubah cerita owner. Storyboard ditolak agar alur asli tetap terjaga.");
    let total=0;
    let narrationCursor=0;
    for(const [i,s] of p.scenes.entries()){
      if(!Number.isInteger(Number(s.seconds))||s.seconds<4||s.seconds>12) throw new Error(`Durasi adegan ${i+1} tidak valid.`);
      total+=Number(s.seconds); s.number=i+1;
      if(typeof s.imagePrompt!=="string"||s.imagePrompt.trim().length<25) throw new Error(`Prompt visual adegan ${i+1} kurang jelas.`);
      if(!String(s.subtitle||"").trim()) throw new Error(`Subtitle adegan ${i+1} kosong.`);
      if(!["idle","walk","run","surprised","point"].includes(String(s.action||""))) throw new Error(`Aksi karakter adegan ${i+1} tidak didukung renderer.`);
      if(!String(s.narration||s.dialogue||"").trim()) throw new Error(`Adegan ${i+1} belum memiliki narasi atau dialog.`);
      if(s.narration){
        const narrationText=s.narration.trim();
        const narrationAt=p.story.indexOf(narrationText,narrationCursor);
        if(narrationAt<0) throw new Error(`Narasi adegan ${i+1} bukan kutipan asli berurutan dari cerita owner.`);
        narrationCursor=narrationAt+narrationText.length;
      }
      if(s.subtitle&&!String(s.narration||"").includes(s.subtitle.trim())) throw new Error(`Subtitle adegan ${i+1} harus diambil dari narasi adegan.`);
      if(s.dialogue&&!p.story.includes(s.dialogue.trim())) throw new Error(`Dialog adegan ${i+1} bukan kutipan asli dari cerita owner.`);
    }
    if(total<20||total>60) throw new Error("Durasi total storyboard harus 20-60 detik.");
    p.idea=idea; p.script=p.story; p.ownerStory=p.story; p.durationSeconds=total;
    p.qcChecklist=["Cerita owner dipertahankan tanpa penulisan ulang.","Narasi adegan menggunakan kutipan asli dan urutan cerita dipertahankan.","Jumlah adegan 4-6 dan durasi 20-60 detik.","Konsistensi tokoh, properti, dan gaya visual diperiksa.","Video MP4 final harus lolos pemeriksaan codec, resolusi, FPS, audio, dan decode.","Owner memeriksa storyboard dan metadata sebelum render."];
    recentRequests.set(ip, now);
    return NextResponse.json({ok:true,production:p});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Terjadi kesalahan saat membuat cerita."},{status:502});
  }
}
