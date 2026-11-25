const modules = [
  { title: "Ide & naskah", detail: "Rancang ide Shorts, konflik komedi keluarga, dialog, dan hook 3 detik.", status: "Fondasi siap" },
  { title: "Karakter konsisten", detail: "Panduan karakter Lerry: anak ceria berambut hitam pendek dan kaus kuning. Ayah: kacamata bulat dan kaus hijau.", status: "Panduan awal" },
  { title: "Storyboard", detail: "Pecah naskah menjadi adegan, framing, ekspresi, gerakan, dan prompt visual.", status: "Tahap berikutnya" },
  { title: "Suara & subtitle", detail: "Siapkan narasi Bahasa Indonesia, timing dialog, dan subtitle per adegan.", status: "Tahap berikutnya" },
  { title: "Render video", detail: "Target format YouTube Shorts vertikal 9:16, 1080 × 1920.", status: "Belum terpasang" },
  { title: "Publikasi YouTube", detail: "Metadata, thumbnail, jadwal, dan pemeriksaan sebelum tayang.", status: "Perlu persetujuan" },
];

export default function Home() {
  return <main className="shell">
    <header className="top">
      <div className="brand"><div className="logo">L</div><div><strong>LERRY ANIMASI</strong><div className="muted" style={{fontSize:12}}>YouTube Shorts Production Studio</div></div></div>
      <span className="pill">MODE GRATIS • YouTube saja</span>
    </header>
    <section className="hero">
      <span className="status">Studio produksi • Fondasi awal</span>
      <h1>Mesin produksi Lerry</h1>
      <p>Ruang kerja untuk mengembangkan animasi komedi keluarga berbahasa Indonesia. Mulai dari ide dan naskah sampai video siap ditinjau. Tidak ada video yang dipublikasikan otomatis tanpa persetujuan pemilik channel.</p>
      <a className="cta" href="https://www.youtube.com/@lerry_animasi" target="_blank" rel="noreferrer">Lihat channel YouTube ↗</a>
    </section>
    <section className="grid">
      {modules.map((item) => <article className="card" key={item.title}>
        <span className="status">{item.status}</span>
        <h2 style={{marginTop:14}}>{item.title}</h2>
        <p>{item.detail}</p>
      </article>)}
    </section>
    <section className="card" style={{marginTop:16}}>
      <h2>Alur kerja produksi</h2>
      <ol className="steps">
        <li>Riset ide dan tren yang sesuai penonton keluarga.</li>
        <li>Tulis naskah, dialog, dan storyboard.</li>
        <li>Buat aset visual dengan karakter yang konsisten.</li>
        <li>Produksi suara, subtitle, musik berlisensi, dan render.</li>
        <li>Periksa hasil akhir, lalu minta persetujuan sebelum upload.</li>
      </ol>
    </section>
    <footer className="footer">Lerry Animasi Studio • Fondasi aplikasi. Integrasi AI, render, dan upload akan diaktifkan serta diuji bertahap.</footer>
  </main>;
}
