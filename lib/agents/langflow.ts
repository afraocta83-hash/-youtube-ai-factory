function findText(value: unknown, depth = 0): string | null {
  if (depth > 8 || value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("```json")) return trimmed;
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) { const found = findText(item, depth + 1); if (found) return found; }
    return null;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["text", "message", "output", "result", "content"]) {
      const found = findText(obj[key], depth + 1);
      if (found) return found;
    }
    for (const item of Object.values(obj)) { const found = findText(item, depth + 1); if (found) return found; }
  }
  return null;
}

export async function runLangflow(prompt: string): Promise<string> {
  const base = process.env.LANGFLOW_BASE_URL?.trim().replace(/\/$/, "");
  const flowId = process.env.LANGFLOW_FLOW_ID?.trim();
  if (!base || !flowId) throw new Error("Langflow belum dikonfigurasi.");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.LANGFLOW_API_KEY) headers["x-api-key"] = process.env.LANGFLOW_API_KEY;
  const response = await fetch(base + "/api/v1/run/" + encodeURIComponent(flowId) + "?stream=false", {
    method: "POST", headers,
    body: JSON.stringify({ input_value: prompt, input_type: "chat", output_type: "chat" }),
    cache: "no-store", signal: AbortSignal.timeout(55000)
  });
  const data: unknown = await response.json();
  if (!response.ok) throw new Error("Langflow menolak permintaan (" + response.status + ").");
  const text = findText(data);
  if (!text) throw new Error("Flow Langflow tidak mengembalikan output teks/JSON yang dapat dibaca.");
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return cleaned;
}
