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
  const hasYoutube = Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REDIRECT_URI && process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY);

  return [
    { id: "orchestrator", name: "Production Orchestrator", role: "Mengatur urutan agent dan status produksi", engine: "Lerry internal pipeline", status: "ready", detail: "Menggunakan alur internal agar produksi tetap berjalan tanpa server tambahan." },
    { id: "langflow", name: "Langflow Workflow Agent", role: "Editor visual untuk workflow dan eksperimen agent", engine: "Langflow", status: "optional", detail: hasLangflow ? "Konfigurasi ditemukan. Pemanggilan flow belum diimplementasikan; pipeline inti tetap berjalan internal." : "Opsional. Pipeline inti tidak bergantung pada server Langflow." },
    { id: "storyboard", name: "Storyboard Agent", role: "Membuat cerita, dialog, storyboard, dan metadata", engine: "Groq GPT-OSS 120B", status: hasGroq ? "ready" : "blocked", detail: hasGroq ? "Provider Groq terkonfigurasi." : "Tambahkan GROQ_API_KEY di hosting." },
    { id: "narrator", name: "Narrator Agent", role: "Membuat narasi Bahasa Indonesia per adegan", engine: "Edge TTS → Piper fallback", status: "ready", detail: "Dijalankan pada GitHub Actions saat render." },
    { id: "visual", name: "Visual Agent", role: "Mengubah arahan visual menjadi adegan animasi konsisten", engine: "Remotion scene compositions", status: "ready", detail: "Visual template/rig 2D; bukan generator footage AI." },
    { id: "video", name: "Video Agent", role: "Merender dan menggabungkan video vertikal", engine: "Remotion + FFmpeg", status: hasGithub ? "ready" : "blocked", detail: hasGithub ? "GitHub Actions token tersedia untuk dispatch render." : "Tambahkan GITHUB_ACTIONS_TOKEN dengan Actions read/write." },
    { id: "quality", name: "Quality Control Agent", role: "Memvalidasi storyboard dan file MP4", engine: "Deterministic TypeScript + ffprobe + FFmpeg", status: "ready", detail: "QC naskah sebelum render dan QC media setelah render." },
    { id: "publishing", name: "YouTube Publishing Agent", role: "Menyiapkan dan menerbitkan video setelah persetujuan owner", engine: "YouTube Data API v3", status: hasYoutube ? "ready" : "blocked", detail: hasYoutube ? "OAuth dan upload resumable tersedia; setiap unggahan tetap memerlukan persetujuan owner." : "Belum aktif: perlu OAuth Client ID, Client Secret, Redirect URI, dan encryption key.", approvalRequired: true }
  ];
}
