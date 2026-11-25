import { NextResponse } from "next/server";
export async function POST(req:Request){
 try{
  const p=await req.json();const issues:string[]=[];const warnings:string[]=[];
  const script=String(p.script||"");const scenes=Array.isArray(p.scenes)?p.scenes:[];
  if(script.trim().length<250)issues.push("Naskah terlalu pendek untuk Shorts berdurasi 60-90 detik.");
  if(scenes.length<6)issues.push("Storyboard minimal 6 adegan.");
  if(scenes.length>12)warnings.push("Jumlah adegan cukup banyak; periksa durasi dan beban produksi.");
  const seconds=scenes.reduce((n:number,s:any)=>n+(Number(s.seconds)||0),0);
  if(seconds<35||seconds>100)issues.push("Total durasi adegan harus berada di kisaran 35-100 detik.");
  const prompts=scenes.map((s:any)=>String(s.imagePrompt||""));
  if(prompts.some(x=>x.length<40))issues.push("Ada prompt visual yang terlalu pendek atau kosong.");
  if(scenes.some((s:any)=>!s.narration&&!s.dialogue))warnings.push("Ada adegan tanpa narasi maupun dialog.");
  if(!p.title||String(p.title).length>100)warnings.push("Judul YouTube kosong atau terlalu panjang.");
  if(!p.description)warnings.push("Deskripsi YouTube belum tersedia.");
  if(!Array.isArray(p.factCheckNotes)||p.factCheckNotes.length===0)warnings.push("Catatan pemeriksaan fakta belum ada.");
  const passed=issues.length===0;
  return NextResponse.json({ok:true,passed,score:Math.max(0,100-issues.length*20-warnings.length*5),issues,warnings,checks:{scriptLength:script.length,sceneCount:scenes.length,totalSceneSeconds:seconds,visualPromptCount:prompts.filter(x=>x.length>=40).length},note:"QC otomatis ini pemeriksaan struktur. Fakta sejarah, hak cipta, dan hasil render tetap memerlukan pemeriksaan sumber dan peninjauan manusia."});
 }catch{return NextResponse.json({error:"Data produksi tidak valid."},{status:400});}
}
