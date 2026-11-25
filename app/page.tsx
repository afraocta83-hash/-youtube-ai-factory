import Studio from "./studio";

const modules = [
 {title:"Produser & penulis AI",detail:"Menerima satu prompt dan mengembangkan paket cerita serta naskah.",status:"Gemini terhubung"},
 {title:"Storyboard & visual",detail:"Membuat adegan dan prompt visual konsisten.",status:"Paket pra-produksi"},
 {title:"Voice & subtitle",detail:"Menyiapkan dialog, narasi, dan subtitle.",status:"Naskah tersedia"},
 {title:"Render MP4",detail:"Merakit aset menjadi video vertikal 9:16.",status:"Belum aktif"},
 {title:"Quality control",detail:"Memeriksa fakta, visual, audio, teks, dan hasil render.",status:"Checklist tersedia"},
 {title:"YouTube publishing",detail:"Mengirim video ke channel setelah persetujuan pemilik.",status:"Koneksi akun terdeteksi"}
];
export default function Home(){
 return <main className="shell">
  <header className="top"><div className="brand"><div className="logo">L</div><div><strong>LERRY ANIMASI</strong><div className="muted" style={{fontSize:12}}>YouTube Shorts Production Studio</div></div></div><span className="pill">GRATIS DULU • YOUTUBE SAJA</span></header>
  <section className="hero"><span className="status">Studio produksi • Tahap aktivasi AI</span><h1>Mesin produksi Lerry</h1><p>Lo cukup kasih satu topik. Tim AI mengembangkan naskah, storyboard, arahan visual, dan metadata. Video final tetap perlu persetujuan lo sebelum dipublikasikan.</p><a className="cta" href="https://www.youtube.com/@lerry_animasi" target="_blank" rel="noreferrer">Lihat channel YouTube ↗</a></section>
  <Studio/>
  <section className="grid">{modules.map(item=><article className="card" key={item.title}><span className="status">{item.status}</span><h2 style={{marginTop:14}}>{item.title}</h2><p>{item.detail}</p></article>)}</section>
  <footer className="footer">Lerry Animasi Studio • Produksi tidak mempublikasikan apa pun tanpa persetujuan owner.</footer>
 </main>;
}
