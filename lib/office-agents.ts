import { getAgentRegistry } from "@/lib/agents/registry";

export type OfficeActivity = "standby" | "working" | "review" | "done" | "error";

export type OfficeWorker = {
  id: string;
  name: string;
  role: string;
  department: string;
  responsibility: string;
  runtime: string;
  taskRoute: string;
  capability: "ready" | "optional" | "blocked";
  activity: OfficeActivity;
  connectedToProject: boolean;
  liveActivity: boolean;
};

const ASSIGNMENTS: Record<string, { department: string; responsibility: string; taskRoute: string }> = {
  "trend-research": { department: "Riset", responsibility: "Mencari topik Shorts yang sedang naik, membandingkan video dan menghitung laju views per hari.", taskRoute: "POST /api/research" },
  "data-verification": { department: "Riset & Fakta", responsibility: "Memeriksa klaim cerita, membandingkan sumber, dan menandai bukti yang belum cukup.", taskRoute: "POST /api/research" },
  "viral-opportunity": { department: "Strategi", responsibility: "Memberi skor peluang topik berdasarkan tren, velocity, dan bukti riset.", taskRoute: "POST /api/research" },
  narrator: { department: "Audio", responsibility: "Menyiapkan narasi Bahasa Indonesia per adegan untuk TTS dan sinkronisasi subtitle.", taskRoute: "POST /api/produce → GitHub Actions TTS" },
  visual: { department: "Visual", responsibility: "Menerjemahkan storyboard menjadi komposisi, latar, dan gerakan karakter animasi 2D.", taskRoute: "POST /api/produce → Remotion" },
  video: { department: "Produksi", responsibility: "Mengirim pekerjaan render Shorts vertikal dan menghasilkan paket MP4.", taskRoute: "POST /api/render → render-short.yml" },
  quality: { department: "Quality Control", responsibility: "Memeriksa storyboard sebelum render serta codec, resolusi, FPS, audio, durasi dan decode MP4.", taskRoute: "POST /api/quality-check → FFmpeg QA" },
  observability: { department: "Monitoring", responsibility: "Mencatat jejak tahap produksi dan kegagalan melalui OpenTelemetry/Langfuse bila dikonfigurasi.", taskRoute: "instrumentation.ts → lib/agents/telemetry.ts" },
  publishing: { department: "Publikasi", responsibility: "Menyiapkan judul, deskripsi, hashtag, thumbnail dan paket upload untuk diperiksa owner.", taskRoute: "Metadata produksi → paket artefak" },
};

/** One roster, derived from the production registry. Activity stays standby until real run events are connected. */
export function getOfficeWorkers(): OfficeWorker[] {
  return getAgentRegistry().flatMap((agent) => {
    const assignment = ASSIGNMENTS[agent.id];
    if (!assignment) return [];
    return [{
      id: agent.id,
      name: agent.name,
      role: agent.role,
      department: assignment.department,
      responsibility: assignment.responsibility,
      runtime: agent.engine,
      taskRoute: assignment.taskRoute,
      capability: agent.status,
      activity: "standby" as const,
      connectedToProject: true,
      liveActivity: false,
    }];
  });
}
