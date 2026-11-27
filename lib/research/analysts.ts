export type ResearchSource = { title: string; url: string; snippet: string; domain: string };
export type TrendVideo = { title: string; url: string; channel: string; publishedAt: string; views: number; viewsPerDay: number; durationSeconds: number; score: number };
export type ClaimCheck = { claim: string; status: "supported" | "conflicting" | "insufficient"; sources: ResearchSource[]; note: string };
export type ResearchReport = { topic: string; generatedAt: string; trend: { mode: string; videos: TrendVideo[]; note: string }; verification: ClaimCheck[]; opportunities: { title: string; score: number; rationale: string[]; evidenceCount: number }[]; limitations: string[] };

const timeout = (ms: number) => AbortSignal.timeout(ms);
const clean = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();

async function searchWeb(query: string): Promise<ResearchSource[]> {
  const response = await fetch("https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query), { headers: { "User-Agent": "Mozilla/5.0 (compatible; LerryResearch/1.0)" }, signal: timeout(12000), cache: "no-store" });
  if (!response.ok) throw new Error("Pencarian web tidak tersedia (" + response.status + ")");
  const html = await response.text();
  const results: ResearchSource[] = [];
  for (const match of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = match[1];
    if (!/class=["'][^"']*result__a/i.test(attrs)) continue;
    const href = attrs.match(/href=["']([^"']+)["']/i)?.[1];
    const title = match[2];
    if (!href || !title) continue;
    let url = href.replace(/&amp;/g, "&");
    try { const parsed = new URL(url, "https://duckduckgo.com"); const redirected = parsed.searchParams.get("uddg"); if (redirected) url = redirected; } catch { continue; }
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) continue;
      const tail = html.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 1600);
      const snippet = tail.match(/class=["'][^"']*result__snippet[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || "";
      results.push({ title: clean(title), url, snippet: clean(snippet), domain: parsed.hostname.replace(/^www\./, "") });
      if (results.length >= 8) break;
    } catch { }
  }
  return results;
}

function youtubeErrorMessage(payload: any, status: number): string {
  const reason = String(payload?.error?.errors?.[0]?.reason || "");
  if (status === 400 || status === 401 || reason === "keyInvalid") return "YOUTUBE_API_KEY tidak valid. Periksa kembali key di Vercel.";
  if (reason === "accessNotConfigured" || reason === "serviceDisabled") return "YouTube Data API v3 belum diaktifkan pada Google Cloud project pemilik API key.";
  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") return "Kuota harian YouTube Data API habis. Kuota akan pulih sesuai reset harian Google.";
  if (status === 403) return "Google menolak akses YouTube Data API. Periksa pembatasan API key dan pastikan YouTube Data API v3 diizinkan.";
  return "YouTube Data API gagal (" + status + "). " + String(payload?.error?.message || "Periksa konfigurasi Google Cloud.");
}

async function youtubeTrends(topic: string): Promise<{ videos: TrendVideo[]; mode: string; note: string }> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return { videos: [], mode: "web-discovery-only", note: "YOUTUBE_API_KEY belum dipasang di Vercel. Hasil riset belum memiliki metrik views YouTube." };
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.search = new URLSearchParams({ part: "snippet", q: topic + " #shorts", type: "video", videoDuration: "short", order: "date", regionCode: "ID", relevanceLanguage: "id", maxResults: "50", key }).toString();
  const searchResponse = await fetch(searchUrl, { signal: timeout(12000), cache: "no-store" });
  const searchData = await searchResponse.json();
  if (!searchResponse.ok) throw new Error(youtubeErrorMessage(searchData, searchResponse.status));
  const ids = (searchData.items || []).map((x: any) => x.id?.videoId).filter(Boolean);
  if (!ids.length) return { videos: [], mode: "youtube-data-api", note: "API aktif, tetapi belum menemukan video Shorts yang cocok untuk topik ini." };
  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailsUrl.search = new URLSearchParams({ part: "snippet,statistics,contentDetails", id: ids.join(","), key }).toString();
  const detailsResponse = await fetch(detailsUrl, { signal: timeout(12000), cache: "no-store" });
  const details = await detailsResponse.json();
  if (!detailsResponse.ok) throw new Error(youtubeErrorMessage(details, detailsResponse.status));
  const now = Date.now();
  const videos: TrendVideo[] = (details.items || []).map((v: any) => {
    const published = Date.parse(v.snippet?.publishedAt || "");
    const ageDays = Math.max(1, (now - (Number.isFinite(published) ? published : now)) / 86400000);
    const views = Number(v.statistics?.viewCount || 0);
    const duration = String(v.contentDetails?.duration || "").match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const durationSeconds = duration ? Number(duration[1] || 0) * 3600 + Number(duration[2] || 0) * 60 + Number(duration[3] || 0) : 0;
    const viewsPerDay = Math.round(views / ageDays);
    return { title: v.snippet?.title || "", url: "https://www.youtube.com/watch?v=" + v.id, channel: v.snippet?.channelTitle || "", publishedAt: v.snippet?.publishedAt || "", views, viewsPerDay, durationSeconds, score: 0 };
  }).filter((v: TrendVideo) => v.durationSeconds <= 60 && v.durationSeconds >= 1);
  const maxVelocity = Math.max(1, ...videos.map(v => v.viewsPerDay));
  videos.forEach(v => { v.score = Math.round(100 * v.viewsPerDay / maxVelocity); });
  videos.sort((a, b) => b.viewsPerDay - a.viewsPerDay);
  return { videos: videos.slice(0, 20), mode: "youtube-data-api-v3", note: "Data diambil dari YouTube Data API v3 untuk wilayah Indonesia. Views/hari adalah estimasi total views dibagi umur video (minimal 1 hari), bukan pertumbuhan real-time. Hasil dibatasi video berdurasi maksimal 60 detik." };
}

async function assessClaimsWithGroq(checks: ClaimCheck[]): Promise<ClaimCheck[]> {
  if (!checks.length) return checks;
  const keys = [...new Set([process.env.GROQ_API_KEY, process.env.GROQ_API_KEY2, process.env.GROQ_API_KEY3].map(x => x?.trim()).filter((x): x is string => Boolean(x)))];
  if (!keys.length) return checks;
  const prompt = {
    task: "Nilai apakah cuplikan sumber secara langsung mendukung atau membantah klaim. Jangan gunakan pengetahuan luar. Snippet bukan bukti final.",
    rules: ["supported hanya jika minimal dua domain independen memberi dukungan langsung dan konsisten.", "conflicting hanya jika minimal dua domain independen menunjukkan pertentangan langsung.", "Selain itu insufficient.", "Jangan menyimpulkan dari judul saja.", "Kembalikan JSON {checks:[{index,status,note}]}."],
    checks: checks.map((c, index) => ({ index, claim: c.claim, sources: c.sources.map(s => ({ domain: s.domain, title: s.title, snippet: s.snippet })) }))
  };
  for (const key of keys) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", messages: [{ role: "user", content: JSON.stringify(prompt) }], response_format: { type: "json_object" }, temperature: 0, max_completion_tokens: 1000 }), signal: timeout(15000), cache: "no-store" });
      if (!response.ok) continue;
      const data = await response.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      if (!Array.isArray(parsed.checks)) continue;
      return checks.map((check, index) => {
        const item = parsed.checks.find((x: any) => Number(x.index) === index);
        const domains = new Set(check.sources.map(s => s.domain));
        const status = domains.size < 2 ? "insufficient" : ["supported", "conflicting", "insufficient"].includes(item?.status) ? item.status : "insufficient";
        return { ...check, status, note: (typeof item?.note === "string" ? item.note : check.note) + " Penilaian AI hanya berdasarkan cuplikan pencarian; pemeriksaan halaman penuh tetap diperlukan." };
      });
    } catch { }
  }
  return checks;
}

export async function buildResearchReport(topic: string, claims: string[]): Promise<ResearchReport> {
  const [trend, topicSources] = await Promise.all([
    youtubeTrends(topic).catch(error => ({ videos: [] as TrendVideo[], mode: "unavailable", note: error instanceof Error ? error.message : "YouTube API tidak tersedia." })),
    searchWeb(topic + " YouTube Shorts trend Indonesia").catch(() => [] as ResearchSource[])
  ]);
  const verification: ClaimCheck[] = [];
  for (const claim of claims.slice(0, 5)) {
    const sources = await searchWeb(claim).catch(() => [] as ResearchSource[]);
    const domains = new Set(sources.map(s => s.domain));
    verification.push({ claim, status: "insufficient", sources: sources.slice(0, 5), note: domains.size >= 2 ? "Ditemukan beberapa domain; isi sumber belum dibaca penuh. Perlu pemeriksaan manusia sebelum klaim dianggap benar." : "Bukti independen belum cukup. Jangan perlakukan klaim sebagai fakta terverifikasi." });
  }
  const assessedVerification = await assessClaimsWithGroq(verification);
  const opportunities = (trend.videos.length ? trend.videos.slice(0, 8).map(v => ({ title: v.title, score: v.score, rationale: ["Views/day: " + v.viewsPerDay.toLocaleString("id-ID"), "Channel: " + v.channel, "Durasi: " + v.durationSeconds + " detik"], evidenceCount: 1 })) : topicSources.slice(0, 8).map((s, i) => ({ title: s.title, score: Math.max(20, 65 - i * 5), rationale: ["Sinyal topik dari pencarian publik", "Belum tersedia metrik views/engagement YouTube"], evidenceCount: 1 })));
  return { topic, generatedAt: new Date().toISOString(), trend, verification: assessedVerification, opportunities, limitations: ["Skor peluang adalah heuristik untuk membantu riset, bukan prediksi viral atau jaminan views.", "Views/hari dihitung dari total views dibagi umur video; bukan data pertumbuhan real-time.", "Pemeriksaan klaim mengumpulkan kandidat sumber dan cuplikan; isi sumber belum dibaca penuh sehingga status perlu review manusia.", "Riset tidak mengubah cerita final dan tidak memasukkan fakta baru ke storyboard secara otomatis."] };
}
