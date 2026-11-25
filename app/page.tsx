import Studio from "./studio";

const modules = [
 {title:"Produser produksi Gemini",detail:"Menerima cerita owner dan membaginya menjadi storyboard tanpa menulis ulang cerita.",status:"Gemini terhubung"},
 {title:"Storyboard & visual",detail:"Membuat adegan dan prompt visual konsisten.",status:"Paket pra-produksi"},
 {title:"Voice & subtitle",detail:"Menyiapkan dialog, narasi, dan subtitle.",status:"Naskah tersedia"},
 {title:"Render MP4 Shorts",detail:"Remotion merender video kartun vertikal 1080 × 1920, durasi 15-60 detik.",status:"Workflow GitHub tersedia"},
 {title:"Quality control",detail:"Memeriksa fakta, visual, audio, teks, dan hasil render.",status:"Checklist tersedia"},
 {title:"YouTube publishing",detail:"Mengirim video ke channel setelah persetujuan pemilik.",status:"Koneksi akun terdeteksi"}
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
