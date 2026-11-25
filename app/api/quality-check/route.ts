import { NextResponse } from "next/server";
type Scene = { seconds?: number; imagePrompt?: string; narration?: string; dialogue?: string; subtitle?: string };
export async function POST(req:Request){
 try{
  const p=await req.json();const issues:string[]=[];const warnings:string[]=[];
  const script=String(p.script||"");const scenes:Scene[]=Array.isArray(p.scenes)?p.scenes:[];
  if(script.trim().length<40)issues.push("Cerita owner terlalu pendek atau kosong.");
  if(scenes.length<4||scenes.length>10)issues.push("Storyboard Shorts harus berisi 4-10 adegan.");
  const seconds=scenes.reduce((n:number,s:Scene)=>n+(Number(s.seconds)||0),0);
  if(seconds<15||seconds>60)issues.push("Total durasi Shorts harus 15-60 detik.");
  const prompts=scenes.map((s:Scene)=>String(s.imagePrompt||""));
  if(prompts.some((x:string)=>x.length<25))warnings.push("Ada arahan visual yang terlalu singkat.");
  if(scenes.some((s:Scene)=>!s.narration&&!s.dialogue&&!s.subtitle))warnings.push("Ada adegan tanpa teks narasi/dialog/subtitle.");
  if(!p.title||String(p.title).length>100)warnings.push("Judul YouTube kosong atau terlalu panjang.");
  if(!p.description)warnings.push("Deskripsi YouTube belum tersedia.");
  if(!Array.isArray(p.factCheckNotes)||p.factCheckNotes.length===0)warnings.push("Catatan pemeriksaan fakta belum ada.");
  const passed=issues.length===0;
  return NextResponse.json({ok:true,passed,score:Math.max(0,100-issues.length*20-warnings.length*5),issues,warnings,checks:{scriptLength:script.length,sceneCount:scenes.length,totalSceneSeconds:seconds,visualPromptCount:prompts.filter((x:string)=>x.length>=25).length},note:"Pemeriksaan struktur Shorts 9:16; bukan pengganti pemeriksaan fakta, hak cipta, atau peninjauan hasil MP4."});
 }catch{return NextResponse.json({error:"Data produksi tidak valid."},{status:400});}
}
