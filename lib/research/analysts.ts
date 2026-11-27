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
  const blocks = html.match(/<div class="result[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi) || [];
  for (const block of blocks.slice(0, 8)) {
    const href = block.match(/class="result__a"[^>]*href="([^"]+)"/i)?.[1] || block.match(/href="([^"]+)"[^>]*class="result__a"/i)?.[1];
    const title = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/i)?.[1];
    const snippet = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || "";
    if (!href || !title) continue;
    let url = href.replace(/&amp;/g, "&");
    try { const parsed = new URL(url, "https://duckduckgo.com"); const redirected = parsed.searchParams.get("uddg"); if (redirected) url = redirected; } catch { continue; }
    try { const parsed = new URL(url); if (!["http:", "https:"].includes(parsed.protocol)) continue; results.push({ title: clean(title), url, snippet: clean(snippet), domain: parsed.hostname.replace(/^www\./, "") }); } catch { }
  }
  return results;
}

async function youtubeTrends(topic: string): Promise<{ videos: TrendVideo[]; mode: string; note: string }> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return { videos: [], mode: "web-discovery-only", note: "YOUTUBE_API_KEY belum dipasang. Tidak ada metrik video/views yang dikarang; hasil tren YouTube numerik akan aktif setelah API key gratis dikonfigurasi." };
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.search = new URLSearchParams({ part: "snippet", q: topic + " #shorts", type: "video", videoDuration: "short", order: "date", maxResults: "25", key }).toString();
  const searchResponse = await fetch(searchUrl, { signal: timeout(12000), cache: "no-store" });
  if (!searchResponse.ok) throw new Error("YouTube Data API search gagal: " + searchResponse.status);
  const searchData = await searchResponse.json();
  const ids = (searchData.items || []).map((x: any) => x.id?.videoId).filter(Boolean);
  if (!ids.length) return { videos: [], mode: "youtube-data-api", note: "Belum ada video yang cocok untuk topik ini." };
  const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  detailsUrl.search = new URLSearchParams({ part: "snippet,statistics,contentDetails", id: ids.join(","), key }).toString();
  const detailsResponse = await fetch(detailsUrl, { signal: timeout(12000), cache: "no-store" });
  if (!detailsResponse.ok) throw new Error("YouTube Data API videos gagal: " + detailsResponse.status);
  const details = await detailsResponse.json();
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
  return { videos: videos.slice(0, 15), mode: "youtube-data-api", note: "Metrik berasal dari YouTube Data API; views/day adalah estimasi sederhana dari total views dibagi umur video, bukan laju real-time." };
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
    verification.push({ claim, status: domains.size >= 2 ? "insufficient" : "insufficient", sources: sources.slice(0, 5), note: domains.size >= 2 ? "Ditemukan beberapa domain; isi sumber belum dibaca penuh. Perlu pemeriksaan manusia sebelum klaim dianggap benar." : "Bukti independen belum cukup. Jangan perlakukan klaim sebagai fakta terverifikasi." });
  }
  const opportunities = (trend.videos.length ? trend.videos.slice(0, 8).map(v => ({ title: v.title, score: v.score, rationale: ["Views/day: " + v.viewsPerDay.toLocaleString("id-ID"), "Channel: " + v.channel, "Durasi: " + v.durationSeconds + " detik"], evidenceCount: 1 })) : topicSources.slice(0, 8).map((s, i) => ({ title: s.title, score: Math.max(20, 65 - i * 5), rationale: ["Sinyal topik dari pencarian publik", "Belum tersedia metrik views/engagement YouTube"], evidenceCount: 1 })));
  return { topic, generatedAt: new Date().toISOString(), trend, verification, opportunities, limitations: ["Skor peluang adalah heuristik untuk membantu riset, bukan prediksi viral atau jaminan views.", "Tanpa YOUTUBE_API_KEY, laporan tidak menampilkan metrik views YouTube.", "Pemeriksaan klaim mengumpulkan kandidat sumber; belum membaca dan membandingkan isi penuh sehingga status tetap perlu review manusia.", "Riset tidak mengubah cerita final owner dan tidak memasukkan fakta baru ke storyboard secara otomatis."] };
}
