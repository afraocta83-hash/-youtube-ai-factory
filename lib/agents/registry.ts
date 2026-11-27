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
    { id: "trend-research", name: "Niko — Analis Tren", role: "Mencari topik Shorts yang sedang naik dan mengukur performa video", engine: "YouTube Data API + pencarian web publik", status: "ready", detail: hasYoutubeApi ? "Niko mencari video relevan, menghitung views per hari, dan membandingkan laju pertumbuhan." : "Niko menelusuri topik dan video publik. Metrik YouTube yang lebih lengkap memerlukan kunci API gratis." },
    { id: "data-verification", name: "Sinta — Pemeriksa Fakta", role: "Memeriksa klaim cerita dan mengumpulkan sumber pembanding", engine: "Pencarian web + pemeriksaan sumber", status: "ready", detail: "Sinta mencatat sumber kandidat, membandingkan bukti, dan menandai klaim yang belum cukup kuat." },
    { id: "viral-opportunity", name: "Dika — Analis Peluang Viral", role: "Menilai potensi topik berdasarkan tren, velocity, dan bukti riset", engine: "Penilaian berbasis sinyal data", status: "ready", detail: "Dika memberi skor peluang dan alasan penilaian. Skor bukan jaminan video akan viral." },
    { id: "narrator", name: "Maya — Pengarah Narasi", role: "Menyiapkan narasi Bahasa Indonesia untuk setiap adegan", engine: "Text-to-speech", status: "ready", detail: "Maya menyiapkan teks narasi per adegan agar siap dibacakan saat proses render." },
    { id: "visual", name: "Bimo — Perancang Visual", role: "Menerjemahkan arahan adegan menjadi komposisi animasi konsisten", engine: "Komposisi animasi 2D", status: "ready", detail: "Bimo menyusun tampilan dan gerakan karakter sesuai arahan visual pada storyboard." },
    { id: "video", name: "Raka — Editor Video", role: "Merender adegan menjadi video Shorts vertikal", engine: "Render video", status: hasGithub ? "ready" : "blocked", detail: hasGithub ? "Raka siap menjalankan render MP4 vertikal 1080 × 1920." : "Raka belum dapat memulai render. Konfigurasi akses workflow diperlukan." },
    { id: "quality", name: "Tara — Pemeriksa Kualitas", role: "Memeriksa naskah, audio, subtitle, dan hasil akhir MP4", engine: "Pemeriksaan otomatis media", status: "ready", detail: "Tara memeriksa struktur adegan, durasi, audio, codec, resolusi, FPS, dan hasil decode." },
    { id: "observability", name: "Oki — Pemantau Produksi", role: "Memantau proses agent, durasi, dan kegagalan produksi", engine: "Pemantauan proses", status: hasLangfuse ? "ready" : "optional", detail: hasLangfuse ? "Oki mencatat jejak proses produksi." : "Pemantauan lanjutan opsional; produksi utama tetap berjalan tanpa fitur ini." },
    { id: "publishing", name: "Lina — Penyiap Publikasi", role: "Menyiapkan MP4, thumbnail, judul, deskripsi, dan tag untuk owner", engine: "Paket publikasi manual", status: "ready", detail: "Lina menyiapkan paket upload. Owner tetap memeriksa dan mengunggah sendiri melalui YouTube Studio.", approvalRequired: true }
  ];
}
