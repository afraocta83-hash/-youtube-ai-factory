"use client";
import { useState } from "react";
import SupabasePanel from "./supabase-panel";

type Production = {
 workingTitle:string; hook:string; synopsis:string; script:string; ownerStory:string; durationSeconds:number;
 scenes:{number:number;seconds:number;visual:string;narration:string;dialogue:string;sound:string;imagePrompt:string;subtitle:string;action?:string}[];
 title:string;description:string;hashtags:string[];thumbnailPrompt:string;factCheckNotes:string[];sourceQueries:string[];qcChecklist:string[];
};
export default function Studio(){
 const [prompt,setPrompt]=useState("");
 const [busy,setBusy]=useState(false);
 const [renderBusy,setRenderBusy]=useState(false);
 const [error,setError]=useState("");
 const [renderMessage,setRenderMessage]=useState("");
 const [result,setResult]=useState<Production|null>(null);
 async function generate(){
  setError("");setRenderMessage("");setResult(null);setBusy(true);
  try{
   const res=await fetch("/api/produce",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({story:prompt})});
   const data=await res.json();if(!res.ok)throw new Error(data.error||"Gagal membuat paket produksi.");
   setResult(data.production);
  }catch(e){setError(e instanceof Error?e.message:"Terjadi kesalahan.");}
  finally{setBusy(false);}
 }
 async function render(){
  if(!result)return;
  setRenderBusy(true);setRenderMessage("");setError("");
  try{
   const res=await fetch("/api/render",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({production:result})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"Gagal memulai render.");
   setRenderMessage("Render berhasil dikirim ke GitHub Actions. Pantau proses dan unduh MP4 dari halaman Actions.");
  }catch(e){setError(e instanceof Error?e.message:"Render gagal dimulai.");}
  finally{setRenderBusy(false);}
 }
 function copy(){if(result)navigator.clipboard?.writeText(JSON.stringify(result,null,2));}
 return <section className="card studio">
  <div className="studioHead"><div><span className="status">PRODUSER AI • GEMINI</span><h2 style={{marginTop:12}}>Masukkan cerita buatan lo</h2><p>Tempel cerita final. AI hanya memecahnya menjadi storyboard, arahan visual, durasi, dan metadata. Cerita asli tidak boleh ditulis ulang.</p></div></div>
  <label htmlFor="storyPrompt">Cerita final owner</label>
  <textarea id="storyPrompt" value={prompt} onChange={e=>setPrompt(e.target.value)} maxLength={12000} placeholder="Tempel cerita lengkap yang sudah lo tulis. AI tidak akan menambah atau mengubah alur cerita..." rows={5}/>
  <div className="studioActions"><span className="muted">{prompt.length}/12.000 karakter</span><button onClick={generate} disabled={busy||!prompt.trim()}>{busy?"Sedang menyusun storyboard...":"Buat storyboard Shorts →"}</button></div>
  {error&&<p className="error" role="alert">{error}</p>}
  {busy&&<p className="muted">Tim produksi sedang membagi cerita lo menjadi adegan visual. Cerita asli tetap dipertahankan.</p>}
  {result&&<div className="productionResult">
   <div className="studioActions"><h2>{result.workingTitle}</h2><button className="secondary" onClick={copy}>Salin paket JSON</button></div>
   <p><strong>Hook:</strong> {result.hook}</p><p>{result.synopsis}</p>
   <h3>Naskah asli (terkunci)</h3><pre>{result.ownerStory}</pre>
   <h3>Storyboard ({result.scenes.length} adegan • ±{result.durationSeconds} detik)</h3>
   {result.scenes.map(s=><article className="scene" key={s.number}><strong>Adegan {s.number} • {s.seconds} detik</strong><p>{s.visual}</p><p><strong>Aksi:</strong> {s.action||"idle"}</p><p><strong>Narasi:</strong> {s.narration}</p><p><strong>Dialog:</strong> {s.dialogue}</p><p><strong>Subtitle:</strong> {s.subtitle}</p><p><strong>Arahan visual:</strong> {s.imagePrompt}</p><p><strong>Suara:</strong> {s.sound}</p></article>)}
   <h3>Metadata YouTube</h3><p><strong>{result.title}</strong></p><p>{result.description}</p><p>{result.hashtags.join(" ")}</p>
   <h3>Prompt thumbnail</h3><p>{result.thumbnailPrompt}</p>
   <h3>Catatan verifikasi</h3><ul>{result.factCheckNotes.map((x,i)=><li key={i}>{x}</li>)}</ul>
   <h3>Query sumber</h3><ul>{result.sourceQueries.map((x,i)=><li key={i}>{x}</li>)}</ul>
   <h3>Checklist QC</h3><ul>{result.qcChecklist.map((x,i)=><li key={i}>{x}</li>)}</ul>
   <div className="studioActions"><button onClick={render} disabled={renderBusy}>{renderBusy?"Mengirim job render...":"Render MP4 sekali klik →"}</button><a href="https://github.com/afraocta83-hash/-youtube-ai-factory/actions/workflows/render-short.yml" target="_blank" rel="noreferrer">Buka status GitHub Actions ↗</a></div>
   {renderMessage&&<p className="muted" role="status">{renderMessage}</p>}
   <p className="muted">Render memerlukan secret GITHUB_ACTIONS_TOKEN di Vercel (izin Actions: write) dan GEMINI_API_KEY di GitHub Actions. Tombol ini hanya memulai render; tidak mengunggah video ke YouTube.</p>
  </div>}
  <SupabasePanel production={result as unknown as Record<string, unknown> | null}/>
 </section>;
}
