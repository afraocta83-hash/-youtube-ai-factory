import { NextResponse } from "next/server";
type Scene = { seconds?: number; imagePrompt?: string; narration?: string; dialogue?: string };
export async function POST(req:Request){
 try{
  const p=await req.json();const issues:string[]=[];const warnings:string[]=[];
  const script=String(p.script||"");const scenes:Scene[]=Array.isArray(p.scenes)?p.scenes:[];
  if(script.trim().length<80)issues.push("Cerita/naskah terlalu pendek untuk produksi.");
  if(scenes.length<6)issues.push("Storyboard minimal 6 adegan.");
  if(scenes.length>12)warnings.push("Jumlah adegan cukup banyak; periksa durasi.");
  const seconds=scenes.reduce((n:number,s:Scene)=>n+(Number(s.seconds)||0),0);
  if(seconds<20||seconds>120)issues.push("Total durasi adegan harus 20-120 detik.");
  const prompts=scenes.map((s:Scene)=>String(s.imagePrompt||""));
  if(prompts.some((x:string)=>x.length<40))issues.push("Ada prompt visual yang terlalu pendek atau kosong.");
  if(scenes.some((s:Scene)=>!s.narration&&!s.dialogue))warnings.push("Ada adegan tanpa narasi maupun dialog.");
  if(!p.title||String(p.title).length>100)warnings.push("Judul YouTube kosong atau terlalu panjang.");
  if(!p.description)warnings.push("Deskripsi YouTube belum tersedia.");
  if(!Array.isArray(p.factCheckNotes)||p.factCheckNotes.length===0)warnings.push("Catatan pemeriksaan fakta belum ada.");
  const passed=issues.length===0;
  return NextResponse.json({ok:true,passed,score:Math.max(0,100-issues.length*20-warnings.length*5),issues,warnings,checks:{scriptLength:script.length,sceneCount:scenes.length,totalSceneSeconds:seconds,visualPromptCount:prompts.filter((x:string)=>x.length>=40).length},note:"Pemeriksaan struktur otomatis; bukan pengganti pemeriksaan fakta, hak cipta, atau peninjauan hasil video."});
 }catch{return NextResponse.json({error:"Data produksi tidak valid."},{status:400});}
}
