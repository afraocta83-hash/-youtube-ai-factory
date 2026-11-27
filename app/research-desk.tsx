"use client";
import { useEffect, useState } from "react";
import { emitOfficeActivity } from "@/lib/office-events";

type Report = { topic:string; generatedAt:string; trend:{mode:string;note:string;videos:{title:string;url:string;channel:string;views:number;viewsPerDay:number;durationSeconds:number;score:number}[]}; verification:{claim:string;status:string;note:string;sources:{title:string;url:string;domain:string;snippet:string}[]}[]; opportunities:{title:string;score:number;rationale:string[];evidenceCount:number}[]; limitations:string[] };
type ApiStatus = { configured:boolean; connected:boolean; status:string; message:string };

export default function ResearchDesk(){
 const [topic,setTopic]=useState(""); const [claims,setClaims]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [report,setReport]=useState<Report|null>(null);
 const [apiStatus,setApiStatus]=useState<ApiStatus|null>(null); const [testingApi,setTestingApi]=useState(false);
 async function checkApi(){
  setTestingApi(true);
  try{const response=await fetch("/api/research/status",{cache:"no-store"});const data=await response.json();setApiStatus(data);}
  catch{setApiStatus({configured:false,connected:false,status:"error",message:"Tidak dapat memeriksa koneksi YouTube API."});}
  finally{setTestingApi(false);}
 }
 useEffect(()=>{void checkApi();},[]);
 async function run(){
  setBusy(true);setError("");setReport(null);emitOfficeActivity(["trend-research","data-verification","viral-opportunity"],"working","Riset topik dan pemeriksaan klaim berjalan");
  try{
   const response=await fetch("/api/research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({topic,claims:claims.split("\n").map(x=>x.trim()).filter(Boolean)})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Riset gagal");setReport(data.report);
   emitOfficeActivity(["trend-research","data-verification","viral-opportunity"],"done","Riset selesai; laporan siap diperiksa");
  }catch(e){const message=e instanceof Error?e.message:"Riset gagal";setError(message);emitOfficeActivity(["trend-research","data-verification","viral-opportunity"],"error",message);}
  finally{setBusy(false);void checkApi();}
 }
 return <section className="card agentTeam">
  <h2>Riset Tren & Peluang Shorts</h2>
  <p className="muted">Niko (Analis Tren), Sinta (Pemeriksa Fakta), dan Dika (Analis Peluang Viral). Hasil riset terpisah dari cerita final owner.</p>
  <div className="youtube-api-status" role="status">
   <div><strong>YouTube Data API v3</strong><span className={apiStatus?.connected?"connected":"disconnected"}>{apiStatus?.connected?"TERHUBUNG":apiStatus?.configured?"PERLU PERBAIKAN":apiStatus?"BELUM DIPASANG":"MEMERIKSA..."}</span></div>
   <p>{apiStatus?.message||"Memeriksa konfigurasi API..."}</p>
   <div className="studioActions">
    <button type="button" className="secondary" onClick={checkApi} disabled={testingApi}>{testingApi?"Menguji...":"Tes koneksi API"}</button>
    <a href="https://vercel.com/afraocta83-9700/youtube-ai-factory/settings/environment-variables" target="_blank" rel="noreferrer">Buka pengaturan API key Vercel ↗</a>
   </div>
   <small>Nama variabel wajib: YOUTUBE_API_KEY. Key disimpan di server Vercel, tidak ditampilkan di browser.</small>
  </div>
  <label htmlFor="researchTopic">Topik yang mau diteliti</label>
  <input id="researchTopic" value={topic} onChange={e=>setTopic(e.target.value)} maxLength={160} placeholder="Contoh: sejarah kendaraan pertama"/>
  <label htmlFor="researchClaims">Klaim/fakta yang perlu diperiksa (opsional, satu klaim per baris)</label>
  <textarea id="researchClaims" value={claims} onChange={e=>setClaims(e.target.value)} rows={3} placeholder="Contoh: mobil pertama dibuat pada tahun ..."/>
  <div className="studioActions"><span className="muted">Maksimal 5 klaim</span><button onClick={run} disabled={busy||topic.trim().length<3}>{busy?"Sedang meneliti...":"Jalankan Niko, Sinta & Dika →"}</button></div>
  {error&&<p className="error" role="alert">{error}</p>}
  {report&&<div>
   <h3>Niko — Analis Tren</h3><p>{report.trend.note}</p>
   {report.trend.videos.length?report.trend.videos.map((v,i)=><article className="scene" key={v.url}><strong>{i+1}. <a href={v.url} target="_blank" rel="noreferrer">{v.title}</a></strong><p>{v.channel} • {v.durationSeconds} detik • {v.views.toLocaleString("id-ID")} views • {v.viewsPerDay.toLocaleString("id-ID")} views/hari • skor velocity {v.score}/100</p></article>):<p className="muted">Belum ada data metrik video. Periksa status YouTube API di atas.</p>}
   <h3>Dika — Analis Peluang Viral</h3>{report.opportunities.map((o,i)=><article className="scene" key={i}><strong>{o.score}/100 • {o.title}</strong><ul>{o.rationale.map((r,j)=><li key={j}>{r}</li>)}</ul></article>)}
   <h3>Sinta — Pemeriksa Fakta</h3>{report.verification.length?report.verification.map((c,i)=><article className="scene" key={i}><strong>{c.claim}</strong><p>{c.status==="supported"?"DUKUNGAN AWAL":c.status==="conflicting"?"KONFLIK AWAL":"BELUM CUKUP BUKTI"} — {c.note}</p>{c.sources.map((s,j)=><p key={j}><a href={s.url} target="_blank" rel="noreferrer">{s.title||s.domain}</a> <span className="muted">({s.domain})</span></p>)}</article>):<p className="muted">Belum ada klaim yang dikirim untuk diperiksa.</p>}
   <h3>Batasan laporan</h3><ul>{report.limitations.map((x,i)=><li key={i}>{x}</li>)}</ul><p className="muted">Dibuat: {new Date(report.generatedAt).toLocaleString("id-ID")} • Mode tren: {report.trend.mode}</p>
  </div>}
 </section>;
}
