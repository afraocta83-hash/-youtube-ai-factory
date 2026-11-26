import { NextResponse } from "next/server";
import { isOwnerRequest } from "../../../lib/owner-auth";

export const runtime = "nodejs";
export const maxDuration = 60;
const MODEL_DEFAULT = "openai/gpt-oss-120b";

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
  if (!isOwnerRequest(request)) return NextResponse.json({ error: "Login owner diperlukan sebelum memakai mesin produksi." }, { status: 401 });
  const apiKeys = [...new Set([process.env.GROQ_API_KEY,process.env.GROQ_API_KEY2,process.env.GROQ_API_KEY3].map(k=>k?.trim()).filter((k):k is string=>Boolean(k)))];
  if (!apiKeys.length) return NextResponse.json({ error: "Pasang minimal satu GROQ_API_KEY sebagai Secret di Vercel Preview." }, { status: 503 });

  try {
    const body = await request.json();
    const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
    if (idea.length < 5 || idea.length > 500) return NextResponse.json({ error: "Masukkan ide singkat 5-500 karakter." }, { status: 400 });

    const model = (process.env.GROQ_MODEL || MODEL_DEFAULT).trim();
    const prompt = [
      "Kamu adalah ruang penulis dan sutradara animasi YouTube Shorts berbahasa Indonesia.",
      "Owner hanya memberi IDE, bukan cerita final. Kembangkan ide menjadi cerita orisinal yang utuh, menarik, mudah dipahami anak dan keluarga, tanpa menyalin karya atau karakter berhak cipta.",
      "Buat cerita singkat dengan awal yang menarik, konflik/pertanyaan, penjelasan atau penyelesaian yang memuaskan, dan penutup. Hindari klaim faktual yang tidak pasti; bila topiknya edukasi sains/teknologi, tandai hal yang perlu verifikasi pada factCheckNotes dan sourceQueries. Jangan mengarang sumber.",
      "PENTING: setiap objek scenes WAJIB memuat SEMUA properti berikut, tanpa terkecuali: number (integer), seconds (integer), visual (string), action (salah satu: idle, walk, run, surprised, point), narration (string), dialogue (string), sound (string), imagePrompt (string), subtitle (string). Jangan pernah menghilangkan properti narration. narration wajib berisi kalimat narator untuk adegan itu; jika tidak ada narator, isi string kosong \"\". dialogue juga wajib ada; jika tidak ada dialog karakter, isi string kosong \"\\".", 
      "Buat 4-6 adegan, durasi tiap adegan bilangan bulat 2-15 detik, total 15-60 detik. Narasi/dialog/subtitle harus ditulis sebagai naskah final yang konsisten dengan story. Setiap adegan punya aksi visual, prompt gambar konkret, efek suara, dan subtitle singkat.",
      "Sebelum mengirim JSON, periksa satu per satu bahwa SETIAP adegan memiliki kesembilan properti wajib: number, seconds, visual, action, narration, dialogue, sound, imagePrompt, subtitle. Output hanya JSON valid sesuai schema.";
      "Jaga konsistensi tokoh (nama, rupa, pakaian), lokasi, properti, dan gaya gambar di semua imagePrompt. Visual: animasi kartun 2D ramah keluarga, vertikal 9:16. action hanya idle, walk, run, surprised, point.",
      "Judul YouTube menarik tetapi tidak menyesatkan. Deskripsi dan hashtag relevan. thumbnailPrompt mendeskripsikan satu thumbnail yang jelas, tanpa teks kecil. Output hanya JSON sesuai schema.",
      "IDE OWNER:", idea
    ].join("\n\n");

    const requestBody = JSON.stringify({ model, messages:[{role:"user",content:prompt}], response_format:{type:"json_schema",json_schema:{name:"lerry_shorts_production",strict:true,schema:productionSchema}}, reasoning_effort:"low", include_reasoning:false, temperature:0.7, max_completion_tokens:4200, stream:false });
    let response: Response | null=null, data:any=null;
    for (const [i,key] of apiKeys.entries()) {
      response=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:requestBody,signal:AbortSignal.timeout(55000)});
      data=await response.json();
      if(response.ok||![401,403].includes(response.status)||i===apiKeys.length-1) break;
    }
    if(!response) return NextResponse.json({error:"Tidak ada key Groq yang dapat digunakan."},{status:503});
    if(!response.ok) return NextResponse.json({error:response.status===429?"Kuota gratis Groq sedang mencapai batas. Tunggu reset kuota lalu coba lagi.":`Groq gagal membuat cerita: ${data?.error?.message||response.status}`},{status:response.status===429?429:502});
    const choice=data?.choices?.[0], raw=choice?.message?.content;
    if(choice?.finish_reason==="length") return NextResponse.json({error:"Batas token tercapai. Coba ide yang lebih sederhana."},{status:502});
    if(typeof raw!=="string"||!raw.trim()) return NextResponse.json({error:"Groq tidak mengembalikan JSON produksi."},{status:502});

    const p=JSON.parse(raw);
    if(!Array.isArray(p.scenes)||p.scenes.length<4||p.scenes.length>6) throw new Error("Storyboard harus berisi 4-6 adegan.");
    if(typeof p.story!=="string"||p.story.trim().length<80) throw new Error("Cerita hasil AI terlalu pendek atau kosong.");
    let total=0;
    for(const [i,s] of p.scenes.entries()){
      if(!Number.isInteger(Number(s.seconds))||s.seconds<2||s.seconds>20) throw new Error(`Durasi adegan ${i+1} tidak valid.`);
      total+=Number(s.seconds); s.number=i+1;
      if(typeof s.imagePrompt!=="string"||s.imagePrompt.trim().length<25) throw new Error(`Prompt visual adegan ${i+1} kurang jelas.`);
      if(!String(s.narration||s.dialogue||"").trim()) throw new Error(`Adegan ${i+1} belum memiliki narasi atau dialog.`);
    }
    if(total<15||total>60) throw new Error("Durasi total storyboard harus 15-60 detik.");
    p.idea=idea; p.script=p.story; p.ownerStory=p.story; p.durationSeconds=total;
    p.qcChecklist=["Ide owner dikembangkan menjadi cerita baru oleh AI.","Alur cerita, dialog, dan narasi konsisten antaradegan.","Jumlah adegan 4-6 dan durasi 15-60 detik.","Konsistensi tokoh, properti, dan gaya visual diperiksa.","Video MP4 final harus lolos pemeriksaan codec, resolusi, FPS, audio, dan decode.","Owner memeriksa storyboard dan metadata sebelum render."];
    return NextResponse.json({ok:true,provider:"groq",model,usage:data?.usage||null,production:p});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Terjadi kesalahan saat membuat cerita."},{status:502});
  }
}
