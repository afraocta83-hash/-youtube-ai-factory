export type OfficeWorkerStatus = "standby" | "working" | "review" | "done" | "error";

export type OfficeWorker = {
  id: string;
  name: string;
  role: string;
  department: string;
  responsibility: string;
  runtime: string;
  status: OfficeWorkerStatus;
  connected: boolean;
};

/**
 * The office roster mirrors the production pipeline that actually exists.
 * Workers remain "standby" until real pipeline events are wired to the office.
 * Do not invent live activity or show a worker as connected merely because this
 * manifest exists.
 */
export const OFFICE_WORKERS: OfficeWorker[] = [
  {
    id: "producer",
    name: "Lerry",
    role: "AI Producer",
    department: "Creative",
    responsibility: "Turns the owner's idea into the story, storyboard and YouTube metadata.",
    runtime: "Groq GPT-OSS 120B",
    status: "standby",
    connected: false,
  },
  {
    id: "quality-control",
    name: "Nara",
    role: "Story & QC Reviewer",
    department: "Quality",
    responsibility: "Checks story structure, required scene fields, duration and visual prompts.",
    runtime: "Deterministic TypeScript checks",
    status: "standby",
    connected: false,
  },
  {
    id: "voice",
    name: "Ari",
    role: "Voice Artist",
    department: "Audio",
    responsibility: "Generates Indonesian narration and fits scene audio timing.",
    runtime: "Edge TTS with Piper fallback",
    status: "standby",
    connected: false,
  },
  {
    id: "animator",
    name: "Mika",
    role: "Animator",
    department: "Visual",
    responsibility: "Builds the vertical animation from scene direction and the current character rig.",
    runtime: "Remotion",
    status: "standby",
    connected: false,
  },
  {
    id: "render",
    name: "Bima",
    role: "Render & Media QA",
    department: "Production",
    responsibility: "Renders MP4 and checks codec, dimensions, frame rate, audio and full decode.",
    runtime: "GitHub Actions + FFmpeg",
    status: "standby",
    connected: false,
  },
];
