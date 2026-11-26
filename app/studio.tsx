"use client";
import { useEffect, useState } from "react";

type Production = {
 idea:string; story:string; workingTitle:string; hook:string; synopsis:string; script:string; ownerStory:string; durationSeconds:number;
 scenes:{number:number;seconds:number;visual:string;narration:string;dialogue:string;sound:string;imagePrompt:string;subtitle:string;action?:string}[];
 title:string;description:string;hashtags:string[];thumbnailPrompt:string;factCheckNotes:string[];sourceQueries:string[];qcChecklist:string[];
};
type SavedProduction = { id:string; title:string; createdAt:string; production:Production };
type Usage = { prompt_tokens?:number; completion_tokens?:number; total_tokens?:number } | null;
const HISTORY_KEY = "lerry-animasi-history-v1";

export default function Studio(){
 const [prompt,setPrompt]=useState("");
 const [busy,setBusy]=useState(false);
 const [renderBusy,setRenderBusy]=useState(false);
 const [error,setError]=useState("");
 const [renderMessage,setRenderMessage]=useState("");
 const [result,setResult]=useState<Production|null>(null);
 const [usage,setUsage]=useState<Usage>(null);
 const [history,setHistory]=useState<SavedProduction[]>([]);
 const [renderSince,setRenderSince]=useState<number|null>(null);
 const [artifactUrl,setArtifactUrl]=useState("");
 const [renderRunUrl,setRenderRunUrl]=useState("");

 useEffect(()=>{
  if(!renderSince)return;
  let active=true;
  let timer:ReturnType<typeof setInterval>|undefined;
  const check=async()=>{
   try{
    const res=await fetch(`/api/render?since=${renderSince}`,{cache:"no-store"});
    const data=await res.json();
    if(!active)return;
    if(data.runUrl)setRenderRunUrl(data.runUrl);
    if(data.state==="success"&&data.downloadUrl){
     setArtifactUrl(data.downloadUrl);
     setRenderMessage("MP4 selesai dan lolos QC. Paket video, thumbnail, dan metadata siap diunduh.");
     if(timer)clearInterval(timer);
    }else if(data.state==="failed"){
     setError("Render gagal. Buka log GitHub untuk detail: "+(data.runUrl||""));
     if(timer)clearInterval(timer);
    }else{
     setRenderMessage(data.message||"Render sedang berjalan. Status diperiksa otomatis.");
    }
   }catch{}
  };
  check();
  timer=setInterval(check,10000);
  return()=>{active=false;if(timer)clearInterval(timer);};
 },[renderSince]);

 useEffect(()=>{
  try{
   const saved=localStorage.getItem(HISTORY_KEY);
   if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed))setHistory(parsed.slice(0,10));}
  }catch{localStorage.removeItem(HISTORY_KEY);}
 },[]);

 async function dispatchRender(production:Production){
  const res=await fetch("/api/render",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({production})});
  const data=await res.json();
  if(!res.ok)throw new Error(data.error||"Gagal memulai render.");
  return data;
 }
 async function generate(){
  setError("");setRenderMessage("");setResult(null);setUsage(null);setBusy(true);
  try{
   const res=await fetch("/api/produce",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idea:prompt})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Gagal membuat paket produksi.");
   const production=data.production as Production;
   setResult(production);setUsage(data.usage||null);
   const saved:SavedProduction={id:crypto.randomUUID(),title:production.workingTitle||"Lerry Short",createdAt:new Date().toISOString(),production};
   const next=[saved,...history].slice(0,10);
   setHistory(next);localStorage.setItem(HISTORY_KEY,JSON.stringify(next));
   setRenderMessage("Draft cerita dan storyboard siap diperiksa. Belum ada render atau upload yang dijalankan.");
  }catch(e){setError(e instanceof Error?e.message:"Terjadi kesalahan.");}
  finally{setBusy(false);}
 }
 async function render(){
  if(!result)return;
  setRenderBusy(true);setRenderMessage("");setError("");setArtifactUrl("");setRenderRunUrl("");setRenderSince(null);
  try{
   const qc=await fetch("/api/quality-check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(result)});
   const report=await qc.json();
   if(!qc.ok||!report.passed) throw new Error("QC belum lolos: "+[...(report.issues||[]),...(report.warnings||[])].join(" • "));
   const startedAt=Date.now();
   await dispatchRender(result);
   setRenderSince(startedAt);
   setRenderMessage("QC struktur lulus (skor "+report.score+"). Render dimulai; status dan paket unduhan akan muncul otomatis di sini.");
  }catch(e){setError(e instanceof Error?e.message:"Render gagal dimulai.");}
  finally{setRenderBusy(false);}
 }
 function copy(){if(result)navigator.clipboard?.writeText(JSON.stringify(result,null,2));}
 function restore(item:SavedProduction){setResult(item.production);setPrompt(item.production.idea||"");setRenderMessage("");setError("");window.scrollTo({top:0,behavior:"smooth"});}
 function clearHistory(){setHistory([]);localStorage.removeItem(HISTORY_KEY);}

 return <section className="card studio">
  <div className="studioHead"><div><span className="status">TIM PRODUKSI AI • GROQ + REMOTION</span><h2 style={{marginTop:12}}>Mesin produksi Lerry</h2><p>Lo cukup kasih ide. AI menyusun cerita, dialog, dan storyboard. Periksa hasilnya dulu; render baru berjalan setelah lo menyetujui. Upload YouTube tetap tahap terpisah.</p></div></div>
  <div className="studioActions"><span className="muted">Riwayat tersimpan di perangkat ini</span></div>
  <label htmlFor="storyPrompt">Ide cerita</label>
  <textarea id="storyPrompt" value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={500} placeholder="Contoh: Gimana mobil bisa berjalan? Jelaskan dengan animasi yang seru dan mudah dipahami anak-anak." rows={3}/>
  <div className="studioActions"><span className="muted">{prompt.length}/500 karakter</span><button onClick={generate} disabled={busy||renderBusy||!prompt.trim()}>{busy?"AI sedang membuat cerita...":"Buat cerita & storyboard →"}</button></div>
  {busy&&<p className="muted">AI sedang mengembangkan ide menjadi cerita, dialog, 4-6 adegan, dan metadata. Belum ada video yang dirender.</p>}
  {result&&<div className="productionResult">
    <div className="studioActions"><h2>{result.workingTitle}</h2><button className="secondary" onClick={copy}>Salin paket JSON</button></div>
    {usage&&<p className="muted">Pemakaian LLM: {usage.prompt_tokens??"—"} input • {usage.completion_tokens??"—"} output • {usage.total_tokens??"—"} total token</p>}
    <p><strong>Hook:</strong> {result.hook}</p><p>{result.synopsis}</p>
    <h3>Ide cerita</h3><pre>{result.idea}</pre><h3>Cerita yang dibuat AI</h3><pre>{result.story||result.ownerStory}</pre>
    <h3>Storyboard ({result.scenes.length} adegan • ±{result.durationSeconds} detik)</h3>
    {result.scenes.map(s=><article className="scene" key={s.number}><strong>Adegan {s.number} • {s.seconds} detik</strong><p>{s.visual}</p><p><strong>Aksi:</strong> {s.action||"idle"}</p><p><strong>Narasi:</strong> {s.narration}</p><p><strong>Dialog:</strong> {s.dialogue}</p><p><strong>Subtitle:</strong> {s.subtitle}</p><p><strong>Arahan visual:</strong> {s.imagePrompt}</p><p><strong>Suara:</strong> {s.sound}</p></article>)}
    <h3>Metadata YouTube</h3><p><strong>{result.title}</strong></p><p>{result.description}</p><p>{result.hashtags.join(" ")}</p>
    <h3>Prompt thumbnail</h3><p>{result.thumbnailPrompt}</p>
    <h3>Klaim yang perlu diverifikasi</h3><ul>{result.factCheckNotes.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <h3>Saran kata kunci pencarian sumber (belum diverifikasi)</h3><ul>{result.sourceQueries.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <h3>Checklist QC</h3><ul>{result.qcChecklist.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <div className="studioActions"><button onClick={render} disabled={renderBusy}>{renderBusy?"Memeriksa QC & mengirim render...":"Saya setujui — mulai render MP4 →"}</button><a href="https://github.com/afraocta83-hash/-youtube-ai-factory/actions/workflows/render-short.yml" target="_blank" rel="noreferrer">Buka status GitHub Actions ↗</a></div>
    {renderMessage&&<p className="muted" role="status">{renderMessage}</p>}
    {artifactUrl&&<p><a href={artifactUrl} target="_blank" rel="noreferrer">Unduh paket MP4 + thumbnail + metadata ↗</a></p>}
    {renderRunUrl&&<p className="muted"><a href={renderRunUrl} target="_blank" rel="noreferrer">Lihat log render ↗</a></p>}
    <p className="muted">Render memakai animasi Remotion berbasis karakter 2D, narasi Indonesia, dan subtitle. Setelah paket selesai, periksa MP4 sebelum upload. Tidak ada upload YouTube otomatis.</p>
  </div>}
  {error&&<p className="error" role="alert">{error}</p>}
  {history.length>0&&<section className="localHistory"><div className="studioActions"><h3>Riwayat di perangkat ini</h3><button className="secondary" onClick={clearHistory}>Hapus riwayat</button></div><p className="muted">Maksimal 10 produksi terakhir. Data disimpan di browser HP ini, bukan di cloud.</p><ul>{history.map(item=><li key={item.id}><button className="secondary" onClick={()=>restore(item)}>{item.title} — {new Date(item.createdAt).toLocaleString("id-ID")}</button></li>)}</ul></section>}
 </section>;
}
