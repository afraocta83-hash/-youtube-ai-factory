"use client";

export type OfficeActivity = "working" | "review" | "done" | "error" | "standby";
export type OfficeEvent = { workerIds: string[]; activity: OfficeActivity; message: string; at: string };

export function emitOfficeActivity(workerIds: string[], activity: OfficeActivity, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<OfficeEvent>("lerry:office-activity", {
    detail: { workerIds, activity, message, at: new Date().toISOString() },
  }));
}
