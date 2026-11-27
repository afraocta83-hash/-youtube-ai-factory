import Studio from "./studio";

const modules = [
 {title:"Render MP4 Shorts",detail:"Remotion dan GitHub Actions merender video vertikal H.264 1080 × 1920, 30 fps, durasi 15-60 detik.",status:"Showcase MP4 lulus QC"},
 {title:"Quality control",detail:"Kode memeriksa struktur cerita, jumlah adegan, durasi, audio, codec, resolusi, FPS dan decode.",status:"Validasi deterministik"},
 {title:"Riwayat lokal",detail:"Maksimal 10 storyboard terakhir disimpan di browser perangkat ini; tidak memakai database cloud.",status:"Tanpa Supabase"},
 {title:"YouTube publishing",detail:"Upload tetap manual agar owner menyetujui hasil video dan metadata sebelum dipublikasikan.",status:"Persetujuan owner"}
];
export default function Home(){
 return <main className="shell">
  <header className="top"><div className="brand"><div className="logo">L</div><div><strong>LERRY ANIMASI</strong><div className="muted" style={{fontSize:12}}>YouTube Shorts Production Studio</div></div></div><span className="pill">GRATIS DULU • YOUTUBE SAJA</span></header>
  <section className="hero"><span className="status">Studio produksi • Mesin produksi Shorts • 15-60 detik</span><h1>Mesin produksi Lerry</h1><p>Lo cukup kirim ide singkat. AI membuat cerita, dialog, storyboard, dan metadata. Periksa hasilnya; setujui render; tonton MP4 final; lalu baru upload sendiri setelah benar-benar oke.</p><a className="cta" href="https://www.youtube.com/@lerry_animasi" target="_blank" rel="noreferrer">Lihat channel YouTube ↗</a></section>
  <Studio/>
  <section className="grid">{modules.map(item=><article className="card" key={item.title}><span className="status">{item.status}</span><h2 style={{marginTop:14}}>{item.title}</h2><p>{item.detail}</p></article>)}</section>
  <footer className="footer">Lerry Animasi Studio • Produksi tidak mempublikasikan apa pun tanpa persetujuan owner.</footer>
 </main>;
}
