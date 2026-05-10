/**
 * Scraper routes — YouTube tag extraction.
 *
 * Strategy (in order):
 *  1. YouTube Data API v3 — reliable from any IP, requires YOUTUBE_API_KEY env var.
 *  2. HTML scrape fallback — works on residential IPs; may return 0 tags from VPS.
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ── Browser-like headers ──────────────────────────────────────────────────────
const YT_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
    "AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/124.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function parseTags(html: string): string[] {
  // YouTube embeds video keywords inside ytInitialData as "keywords":[...]
  const match = html.match(/"keywords"\s*:\s*(\[[^\]]*\])/);
  if (!match) return [];
  try {
    const raw: unknown = JSON.parse(match[1]);
    if (!Array.isArray(raw)) return [];
    return (raw as unknown[])
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim());
  } catch {
    return [];
  }
}

function parseTitle(html: string): string {
  const match = html.match(/"title"\s*:\s*"([^"]{5,300})"/);
  if (match) return match[1];
  const titleTag = html.match(/<title>(.+?)<\/title>/s);
  if (titleTag) return titleTag[1].replace(/ - YouTube$/, "").trim();
  return "";
}

// ── Strategy 1: YouTube Data API v3 ──────────────────────────────────────────

async function fetchViaDataApi(
  videoId: string,
  apiKey: string,
): Promise<{ title: string; tags: string[] } | null> {
  const url =
    `https://www.googleapis.com/youtube/v3/videos` +
    `?id=${encodeURIComponent(videoId)}&part=snippet&key=${encodeURIComponent(apiKey)}`;

  const resp = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!resp.ok) {
    console.error(`[scraper] YouTube Data API returned ${resp.status}`);
    return null;
  }

  const data = (await resp.json()) as {
    items?: Array<{ snippet?: { title?: string; tags?: string[] } }>;
  };

  const item = data.items?.[0];
  if (!item) return null; // video not found or private

  return {
    title: item.snippet?.title ?? "",
    tags: item.snippet?.tags ?? [],
  };
}

// ── Strategy 2: HTML scrape fallback ─────────────────────────────────────────

async function fetchViaHtmlScrape(
  videoId: string,
): Promise<{ title: string; tags: string[] } | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const resp = await fetch(watchUrl, {
    headers: YT_HEADERS,
    signal: AbortSignal.timeout(20_000),
  });

  if (resp.status === 404) return null;
  if (!resp.ok) return null;

  const html = await resp.text();
  return { title: parseTitle(html), tags: parseTags(html) };
}

// ── Route: GET /api/scraper/extract-tags?url=<youtube-url> ───────────────────

router.get("/scraper/extract-tags", async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url query parameter is required" });
  }

  // Security: only accept YouTube domains
  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i.test(url)) {
    return res.status(400).json({ error: "Only YouTube URLs are accepted." });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({
      error:
        "Could not parse a video ID from this URL. " +
        "Please paste the full YouTube link (e.g. https://www.youtube.com/watch?v=...).",
    });
  }

  try {
    // ── Path A: YouTube Data API v3 (preferred — works from any IP) ──────────
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      const result = await fetchViaDataApi(videoId, apiKey);
      if (result !== null) {
        return res.json({
          videoId,
          title: result.title,
          tags: result.tags,
          count: result.tags.length,
          source: "api",
        });
      }
      // null means video not found / private — surface that error
      return res.status(404).json({
        error: "Video not found. It may be private, deleted, or age-restricted.",
      });
    }

    // ── Path B: HTML scrape (fallback, residential IPs only) ─────────────────
    console.warn(
      "[scraper] YOUTUBE_API_KEY not set — falling back to HTML scrape. " +
        "This will return 0 tags on VPS/datacenter servers.",
    );

    const result = await fetchViaHtmlScrape(videoId);
    if (result === null) {
      return res.status(404).json({
        error: "Video not found. It may be private, deleted, or age-restricted.",
      });
    }

    return res.json({
      videoId,
      title: result.title,
      tags: result.tags,
      count: result.tags.length,
      source: "scrape",
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[scraper] extract-tags error:", msg);

    if (msg.includes("timeout") || msg.includes("abort")) {
      return res
        .status(504)
        .json({ error: "YouTube took too long to respond. Please try again." });
    }
    return res
      .status(502)
      .json({ error: "Could not reach YouTube. Please try again." });
  }
});

export default router;
