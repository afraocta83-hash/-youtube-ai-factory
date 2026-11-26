import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const maxDuration = 60;
function pcmToWavBase64(pcm: Uint8Array, sampleRate=24000, channels=1) {
 const header = new ArrayBuffer(44); const v = new DataView(header);
 const write=(o:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
 write(0,"RIFF");v.setUint32(4,36+pcm.length,true);write(8,"WAVE");write(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);write(36,"data");v.setUint32(40,pcm.length,true);
 const out=new Uint8Array(44+pcm.length);out.set(new Uint8Array(header));out.set(pcm,44);return Buffer.from(out).toString("base64");
}
export async function POST(req:Request){
 try{
  const {text,voiceName="Kore",style="Narasi Bahasa Indonesia yang hangat, jelas, ekspresif, dan alami."}=await req.json();
  if(typeof text!=="string"||!text.trim()||text.length>8000)return NextResponse.json({error:"Teks suara wajib diisi dan maksimal 8.000 karakter."},{status:400});
  const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:"GEMINI_API_KEY belum tersedia."},{status:503});
  const model=process.env.GEMINI_TTS_MODEL||"gemini-3.8-flash-tts";
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({contents:[{parts:[{text, speechMetadata:{style}}]}],generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName}}}}}),
   signal:AbortSignal.timeout(55000)
  });
  const data=await r.json();if(!r.ok)return NextResponse.json({error:data?.error?.message||"Gemini TTS gagal."},{status:r.status===429?429:502});
  const part=data?.candidates?.[0]?.content?.parts?.find((p:any)=>p.inlineData?.data);
  if(!part)return NextResponse.json({error:"Gemini tidak mengembalikan audio."},{status:502});
  const raw=Buffer.from(part.inlineData.data,"base64");
  const mime=part.inlineData.mimeType||"audio/pcm;rate=24000";
  const wav=mime.includes("wav")?raw.toString("base64"):pcmToWavBase64(new Uint8Array(raw));
  return NextResponse.json({ok:true,mimeType:"audio/wav",audioBase64:wav,model,voiceName});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Kesalahan TTS."},{status:500});}
}
