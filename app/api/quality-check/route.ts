import { NextResponse } from "next/server";

type Scene={seconds?:number;imagePrompt?:string;narration?:string;dialogue?:string;subtitle?:string};
export async function POST(req:Request){
  try{
    const p=await req.json(),issues:string[]=[],warnings:string[]=[];
    const story=typeof p.story==="string"?p.story:typeof p.script==="string"?p.script:"";
    const scenes:Scene[]=Array.isArray(p.scenes)?p.scenes:[];
    if(story.trim().length<80) issues.push("Cerita hasil AI terlalu pendek atau kosong.");
    if(scenes.length<4||scenes.length>6) issues.push("Storyboard harus berisi 4-6 adegan.");
    if(scenes.some(s=>!Number.isInteger(Number(s.seconds))||Number(s.seconds)<2||Number(s.seconds)>20)) issues.push("Ada durasi adegan yang tidak valid.");
    const seconds=scenes.reduce((n,s)=>n+(Number(s.seconds)||0),0);
    if(seconds<15||seconds>60) issues.push("Total durasi harus 15-60 detik.");
    if(scenes.some(s=>String(s.imagePrompt||"").trim().length<25)) issues.push("Ada prompt visual yang kurang jelas.");
    if(scenes.some(s=>!String(s.narration||s.dialogue||"").trim())) issues.push("Setiap adegan wajib memiliki narasi atau dialog.");
    if(!p.title||String(p.title).length>100) warnings.push("Judul YouTube kosong atau terlalu panjang.");
    if(!p.description) warnings.push("Deskripsi YouTube belum tersedia.");
    if(!Array.isArray(p.factCheckNotes)||!p.factCheckNotes.length) warnings.push("Tidak ada klaim yang ditandai untuk pemeriksaan fakta; tetap periksa bila topik edukasi.");
    const passed=issues.length===0;
    return NextResponse.json({ok:true,passed,score:Math.max(0,100-issues.length*20-warnings.length*5),issues,warnings,checks:{storyLength:story.length,sceneCount:scenes.length,totalSceneSeconds:seconds,visualPromptCount:scenes.filter(s=>String(s.imagePrompt||"").trim().length>=25).length},note:"QC ini memeriksa struktur naskah dan storyboard. Belum menilai fakta eksternal, hak cipta, kualitas visual/audio MP4, atau sinkronisasi."});
  }catch{return NextResponse.json({error:"Data produksi tidak valid."},{status:400});}
}
