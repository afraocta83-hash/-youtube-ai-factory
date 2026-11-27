export type AgentStatus = "ready" | "optional" | "blocked";

export type AgentInfo = {
  id: string;
  name: string;
  role: string;
  engine: string;
  status: AgentStatus;
  detail: string;
  approvalRequired?: boolean;
};

/**
 * Single source of truth for the Lerry production team.
 * Secrets are never returned; only configuration presence is exposed.
 */
export function getAgentRegistry(): AgentInfo[] {
  const hasGroq = Boolean(process.env.GROQ_API_KEY || process.env.GROQ_API_KEY2 || process.env.GROQ_API_KEY3);
  const hasGithub = Boolean(process.env.GITHUB_ACTIONS_TOKEN);
  const hasLangflow = Boolean(process.env.LANGFLOW_BASE_URL && process.env.LANGFLOW_FLOW_ID);
  const hasLangfuse = Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
  const hasYoutubeApi = Boolean(process.env.YOUTUBE_API_KEY);

  return [
    { id: "trend-research", name: "Niko — Analis Tren", role: "Mencari topik Shorts yang sedang naik dan mengukur performa video", engine: "YouTube Data API + pencarian web publik", status: hasYoutubeApi ? "ready" : "optional", detail: hasYoutubeApi ? "Niko mencari video relevan, menghitung views per hari, dan membandingkan laju pertumbuhan. Views/day adalah estimasi total views dibagi umur video." : "Pencarian topik publik tersedia, tetapi metrik YouTube (views, views/hari, durasi) belum aktif tanpa YOUTUBE_API_KEY." },
    { id: "data-verification", name: "Sinta — Pemeriksa Fakta", role: "Memeriksa klaim cerita dan mengumpulkan sumber pembanding", engine: "Pencarian web + pemeriksaan sumber", status: hasGroq ? "ready" : "optional", detail: hasGroq ? "Sinta mengelompokkan kandidat sumber dari cuplikan pencarian. Status tetap sementara sampai isi halaman sumber dibaca dan diperiksa manusia." : "Sinta dapat mengumpulkan kandidat sumber, tetapi penilaian klaim berbantuan AI belum aktif tanpa Groq; hasil tidak boleh dianggap fakta terverifikasi." },
    { id: "viral-opportunity", name: "Dika — Analis Peluang Viral", role: "Menilai potensi topik berdasarkan tren, velocity, dan bukti riset", engine: "Penilaian berbasis sinyal data", status: hasYoutubeApi ? "ready" : "optional", detail: hasYoutubeApi ? "Dika memberi skor heuristik dari estimasi views/hari dan bukti video. Skor bukan jaminan video akan viral." : "Dika baru memberi sinyal dari hasil pencarian publik; skor peluang berbasis views/hari belum tersedia tanpa YOUTUBE_API_KEY." },
    { id: "narrator", name: "Maya — Pengarah Narasi", role: "Menyiapkan narasi Bahasa Indonesia untuk setiap adegan", engine: "Edge TTS / Piper TTS", status: "ready", detail: "Maya menyiapkan teks narasi per adegan. Audio aktual dibuat saat workflow render berjalan; Edge TTS memakai Piper sebagai fallback." },
    { id: "visual", name: "Bimo — Perancang Visual", role: "Menerjemahkan arahan adegan menjadi komposisi animasi konsisten", engine: "Remotion SVG / animasi 2D", status: "ready", detail: "Bimo membuat komposisi latar vektor dan menggerakkan karakter 2D Lerry. Gambar AI khusus per adegan dan animasi 3D belum tersedia." },
    { id: "video", name: "Raka — Editor Video", role: "Merender adegan menjadi video Shorts vertikal", engine: "GitHub Actions + Remotion + FFmpeg", status: hasGithub ? "ready" : "blocked", detail: hasGithub ? "Token GitHub tersedia di konfigurasi. Izin Actions dan dispatch aktual baru terbukti setelah render owner berhasil dijalankan." : "Raka belum dapat memulai render. Konfigurasi akses workflow diperlukan." },
    { id: "quality", name: "Tara — Pemeriksa Kualitas", role: "Memeriksa naskah, audio, subtitle, dan hasil akhir MP4", engine: "Pemeriksaan struktur + FFmpeg", status: "ready", detail: "Tara memeriksa struktur storyboard dan QC teknis MP4. Fakta, sinkronisasi subtitle kata-per-kata, dan penilaian artistik tetap memerlukan review." },
    { id: "observability", name: "Oki — Pemantau Produksi", role: "Memantau proses agent, durasi, dan kegagalan produksi", engine: "OpenTelemetry / Langfuse", status: hasLangfuse ? "ready" : "optional", detail: hasLangfuse ? "Oki merekam trace jika konfigurasi Langfuse valid." : "Trace Langfuse belum dikonfigurasi; status aktivitas staf live juga belum dihubungkan ke kantor." },
    { id: "publishing", name: "Lina — Penyiap Publikasi", role: "Menyiapkan MP4, thumbnail, judul, deskripsi, dan tag untuk owner", engine: "Paket publikasi manual", status: "ready", detail: "Lina menyiapkan paket upload. Thumbnail saat ini diambil dari frame pertama video; owner tetap memeriksa dan mengunggah sendiri melalui YouTube Studio.", approvalRequired: true }
  ];
}
