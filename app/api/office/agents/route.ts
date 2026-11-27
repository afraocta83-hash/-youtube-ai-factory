import { NextResponse } from "next/server";
import { getOfficeWorkers } from "../../../../lib/office-agents";

export const dynamic = "force-dynamic";

export async function GET() {
  const workers = getOfficeWorkers();
  return NextResponse.json({
    project: "LERRY ANIMASI",
    officeEngine: "Lerry Isometric Office",
    connected: workers.length > 0 && workers.every((worker) => worker.connectedToProject),
    activityFeedConnected: false,
    status: "standby",
    summary: {
      staff: workers.length,
      assigned: workers.filter((worker) => worker.connectedToProject).length,
      ready: workers.filter((worker) => worker.capability === "ready").length,
      optional: workers.filter((worker) => worker.capability === "optional").length,
      blocked: workers.filter((worker) => worker.capability === "blocked").length,
      active: workers.filter((worker) => worker.activity === "working").length,
    },
    workers,
    note: "Seluruh staff dipetakan ke tugas dan endpoint project yang sudah ada. Status aktivitas tetap standby sampai event produksi nyata dihubungkan; status kemampuan bukan status sedang bekerja.",
  }, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
