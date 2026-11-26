import { NextResponse } from "next/server";
import { getAgentRegistry } from "@/lib/agents/registry";

export const runtime = "nodejs";

export async function GET() {
  const agents = getAgentRegistry();
  const ready = agents.filter((agent) => agent.status === "ready").length;
  return NextResponse.json({
    ok: true,
    product: "LERRY ANIMASI",
    pipeline: ["orchestrator", "storyboard", "narrator", "visual", "video", "quality", "publishing"],
    summary: { total: agents.length, ready, optional: agents.filter((a) => a.status === "optional").length, blocked: agents.filter((a) => a.status === "blocked").length },
    agents
  }, { headers: { "Cache-Control": "no-store" } });
}
