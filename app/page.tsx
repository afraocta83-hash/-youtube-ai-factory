import Studio from "./studio";

const modules = [
 {title:"Produser produksi Gemini",detail:"Menyusun storyboard dari cerita final owner. Memerlukan GEMINI_API_KEY pada environment Preview/Production yang sesuai.",status:"Menunggu verifikasi API"},
 {title:"Storyboard & visual",detail:"Membagi cerita menjadi adegan, arahan visual, durasi, dan metadata. Teks cerita owner tetap menjadi sumber utama.",status:"Pra-produksi • perlu uji live"},
 {title:"Voice & subtitle",detail:"Workflow menyediakan TTS per adegan dan subtitle berbasis estimasi durasi audio. Sinkronisasi fonem/lip-sync belum tersedia.",status:"Perlu uji TTS live"},
 {title:"Render MP4 Shorts",detail:"Remotion merender video vertikal 1080 × 1920, 30 fps, durasi 15-60 detik melalui GitHub Actions.",status:"Workflow CI lolos • dispatch belum diuji"},
 {title:"Quality control",detail:"QC otomatis memeriksa struktur paket, durasi, prompt visual, dan integritas teks. Penilaian kualitas visual/audio tetap memerlukan inspeksi MP4.",status:"QC struktur tersedia"},
 {title:"YouTube publishing",detail:"Video tidak dipublikasikan otomatis. Upload tetap manual dan memerlukan persetujuan owner.",status:"Manual • persetujuan owner"}
];
export default function Home(){
 return <main className="shell">
  <header className="top"><div className="brand"><div className="logo">L</div><div><strong>LERRY ANIMASI</strong><div className="muted" style={{fontSize:12}}>YouTube Shorts Production Studio</div></div></div><span className="pill">GRATIS DULU • YOUTUBE SAJA</span></header>
  <section className="hero"><span className="status">Studio produksi • Mesin produksi Shorts • 15-60 detik</span><h1>Mesin produksi Lerry</h1><p>Lo kirim cerita final buatan sendiri. Tim produksi mengubahnya menjadi storyboard, animasi kartun pendek 9:16, dan metadata. Cerita tidak ditulis AI. Video final tetap perlu persetujuan lo sebelum dipublikasikan.</p><a className="cta" href="https://www.youtube.com/@lerry_animasi" target="_blank" rel="noreferrer">Lihat channel YouTube ↗</a></section>
  <Studio/>
  <section className="grid">{modules.map(item=><article className="card" key={item.title}><span className="status">{item.status}</span><h2 style={{marginTop:14}}>{item.title}</h2><p>{item.detail}</p></article>)}</section>
  <footer className="footer">Lerry Animasi Studio • Produksi tidak mempublikasikan apa pun tanpa persetujuan owner.</footer>
 </main>;
}
