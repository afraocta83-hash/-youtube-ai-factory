"use client";
import { useEffect, useState } from "react";
import ResearchDesk from "@/app/research-desk";

type Production = {
 idea:string; story:string; workingTitle:string; hook:string; synopsis:string; script:string; ownerStory:string; durationSeconds:number;
 scenes:{number:number;seconds:number;visual:string;narration:string;dialogue:string;sound:string;imagePrompt:string;subtitle:string;action?:string}[];
 title:string;description:string;hashtags:string[];thumbnailPrompt:string;factCheckNotes:string[];sourceQueries:string[];qcChecklist:string[];
};
type SavedProduction = { id:string; title:string; createdAt:string; production:Production };
type Agent = { id:string; name:string; engine:string; status:"ready"|"optional"|"blocked"; detail:string; approvalRequired?:boolean };
const HISTORY_KEY = "lerry-animasi-history-v1";

export default function Studio(){
 const [prompt,setPrompt]=useState("");
 const [busy,setBusy]=useState(false);
 const [renderBusy,setRenderBusy]=useState(false);
 const [error,setError]=useState("");
 const [renderMessage,setRenderMessage]=useState("");
 const [result,setResult]=useState<Production|null>(null);
 const [history,setHistory]=useState<SavedProduction[]>([]);
 const [renderSince,setRenderSince]=useState<number|null>(null);
 const [artifactUrl,setArtifactUrl]=useState("");
 const [renderRunUrl,setRenderRunUrl]=useState("");
 const [agents,setAgents]=useState<Agent[]>([]);
 const [agentSummary,setAgentSummary]=useState<{total:number;ready:number;optional:number;blocked:number}|null>(null);

 useEffect(()=>{ let active=true; fetch("/api/agents",{cache:"no-store"}).then(r=>r.json()).then(data=>{if(active&&data.ok){setAgents(data.agents||[]);setAgentSummary(data.summary||null);}}).catch(()=>{}); return()=>{active=false;}; },[]);

 useEffect(()=>{
  if(!renderSince)return;
  let active=true;
  let timer:ReturnType<typeof setInterval>|undefined;
  const check=async()=>{
   try{
    const res=await fetch(`/api/render?since=${renderSince}`,{cache:"no-store"});
    const data=await res.json();
    if(!active)return;
    if(!res.ok){setError(data.error||"Tidak dapat memeriksa status render.");if(timer)clearInterval(timer);return;}
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
  setError("");setRenderMessage("");setResult(null);setBusy(true);
  try{
   const res=await fetch("/api/produce",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idea:prompt})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Gagal membuat paket produksi.");
   const production=data.production as Production;
   setResult(production);
   const saved:SavedProduction={id:crypto.randomUUID(),title:production.workingTitle||"Lerry Short",createdAt:new Date().toISOString(),production};
   const next=[saved,...history].slice(0,10);
   setHistory(next);localStorage.setItem(HISTORY_KEY,JSON.stringify(next));
   setRenderMessage("Cerita dan storyboard siap diperiksa. Setujui untuk mulai render video MP4.");
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
  <div className="studioHead"><div><span className="status">TIM PRODUKSI LERRY</span><h2 style={{marginTop:12}}>Mesin produksi Lerry</h2><p>Masukkan satu ide. AI menulis cerita, narasi, dialog, storyboard, dan metadata. Setelah lo periksa dan setujui, mesin merender video MP4.</p></div></div>
  <div className="studioActions"><span className="muted">Riwayat tersimpan di perangkat ini</span></div>
  <section className="agentTeam">
   <div className="studioActions"><h3>Tim Agent Lerry</h3><span className="muted">{agentSummary?agentSummary.ready+"/"+agentSummary.total+" siap":"Memeriksa agent..."}</span></div>
   <div className="grid">
    {agents.map(agent=><article className="card" key={agent.id}>
     <div className="studioActions"><strong>{agent.name}</strong><span className="status">{agent.status==="ready"?"SIAP":agent.status==="optional"?"OPSIONAL":"BELUM AKTIF"}</span></div>
     <p className="muted">{agent.detail}</p>
     {agent.approvalRequired&&<p className="muted">Persetujuan owner wajib untuk setiap upload.</p>}
    </article>)}
   </div>
  </section>
  <ResearchDesk />
  <label htmlFor="storyPrompt">Ide video lo</label>
  <textarea id="storyPrompt" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Contoh: Sejarah motor pertama di dunia, dari penemuan sampai digunakan manusia." rows={3}/>
  <div className="studioActions"><span className="muted">{prompt.length} karakter • bebas panjang ide</span><button onClick={generate} disabled={busy||renderBusy||!prompt.trim()}>{busy?"Sedang membuat cerita & storyboard...":"Buat cerita + storyboard →"}</button></div>
  {busy&&<p className="muted">AI sedang menulis cerita orisinal, narasi, dialog, 4-6 adegan, arahan visual, dan metadata.</p>}
  {result&&<div className="productionResult">
    <div className="studioActions"><h2>{result.workingTitle}</h2><button className="secondary" onClick={copy}>Salin paket JSON</button></div>
    
    <p><strong>Hook:</strong> {result.hook}</p><p>{result.synopsis}</p>
    <h3>Ide owner</h3><pre>{result.idea}</pre><h3>Cerita final buatan AI</h3><pre>{result.story||result.ownerStory}</pre>
    <h3>Storyboard ({result.scenes.length} adegan • ±{result.durationSeconds} detik)</h3>
    {result.scenes.map(s=><article className="scene" key={s.number}><strong>Adegan {s.number} • {s.seconds} detik</strong><p>{s.visual}</p><p><strong>Aksi:</strong> {s.action||"idle"}</p><p><strong>Narasi:</strong> {s.narration}</p><p><strong>Dialog:</strong> {s.dialogue}</p><p><strong>Subtitle:</strong> {s.subtitle}</p><p><strong>Arahan visual:</strong> {s.imagePrompt}</p><p><strong>Suara:</strong> {s.sound}</p></article>)}
    <h3>Metadata YouTube</h3><p><strong>{result.title}</strong></p><p>{result.description}</p><p>{result.hashtags.join(" ")}</p>
    <h3>Prompt thumbnail</h3><p>{result.thumbnailPrompt}</p>
    <h3>Klaim yang perlu diverifikasi</h3><ul>{result.factCheckNotes.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <h3>Saran kata kunci pencarian sumber (belum diverifikasi)</h3><ul>{result.sourceQueries.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <h3>Checklist QC</h3><ul>{result.qcChecklist.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <div className="studioActions"><button onClick={render} disabled={renderBusy}>{renderBusy?"Memeriksa QC & mengirim render...":"Render Video MP4 →"}</button><a href="https://github.com/afraocta83-hash/-youtube-ai-factory/actions/workflows/render-short.yml" target="_blank" rel="noreferrer">Buka status GitHub Actions ↗</a></div>
    {renderMessage&&<p className="muted" role="status">{renderMessage}</p>}
    {artifactUrl&&<p><a href={artifactUrl} target="_blank" rel="noreferrer">Unduh paket MP4 + thumbnail + metadata ↗</a></p>}
    <section className="youtubePublishing"><h3>Upload manual ke YouTube</h3><p className="muted">Setelah paket diunduh, ekstrak ZIP, pilih file MP4, lalu unggah sendiri melalui YouTube Studio. Lerry tidak meminta akses akun Google dan tidak mengunggah video otomatis.</p><p><a href="https://studio.youtube.com/" target="_blank" rel="noreferrer">Buka YouTube Studio untuk upload ↗</a></p><p className="muted">Gunakan thumbnail.jpg dan salin judul, deskripsi, serta tag dari youtube-metadata.json. Periksa video sebelum mengatur visibilitas dan menerbitkannya.</p></section>
    {renderRunUrl&&<p className="muted"><a href={renderRunUrl} target="_blank" rel="noreferrer">Lihat log render ↗</a></p>}
    <p className="muted">Render memakai animasi Remotion berbasis karakter 2D, narasi Indonesia, dan subtitle. Setelah paket selesai, periksa MP4 sebelum upload. Tidak ada upload YouTube otomatis.</p>
  </div>}
  {error&&<p className="error" role="alert">{error}</p>}
  {history.length>0&&<section className="localHistory"><div className="studioActions"><h3>Riwayat di perangkat ini</h3><button className="secondary" onClick={clearHistory}>Hapus riwayat</button></div><p className="muted">Maksimal 10 produksi terakhir. Data disimpan di browser HP ini, bukan di cloud.</p><ul>{history.map(item=><li key={item.id}><button className="secondary" onClick={()=>restore(item)}>{item.title} — {new Date(item.createdAt).toLocaleString("id-ID")}</button></li>)}</ul></section>}
 </section>;
}
