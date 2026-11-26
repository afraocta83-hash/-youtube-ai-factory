import Studio from "./studio";

const modules = [
 {title:"LLM produser Groq",detail:"GPT-OSS 120B menyusun storyboard dalam satu panggilan API dengan JSON schema ketat dan batas token. Satu GROQ_API_KEY di server.",status:"Menunggu GROQ_API_KEY"},
 {title:"Storyboard & visual",detail:"Membagi cerita owner menjadi 4-6 adegan, prompt visual, durasi, judul, deskripsi dan metadata. Teks cerita tetap terkunci.",status:"Satu panggilan LLM • QC otomatis"},
 {title:"Voice & subtitle",detail:"Edge TTS Bahasa Indonesia sebagai utama dan Piper offline sebagai fallback. Narasi dan subtitle wajib kutipan cerita.",status:"Mesin TTS lulus uji"},
 {title:"Render MP4 Shorts",detail:"Remotion dan GitHub Actions merender video vertikal H.264 1080 × 1920, 30 fps, durasi 15-60 detik.",status:"Showcase MP4 lulus QC"},
 {title:"Quality control",detail:"Kode memeriksa cerita, jumlah adegan, durasi, kutipan, audio, codec, resolusi, FPS dan decode. Tidak perlu panggilan AI kedua.",status:"Validasi deterministik"},
 {title:"Riwayat & keamanan owner",detail:"Login satu password owner. Maksimal 10 storyboard terakhir disimpan lokal di browser perangkat ini; tidak memakai database cloud.",status:"Tanpa Supabase"},
 {title:"YouTube publishing",detail:"Upload tetap manual agar owner menyetujui hasil video dan metadata sebelum dipublikasikan.",status:"Persetujuan owner"}
];
export default function Home(){
 return <main className="shell">
  <header className="top"><div className="brand"><div className="logo">L</div><div><strong>LERRY ANIMASI</strong><div className="muted" style={{fontSize:12}}>YouTube Shorts Production Studio</div></div></div><span className="pill">GRATIS DULU • YOUTUBE SAJA</span></header>
  <section className="hero"><span className="status">Studio produksi • Mesin produksi Shorts • 15-60 detik</span><h1>Mesin produksi Lerry</h1><p>Lo kirim cerita final buatan sendiri. Satu LLM menyusun storyboard; TTS, render, dan QC berjalan otomatis. Cerita tidak ditulis AI. Video final tetap perlu persetujuan lo sebelum dipublikasikan.</p><a className="cta" href="https://www.youtube.com/@lerry_animasi" target="_blank" rel="noreferrer">Lihat channel YouTube ↗</a></section>
  <Studio/>
  <section className="grid">{modules.map(item=><article className="card" key={item.title}><span className="status">{item.status}</span><h2 style={{marginTop:14}}>{item.title}</h2><p>{item.detail}</p></article>)}</section>
  <footer className="footer">Lerry Animasi Studio • Produksi tidak mempublikasikan apa pun tanpa persetujuan owner.</footer>
 </main>;
}
