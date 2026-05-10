/**
 * Scraper routes — YouTube tag extraction runs directly in Node.js.
 * No Python service required. Uses fetch + regex on YouTube's page source.
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
  // Grab the first "title":"..." that looks like a real video title (5–300 chars)
  const match = html.match(/"title"\s*:\s*"([^"]{5,300})"/);
  if (match) return match[1];
  // Fallback: <title> tag
  const titleTag = html.match(/<title>(.+?)<\/title>/s);
  if (titleTag) return titleTag[1].replace(/ - YouTube$/, "").trim();
  return "";
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

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const resp = await fetch(watchUrl, {
      headers: YT_HEADERS,
      signal: AbortSignal.timeout(20_000),
    });

    if (resp.status === 404) {
      return res.status(404).json({
        error: "Video not found. It may be private, deleted, or age-restricted.",
      });
    }
    if (!resp.ok) {
      return res.status(502).json({
        error: `YouTube returned status ${resp.status}. Please try again.`,
      });
    }

    const html = await resp.text();
    const tags = parseTags(html);
    const title = parseTitle(html);

    return res.json({ videoId, title, tags, count: tags.length });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[scraper] extract-tags error:", msg);

    if (msg.includes("timeout") || msg.includes("abort")) {
      return res.status(504).json({ error: "YouTube took too long to respond. Please try again." });
    }
    return res.status(502).json({ error: "Could not reach YouTube. Please try again." });
  }
});

export default router;
