import { NextResponse } from "next/server";
export const runtime="nodejs";
export const maxDuration=60;
export async function POST(req:Request){
 try{
  const {topic}=await req.json();
  if(typeof topic!=="string"||!topic.trim()||topic.length>500)return NextResponse.json({error:"Topik riset wajib diisi (maksimal 500 karakter)."}, {status:400});
  const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:"GEMINI_API_KEY belum tersedia."},{status:503});
  const model=process.env.GEMINI_RESEARCH_MODEL||"gemini-2.5-flash";
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({
    contents:[{role:"user",parts:[{text:`Riset topik berikut untuk naskah YouTube Shorts berbahasa Indonesia: "${topic}". Prioritaskan sumber primer, museum, universitas, ensiklopedia tepercaya, arsip, dan situs produsen resmi. Rangkum fakta yang didukung sumber, tanggal/tokoh/nama penting, hal yang masih diperdebatkan, dan saran mana yang boleh didramatisasi. Jangan menebak. Sertakan URL sumber yang benar-benar muncul dari pencarian web. Jika bukti tidak cukup, katakan secara eksplisit.`}]}],
    tools:[{google_search:{}}],
    generationConfig:{temperature:0.2,maxOutputTokens:6000}
   }),
   signal:AbortSignal.timeout(55000)
  });
  const data=await r.json();if(!r.ok)return NextResponse.json({error:data?.error?.message||"Riset Gemini gagal."},{status:r.status===429?429:502});
  const c=data?.candidates?.[0];const summary=c?.content?.parts?.map((x:any)=>x.text||"").join("\n")||"";
  const chunks=c?.groundingMetadata?.groundingChunks||[];
  const sources=chunks.map((x:any)=>({title:x.web?.title||"Sumber web",url:x.web?.uri||""})).filter((x:any)=>x.url);
  return NextResponse.json({ok:true,model,topic,summary,sources,grounded: sources.length>0,warning:sources.length?"Tetap periksa sumber primer sebelum mengunci fakta.":"Tidak ada sumber web yang terlampir; jangan perlakukan klaim sebagai fakta terverifikasi."});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Kesalahan riset."},{status:500});}
}
