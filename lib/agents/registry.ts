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
  const hasLangfuse = Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);\n  const hasYoutubeApi = Boolean(process.env.YOUTUBE_API_KEY);

  return [
    { id: "orchestrator", name: "Production Orchestrator", role: "Mengatur urutan agent dan status produksi", engine: "Lerry internal pipeline", status: "ready", detail: "Menggunakan alur internal agar produksi tetap berjalan tanpa server tambahan." },
    { id: "langflow", name: "Langflow Workflow Agent", role: "Editor visual untuk workflow dan eksperimen agent", engine: "Langflow", status: hasLangflow ? "ready" : "optional", detail: hasLangflow ? "Flow Langflow aktif sebagai provider storyboard utama; Groq menjadi fallback jika dikonfigurasi." : "Opsional. Pipeline inti memakai Groq dan tetap berjalan tanpa server Langflow." },
    { id: "storyboard", name: "Storyboard Agent", role: "Membuat cerita, dialog, storyboard, dan metadata", engine: "Groq GPT-OSS 120B", status: hasGroq ? "ready" : "blocked", detail: hasGroq ? "Provider Groq terkonfigurasi." : "Tambahkan GROQ_API_KEY di hosting." },\n    { id: "trend-research", name: "Trend Research Analyst", role: "Mengumpulkan Shorts relevan dan menghitung views/day", engine: "YouTube Data API v3 (gratis) + public web search", status: "ready", detail: hasYoutubeApi ? "YouTube API aktif; metrik video dan velocity tersedia." : "Riset topik publik aktif; metrik views YouTube memerlukan YOUTUBE_API_KEY gratis." },\n    { id: "data-verification", name: "Data Verification Analyst", role: "Mencari sumber kandidat untuk klaim dan menandai bukti yang belum cukup", engine: "DuckDuckGo HTML search + human review", status: "ready", detail: "Mengumpulkan sumber kandidat; tidak menyatakan fakta terverifikasi tanpa pemeriksaan isi sumber." },\n    { id: "viral-opportunity", name: "Viral Opportunity Analyst", role: "Merangking peluang berdasarkan sinyal tren dan kecepatan views", engine: "Deterministic scoring + research evidence", status: "ready", detail: "Skor heuristik transparan; bukan prediksi viral atau jaminan views." },
    { id: "narrator", name: "Narrator Agent", role: "Membuat narasi Bahasa Indonesia per adegan", engine: "Edge TTS → Piper fallback", status: "ready", detail: "Dijalankan pada GitHub Actions saat render." },
    { id: "visual", name: "Visual Agent", role: "Mengubah arahan visual menjadi adegan animasi konsisten", engine: "Remotion scene compositions", status: "ready", detail: "Visual template/rig 2D; bukan generator footage AI." },
    { id: "video", name: "Video Agent", role: "Merender dan menggabungkan video vertikal", engine: "Remotion + FFmpeg", status: hasGithub ? "ready" : "blocked", detail: hasGithub ? "GitHub Actions token tersedia untuk dispatch render." : "Tambahkan GITHUB_ACTIONS_TOKEN dengan Actions read/write." },
    { id: "quality", name: "Quality Control Agent", role: "Memvalidasi storyboard dan file MP4", engine: "Deterministic TypeScript + ffprobe + FFmpeg", status: "ready", detail: "QC naskah sebelum render dan QC media setelah render." },
    { id: "observability", name: "Agent Observability", role: "Melacak durasi, error, dan alur agent", engine: "Langfuse + OpenTelemetry", status: hasLangfuse ? "ready" : "optional", detail: hasLangfuse ? "Tracing aktif untuk storyboard dan quality-control agent." : "Opsional. Tambahkan LANGFUSE_PUBLIC_KEY dan LANGFUSE_SECRET_KEY untuk melihat trace agent." },
    { id: "publishing", name: "Manual YouTube Upload", role: "Menyiapkan paket untuk diunggah owner", engine: "YouTube Studio (manual)", status: "ready", detail: "Lerry menyiapkan MP4, thumbnail, dan metadata. Owner mengunggah sendiri; tidak ada OAuth atau upload otomatis." }
  ];
}
