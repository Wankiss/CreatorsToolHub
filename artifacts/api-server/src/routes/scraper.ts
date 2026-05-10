/**
 * Scraper proxy routes — forward requests to the Python browser-agent service.
 * The browser-agent runs on port 8001 (configurable via BROWSER_AGENT_URL).
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

const BROWSER_AGENT = process.env.BROWSER_AGENT_URL ?? "http://localhost:8001";

// GET /api/scraper/extract-tags?url=<youtube-url>
router.get("/scraper/extract-tags", async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url query parameter is required" });
  }

  try {
    const upstream = await fetch(
      `${BROWSER_AGENT}/extract-tags?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(25_000) }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json(data);
    }

    return res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[scraper] extract-tags error:", message);
    return res.status(502).json({
      error: "The tag extraction service is temporarily unavailable. Please try again in a moment.",
    });
  }
});

export default router;
