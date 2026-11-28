"use client";

import { FormEvent, CSSProperties, useEffect, useState } from "react";

type Job = { id: string; status: string; progress?: number; message?: string; clips?: {video:string;thumbnail:string;subtitles:string}[]; qc_report?: string; metadata?: string; error?: string };

const panel: CSSProperties = { background:"#fff", border:"1px solid #e4e9f2", borderRadius:18, padding:20, boxShadow:"0 8px 28px #2636530b" };
const button: React.CSSProperties = { border:0, borderRadius:11, padding:"13px 18px", background:"#35486e", color:"#fff", fontWeight:800, cursor:"pointer" };

export default function ClipperPage() {
  const [url,setUrl] = useState("");
  const [rights,setRights] = useState(false);
  const [busy,setBusy] = useState(false);
  const [job,setJob] = useState<Job|null>(null);
  const [error,setError] = useState("");

  useEffect(() => {
    if (!job?.id || ["completed","failed"].includes(job.status)) return;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/clipper/jobs?id=${encodeURIComponent(job.id)}`,{cache:"no-store"});
        const data = await response.json();
        if (active && response.ok && data.job) setJob(data.job);
        else if (active && !response.ok) setError(data.error || "Status job belum bisa dibaca.");
      } catch { if (active) setError("Koneksi ke mesin Lerry terputus sementara."); }
    };
    void poll();
    const timer = setInterval(poll,5000);
    return () => { active=false; clearInterval(timer); };
  },[job?.id,job?.status]);

  function artifactUrl(path: string) {
    const filename = path.split("/").pop() || "";
    return `/api/clipper/artifacts?job=${encodeURIComponent(job?.id || "")}&file=${encodeURIComponent(filename)}`;
  }

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setJob(null);
    try {
      const response = await fetch("/api/clipper/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url,rights_confirmed:rights})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengirim link.");
      setJob(data.job); setUrl("");
    } catch(e) { setError(e instanceof Error ? e.message : "Terjadi kesalahan."); }
    finally { setBusy(false); }
  }

  return <main style={{maxWidth:980,margin:"0 auto",padding:"34px 20px 70px",color:"#26334f"}}>
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:28}}>
      <a href="/" style={{color:"#35486e",fontWeight:800,textDecoration:"none"}}>← Lerry Studio</a>
      <span style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:"#6b7892"}}>FREE-FIRST • MASTER + WORKER</span>
    </header>
    <section style={{...panel,background:"linear-gradient(125deg,#f1f5ff,#fff 72%)",padding:28}}>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:".16em",color:"#8b96aa"}}>LERRY CLIPPER</div>
      <h1 style={{fontSize:"clamp(32px,6vw,48px)",letterSpacing:"-.045em",margin:"10px 0"}}>Satu link. Jadi beberapa Shorts.</h1>
      <p style={{maxWidth:690,lineHeight:1.7,color:"#71809a",margin:0}}>Tempel link video yang kamu miliki atau punya izin untuk gunakan. Lerry akan mengantrekan sumber untuk dianalisis, dipotong vertikal, diberi subtitle, ditingkatkan tampilannya, lalu disiapkan untuk pemeriksaan owner.</p>
    </section>
    <form onSubmit={submit} style={{...panel,marginTop:18}}>
      <label htmlFor="source-url" style={{display:"block",fontWeight:800,marginBottom:9}}>Link video sumber</label>
      <input id="source-url" type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{width:"100%",padding:15,border:"1px solid #d9e0ec",borderRadius:11,fontSize:15,boxSizing:"border-box"}} />
      <label style={{display:"flex",alignItems:"flex-start",gap:10,margin:"16px 0",fontSize:13,lineHeight:1.55,color:"#66738b"}}>
        <input type="checkbox" checked={rights} onChange={e=>setRights(e.target.checked)} style={{marginTop:3}} />
        Saya memiliki hak atas video ini atau izin yang diperlukan untuk mengunduh, mengedit, dan memublikasikan klipnya.
      </label>
      <button type="submit" disabled={busy || !rights} style={{...button,opacity:(busy || !rights) ? 0.55 : 1}}>{busy ? "Mengirim ke antrean…" : "Mulai proses klip"}</button>
      <p style={{fontSize:11,color:"#8994a8",marginBottom:0}}>Target output: 9:16 • 1080p jika sumber mendukung • 15–60 detik • MP4 + thumbnail + metadata + QC</p>
    </form>
    {error && <p role="alert" style={{background:"#fff1f1",color:"#a33",padding:13,borderRadius:10,marginTop:16}}>{error}</p>}
    {job && <section style={{...panel,marginTop:18}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><strong>Status produksi</strong><span style={{fontSize:12,color:"#64748b"}}>Job {job.id.slice(0,8)}</span></div>
      <h2 style={{fontSize:22,margin:"12px 0 5px"}}>{job.status.replaceAll("_"," ").toUpperCase()}</h2>
      <p style={{color:"#71809a",lineHeight:1.6}}>{job.message || "Menunggu pembaruan dari mesin produksi."}</p>
      <div style={{height:8,background:"#edf1f7",borderRadius:20,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(0,Math.min(100,job.progress||0))}%`,background:"#6b8acb",transition:"width .3s"}} /></div>
      {job.error && <p style={{color:"#a33"}}>{job.error}</p>}
      {job.clips?.map((clip,i)=><article key={clip.video} style={{display:"flex",gap:14,alignItems:"center",padding:"12px 0",borderTop:"1px solid #edf0f5"}}>{clip.thumbnail && <img src={artifactUrl(clip.thumbnail)} alt={`Thumbnail klip ${i+1}`} style={{width:76,aspectRatio:"9/16",objectFit:"cover",borderRadius:9,background:"#edf1f7"}} />}<div><strong>Klip {i+1}</strong><p style={{margin:"6px 0"}}><a href={artifactUrl(clip.video)} target="_blank" rel="noreferrer">Tonton / unduh MP4</a></p>{clip.subtitles && <a href={artifactUrl(clip.subtitles)} target="_blank" rel="noreferrer" style={{fontSize:12}}>Unduh subtitle</a>}</div></article>)}
      {job.status==="completed" && <><p style={{fontWeight:800,color:"#28734b"}}>Hasil siap diperiksa. Upload tetap menunggu persetujuan owner.</p><p style={{fontSize:13}}>{job.qc_report && <a href={artifactUrl(job.qc_report)} target="_blank" rel="noreferrer">Unduh laporan QC</a>}{job.qc_report && job.metadata && " · "}{job.metadata && <a href={artifactUrl(job.metadata)} target="_blank" rel="noreferrer">Unduh metadata</a>}</p></>}
    </section>}
    <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginTop:18}}>
      {[
        ["01","Analisis","Transkripsi dan pencarian momen bernilai."],
        ["02","Smart edit","Crop 9:16, subtitle dinamis, zoom dan koreksi visual."],
        ["03","QC & review","Validasi audio/video, thumbnail, metadata dan approval owner."]
      ].map(([n,title,desc])=><article key={n} style={panel}><span style={{color:"#9aa5b8",fontWeight:900}}>{n}</span><h3 style={{margin:"9px 0"}}>{title}</h3><p style={{color:"#71809a",fontSize:13,lineHeight:1.6,margin:0}}>{desc}</p></article>)}
    </section>
    <p style={{fontSize:11,color:"#929db0",marginTop:24}}>Worker dan penyimpanan hasil belum aktif sampai VPS Master dan VPS Worker dikonfigurasi. Lerry tidak mengklaim job berhasil sebelum mesin master mengonfirmasi.</p>
  </main>;
}
