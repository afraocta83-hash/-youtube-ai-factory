import { NextResponse } from "next/server";
import { OFFICE_WORKERS } from "../../../../lib/office-agents";

/**
 * Read-only roster endpoint for the future self-hosted 3D office.
 * This reports the real worker roles and runtimes, not fabricated live activity.
 */
export async function GET() {
  return NextResponse.json({
    project: "LERRY ANIMASI",
    officeEngine: "The Roving Office (Apache-2.0 source; self-host integration pending)",
    connected: false,
    status: "standby",
    workers: OFFICE_WORKERS,
    note: "Worker activity will change only after authenticated production events are connected. Current roster is descriptive, not a live session feed.",
  }, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
