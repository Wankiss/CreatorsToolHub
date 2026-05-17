import express, { type Express } from "express";
import compression from "compression";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";
import { fetchFromObjectStorage } from "./routes/upload.js";
import { db, toolsTable, categoriesTable, blogPostsTable } from "@workspace/db";
import { eq, inArray, sql } from "drizzle-orm";
import { resolvePageMeta, buildHtml } from "./meta-injector";

// ── Startup warmup ────────────────────────────────────────────────────────────
// Runs in the background immediately on server start. Goals:
//   1. Establish a live DB connection before the first real request arrives,
//      eliminating the TCP+TLS+Postgres-auth cold-start penalty (~100–300 ms).
//   2. Pre-populate the in-memory page-meta cache for the highest-traffic pages
//      (homepage, blog list) so they always hit cache on the first real request.
(async () => {
  try {
    // Warm the connection pool with a trivial query
    await db.execute(sql`SELECT 1`);
    // Pre-warm the highest-traffic SSR pages into the meta cache
    await Promise.all([
      resolvePageMeta("/"),
      resolvePageMeta("/blog"),
    ]);
    console.log("[warmup] DB pool and page-meta cache ready");
  } catch (err) {
    console.warn("[warmup] non-fatal warmup error:", err);
  }
})();

const app: Express = express();

// ── Trust Cloudflare's proxy headers ─────────────────────────────────────────
// Cloudflare sits between users and the origin. Without this, req.ip returns
// Cloudflare's edge IP instead of the real client IP. '1' means trust the
// first forwarding hop (Cloudflare edge → origin).
app.set("trust proxy", 1);

// ── Gzip compression for all responses ───────────────────────────────────────
// Cloudflare automatically re-compresses to Brotli when serving to browsers.
// Our gzip handles the origin→Cloudflare leg.
app.use(compression());

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── www → non-www canonical redirect (must be first) ─────────────────────────
app.use((req, res, next) => {
  if (req.hostname === "www.creatorstoolhub.com") {
    return res.redirect(301, `https://creatorstoolhub.com${req.originalUrl}`);
  }
  next();
});

// ── Security headers ──────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://partner.googleadservices.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.openai.com https://www.google-analytics.com",
      "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
      "upgrade-insecure-requests",
    ].join("; ")
  );
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images — local disk first, Object Storage fallback on miss.
// This means images survive Replit redeploys: the local file is gone but the
// Object Storage copy is fetched, served, and re-cached locally for next time.
app.get("/api/uploads/:filename", async (req, res) => {
  const filename = req.params.filename;
  // Strip any path traversal attempts
  const safeName = path.basename(filename);
  const localPath = path.join(UPLOADS_DIR, safeName);

  // 1. Local disk hit (normal case after upload or after first Object Storage fetch)
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath, {
      headers: { "Cache-Control": "public, max-age=604800" },
    });
  }

  // 2. Local miss — try Object Storage (happens after a redeploy wipes disk)
  try {
    const obj = await fetchFromObjectStorage(safeName);
    if (obj) {
      // Re-cache locally so subsequent requests skip Object Storage
      fs.writeFileSync(localPath, obj.buffer);
      res.setHeader("Content-Type", obj.contentType);
      res.setHeader("Cache-Control", "public, max-age=604800");
      return res.send(obj.buffer);
    }
  } catch (err) {
    console.error("[uploads] fallback fetch error:", err);
  }

  // 3. Not found anywhere
  return res.status(404).json({ error: "Image not found" });
});

app.use("/api", router);

// ── robots.txt ───────────────────────────────────────────────────────────────
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
`# creatorstoolhub.com — AI crawlers explicitly permitted
# Content-Signal: ai-input=yes (RAG/grounding/AI search answers permitted)
# Content-Signal: ai-train=no  (training/fine-tuning NOT permitted)
# Content-Signal: search=yes   (search indexing permitted)

User-agent: *
Content-Signal: search=yes,ai-input=yes,ai-train=no
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

Sitemap: https://creatorstoolhub.com/sitemap.xml`
  );
});

// ── IndexNow key file ─────────────────────────────────────────────────────────
// Bing, Yandex, and other IndexNow-compatible engines verify ownership by
// fetching this file. The same key is used when submitting URLs via the API.
app.get("/86809e8949cc48479bcd6c89b8fe5b3f.txt", (_req, res) => {
  res.type("text/plain").send("86809e8949cc48479bcd6c89b8fe5b3f");
});

// ── llms.txt ─────────────────────────────────────────────────────────────────
app.get("/llms.txt", (_req, res) => {
  res.type("text/plain").send(
`# creatorsToolHub

> creatorsToolHub is a free platform offering 35+ AI-powered tools for YouTube, TikTok, and Instagram content creators, built by Nnaemeka Immanuels. All tools are completely free — no signup required.

## Tools

- [YouTube Title Generator](https://creatorstoolhub.com/tools/youtube-title-generator): Generate SEO-optimized, high-CTR YouTube titles using 7 proven viral frameworks.
- [YouTube Tag Generator](https://creatorstoolhub.com/tools/youtube-tag-generator): Generate SEO tags for YouTube videos instantly. Free and unlimited.
- [YouTube Script Generator](https://creatorstoolhub.com/tools/youtube-script-generator): Generate full YouTube video scripts with hook, body, and CTA.
- [YouTube Hashtag Generator](https://creatorstoolhub.com/tools/youtube-hashtag-generator): Generate tiered hashtags for YouTube videos and Shorts.
- [YouTube Description Generator](https://creatorstoolhub.com/tools/youtube-description-generator): Create keyword-rich YouTube video descriptions with chapters and CTAs.
- [YouTube Keyword Generator](https://creatorstoolhub.com/tools/youtube-keyword-generator): Find high-volume YouTube keywords for any niche or topic.
- [YouTube Money Calculator](https://creatorstoolhub.com/tools/youtube-money-calculator): Estimate YouTube channel earnings based on views, niche, and CPM.
- [YouTube Video Idea Generator](https://creatorstoolhub.com/tools/youtube-video-idea-generator): Generate viral YouTube video ideas for any niche.
- [YouTube Channel Name Generator](https://creatorstoolhub.com/tools/youtube-channel-name-generator): Generate unique, brandable YouTube channel name ideas.
- [YouTube Title Analyzer](https://creatorstoolhub.com/tools/youtube-title-analyzer): Analyze and score your YouTube title for SEO and click-through rate.
- [YouTube SEO Score Checker](https://creatorstoolhub.com/tools/youtube-seo-score-checker): Check and score your YouTube video's SEO optimization.
- [YouTube Shorts Revenue Calculator](https://creatorstoolhub.com/tools/youtube-shorts-revenue-calculator): Estimate YouTube Shorts earnings based on views and RPM.
- [YouTube CPM Calculator](https://creatorstoolhub.com/tools/youtube-cpm-calculator): Calculate YouTube CPM and estimated ad revenue.
- [YouTube Engagement Calculator](https://creatorstoolhub.com/tools/youtube-engagement-calculator): Calculate your YouTube channel's engagement rate.
- [YouTube Thumbnail Downloader](https://creatorstoolhub.com/tools/youtube-thumbnail-downloader): Download YouTube video thumbnails in high resolution for free.
- [TikTok Hook Generator](https://creatorstoolhub.com/tools/tiktok-hook-generator): Generate scroll-stopping TikTok opening lines for any niche.
- [TikTok Script Generator](https://creatorstoolhub.com/tools/tiktok-script-generator): Create short-form TikTok video scripts optimized for completion rate.
- [TikTok Viral Idea Generator](https://creatorstoolhub.com/tools/tiktok-viral-idea-generator): Generate niche-specific TikTok content ideas with hooks and hashtags.
- [TikTok Caption Generator](https://creatorstoolhub.com/tools/tiktok-caption-generator): Generate engaging TikTok captions with relevant hashtags.
- [TikTok Hashtag Generator](https://creatorstoolhub.com/tools/tiktok-hashtag-generator): Generate trending TikTok hashtags to maximize reach and views.
- [TikTok Money Calculator](https://creatorstoolhub.com/tools/tiktok-money-calculator): Estimate TikTok earnings based on views and engagement rate.
- [TikTok Bio Generator](https://creatorstoolhub.com/tools/tiktok-bio-generator): Generate a compelling TikTok profile bio that attracts followers.
- [TikTok Username Generator](https://creatorstoolhub.com/tools/tiktok-username-generator): Generate unique, catchy TikTok username ideas for any niche.
- [Instagram Caption Generator](https://creatorstoolhub.com/tools/instagram-caption-generator): Generate engaging Instagram captions for posts and Reels.
- [Instagram Hashtag Generator](https://creatorstoolhub.com/tools/instagram-hashtag-generator): Generate 30 tiered Instagram hashtags using broad, mid-range, and micro strategy.
- [Instagram Bio Generator](https://creatorstoolhub.com/tools/instagram-bio-generator): Generate a compelling Instagram bio that converts visitors to followers.
- [Instagram Hook Generator](https://creatorstoolhub.com/tools/instagram-hook-generator): Generate attention-grabbing Instagram Reel and post hooks.
- [Instagram Reel Idea Generator](https://creatorstoolhub.com/tools/instagram-reel-idea-generator): Generate viral Instagram Reel ideas for any niche.
- [Instagram Content Planner](https://creatorstoolhub.com/tools/instagram-content-planner): Plan a week of Instagram content with captions, hashtags, and posting times.
- [Instagram Money Calculator](https://creatorstoolhub.com/tools/instagram-money-calculator): Estimate Instagram earnings based on followers and engagement rate.
- [Instagram Username Generator](https://creatorstoolhub.com/tools/instagram-username-generator): Generate unique Instagram username ideas for any niche or brand.
- [Instagram Engagement Calculator](https://creatorstoolhub.com/tools/instagram-engagement-calculator): Calculate your Instagram engagement rate for any post or profile.
- [AI Prompt Generator](https://creatorstoolhub.com/tools/ai-prompt-generator): Generate structured prompts for ChatGPT, Claude, and Gemini.
- [Midjourney Prompt Generator](https://creatorstoolhub.com/tools/midjourney-prompt-generator): Generate detailed Midjourney prompts for AI image creation.

## Categories

- [YouTube Tools](https://creatorstoolhub.com/category/youtube-tools): 15 free AI tools for YouTube creators covering SEO, monetization, scripts, and analytics.
- [TikTok Tools](https://creatorstoolhub.com/category/tiktok-tools): 8 free AI tools for TikTok growth, content creation, and earnings estimation.
- [Instagram Tools](https://creatorstoolhub.com/category/instagram-tools): 9 free AI tools for Instagram creators covering captions, hashtags, Reels, and monetization.
- [AI Creator Tools](https://creatorstoolhub.com/category/ai-creator-tools): Free AI prompt generators for ChatGPT, Claude, Gemini, and Midjourney.

## Blog

- [How to Start YouTube Automation With AI Free Tools in 2026](https://creatorstoolhub.com/blog/how-to-start-youtube-automation-with-ai-free-tools): Complete beginner guide to YouTube automation using free AI tools — covers niche selection, AI scripting, voiceover, thumbnail creation, and upload scheduling at zero cost.
- [Instagram Hashtag Strategy 2026: Get More Reach on Every Post](https://creatorstoolhub.com/blog/instagram-hashtag-strategy-2026-get-more-reach): Instagram enforced a 5-hashtag cap in December 2025. This guide covers the updated strategy, niche hashtag tiers, and what the data says about hashtag reach in 2026.
- [How to Use YouTube Tags to Get More Views in 2026](https://creatorstoolhub.com/blog/how-to-use-youtube-tags-to-get-more-views): Data-backed guide to YouTube tags in 2026 — what they do, how many to use, and which free tools generate the best tags for your niche.
- [50 Content Creation Ideas for Beginners (Never Run Out of Things to Post)](https://creatorstoolhub.com/blog/content-creation-ideas-for-beginners): 50 proven content ideas for beginner creators across YouTube, TikTok, and Instagram — including hooks, formats, and free tools to produce each one.
- [How to Write a YouTube Script for Beginners: Step-by-Step + Free Template](https://creatorstoolhub.com/blog/how-to-write-a-youtube-script-for-beginners): Step-by-step guide to writing a YouTube video script with hook, body, and CTA — includes a free template and script generator for any niche.
- [Free Content Creation Tool Stack for Beginners: Build Your $0 Setup in 2026](https://creatorstoolhub.com/blog/free-content-creation-tool-stack-beginners): The complete free tool stack for beginner content creators in 2026 — covers YouTube, TikTok, Instagram, AI writing, and graphic design tools.
- [Instagram Hashtags Not Working in 2026? Here's Why (and How to Fix It)](https://creatorstoolhub.com/blog/instagram-hashtags-not-working-2026): Why Instagram hashtags stop working and how to fix it — covers banned tags, the December 2025 5-tag cap, and the correct niche hashtag strategy.
- [How to Get Your First 1,000 TikTok Followers (Complete 2026 Guide)](https://creatorstoolhub.com/blog/how-to-get-your-first-1000-tiktok-followers): Complete strategy for getting your first 1,000 TikTok followers in 2026 — posting frequency, niche selection, hook formulas, and content formats that grow accounts from zero.
- [Free AI Tools for Beginner Content Creators: The No-Budget Starter Kit](https://creatorstoolhub.com/blog/free-ai-tools-for-beginner-content-creators): The best free AI tools for content creators in 2026 — covers script writing, caption generation, hashtag research, thumbnail creation, and video editing at zero cost.
- [How to Start a Faceless YouTube Channel With AI (Complete Guide)](https://creatorstoolhub.com/blog/how-to-start-a-faceless-youtube-channel-with-ai): How to build a faceless YouTube channel using AI tools in 2026 — from niche selection and scripting to voiceover, editing, and monetization without showing your face.
- [YouTube SEO Checklist for Beginners: 10 Steps to Rank Your Videos in 2026](https://creatorstoolhub.com/blog/youtube-seo-checklist-for-beginners): A 10-step YouTube SEO checklist for beginners covering title optimization, description keywords, tags, thumbnails, and audience retention signals that drive rankings.
- [How to Get Views on YouTube With No Subscribers (What Actually Works)](https://creatorstoolhub.com/blog/how-to-get-views-on-youtube-with-no-subscribers): Proven strategies for getting YouTube views with zero subscribers — covers keyword research, search-optimized titles, thumbnail CTR, and content formats that rank from day one.

## Optional

- [About](https://creatorstoolhub.com/about): About creatorsToolHub and its founder Nnaemeka Immanuels — content creator strategist and digital growth enthusiast.
- [Blog](https://creatorstoolhub.com/blog): Creator growth guides covering YouTube, TikTok, and Instagram strategies.
- [Sitemap](https://creatorstoolhub.com/sitemap.xml): Full XML sitemap of all URLs.`
  );
});

// ── 301 redirects for consolidated duplicate blog posts ──────────────────────
const BLOG_REDIRECTS: Record<string, string> = {
  "how-to-go-viral-on-tiktok-in-2026-understanding-tiktok-algorithm":          "how-to-go-viral-on-tiktok-2026-strategies-that-work",
  "instagram-hashtag-strategy-2026-more-reach":                                 "instagram-hashtag-strategy-2026-get-more-reach",
  "how-to-start-faceless-youtube-channel-2026":                                 "how-to-start-faceless-youtube-channel-complete-guide-2026",
  "youtube-seo-tips-beginners-2026":                                            "youtube-seo-tips-beginners-that-work-2026",
  "best-free-ai-tools-for-content-creators-work-smarter-grow-faster":           "best-free-ai-tools-content-creators-2026",
  "viral-content-ideas-beginners-2026":                                         "50-viral-content-ideas-beginners-get-views-2026",
  "how-to-write-youtube-script-fast-free-generator":                            "how-to-write-youtube-script-fast-free-script-generator",
  // Near-duplicates added after audit:
  "how-to-go-viral-on-tiktok-2026":                                             "how-to-go-viral-on-tiktok-2026-strategies-that-work",
  "how-to-get-more-tiktok-followers-for-free-understand-tiktok-algorithm":      "how-to-grow-tiktok-followers-fast-2026",
};

// Must run before static SPA serving so crawlers receive 301, not index.html
app.get("/blog/:slug", (req, res, next) => {
  const target = BLOG_REDIRECTS[req.params.slug];
  if (target) return res.redirect(301, `/blog/${target}`);
  next();
});

app.get("/sitemap.xml", async (_req, res) => {
  try {
    const baseUrl = process.env.SITE_URL ?? "https://creatorstoolhub.com";

    const ALLOWED_SLUGS = ["youtube-tools", "tiktok-tools", "instagram-tools", "ai-creator-tools"];
    const [tools, categories, posts] = await Promise.all([
      db.select({ slug: toolsTable.slug, updatedAt: toolsTable.updatedAt }).from(toolsTable).where(eq(toolsTable.isActive, true)),
      db.select({ slug: categoriesTable.slug }).from(categoriesTable).where(inArray(categoriesTable.slug, ALLOWED_SLUGS)),
      db.select({ slug: blogPostsTable.slug, updatedAt: blogPostsTable.updatedAt }).from(blogPostsTable).where(eq(blogPostsTable.isPublished, true)),
    ]);

    const today = new Date().toISOString().split("T")[0];

    const urlEntries = [
      `<url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${baseUrl}/blog</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
      `<url><loc>${baseUrl}/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      `<url><loc>${baseUrl}/contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
      `<url><loc>${baseUrl}/privacy</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
      `<url><loc>${baseUrl}/terms</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
      `<url><loc>${baseUrl}/disclaimer</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
      `<url><loc>${baseUrl}/cookie-policy</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>`,
      ...categories.map(c => `<url><loc>${baseUrl}/category/${c.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
      ...tools.map(t => `<url><loc>${baseUrl}/tools/${t.slug}</loc><lastmod>${t.updatedAt.toISOString().split("T")[0]}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`),
      ...posts
        .filter(p => !Object.keys(BLOG_REDIRECTS).includes(p.slug))
        .map(p => `<url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate sitemap");
  }
});

if (process.env.NODE_ENV === "production") {
  const staticDir = path.resolve(
    process.cwd(),
    "artifacts/creator-toolbox/dist/public",
  );
  const indexPath = path.join(staticDir, "index.html");

  // Serve hashed assets (JS/CSS chunks) with 1-year immutable cache.
  // Cloudflare will also cache these at the edge — combined effect: ~0ms load
  // for returning visitors regardless of their location.
  app.use(
    "/assets",
    express.static(path.join(staticDir, "assets"), {
      maxAge: "1y",
      immutable: true,
    }),
  );

  // Serve public images (hero, opengraph, etc.) with 30-day cache.
  // Without this they'd fall through to the maxAge:0 general middleware.
  app.use(
    "/images",
    express.static(path.join(staticDir, "images"), {
      maxAge: "30d",
      immutable: false,
    }),
  );

  // Serve blog images directly from the source public/blog directory.
  // Only intercepts requests with a file extension (e.g. /blog/image.png).
  // Requests for /blog and /blog/ (no extension) fall through to the SPA
  // catch-all, which injects the correct meta via meta-injector.
  // This also prevents express.static's directory-detection from issuing a
  // /blog → /blog/ redirect that would create a loop with our canonical rule.
  const sourceBlogDir = path.resolve(
    process.cwd(),
    "artifacts/creator-toolbox/public/blog",
  );
  const serveBlogImages = express.static(sourceBlogDir, { maxAge: "30d", immutable: false });
  app.use("/blog", (req, res, next) => {
    if (!path.extname(req.path)) return next(); // no extension → skip to SPA
    serveBlogImages(req, res, next);
  });

  // Normalise /blog/ → /blog (no trailing slash).
  // The sitemap, canonical tags, and internal links all use /blog without a
  // trailing slash. Use a regex so Express strict-false mode doesn't also
  // match /blog (without the slash) and create a self-redirect loop.
  app.get(/^\/blog\/$/, (_req, res) => res.redirect(301, "/blog"));

  // Serve OG images directly from the source public/og directory.
  // Images are committed to git so they survive all redeploys and server
  // restarts with zero dependency on Replit Object Storage or any sidecar.
  const sourceOgDir = path.resolve(
    process.cwd(),
    "artifacts/creator-toolbox/public/og",
  );
  app.use(
    "/og",
    express.static(sourceOgDir, {
      maxAge: "30d",
      immutable: false,
    }),
  );

  // Serve favicon and other static root files with 7-day cache.
  // redirect:false prevents express.static from issuing directory trailing-slash
  // redirects (e.g. /blog → /blog/) for directories that exist in dist/public/.
  // Those paths should fall through to the SPA catch-all instead. Without this,
  // dist/public/blog/ causes a /blog → /blog/ redirect that Cloudflare's URL
  // normalizer turns into a /blog → /blog self-redirect loop.
  app.use(
    express.static(staticDir, {
      maxAge: "7d",
      index: false,
      redirect: false,
      // Only cache known static file types — not HTML
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store");
        }
      },
    }),
  );

  // ── SSR-lite: inject page-specific meta tags before serving index.html ────
  // Crawlers (Googlebot, GPTBot, ClaudeBot, PerplexityBot) read the first-byte
  // HTML. React's useEffect meta tags are invisible to them. This intercepts
  // every SPA route and replaces the generic meta tags with the correct ones
  // for that URL — no full SSR, just the critical <head> content.
  let indexTemplate: string | null = null;

  app.get("/{*path}", async (req, res) => {
    try {
      // Read and cache the template once per process
      if (!indexTemplate) {
        indexTemplate = fs.readFileSync(indexPath, "utf-8");
      }

      const meta = await resolvePageMeta(req.path);
      if (meta && indexTemplate) {
        const html = buildHtml(indexTemplate, meta);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        // Homepage and blog list change infrequently — give Cloudflare a 30-min
        // edge cache so every global PoP serves from memory after the first hit.
        // Blog posts are cached 10 min (content could be updated by admin).
        // stale-while-revalidate silently refreshes the edge copy in the background
        // so users never wait on a synchronous origin fetch after cache expiry.
        const isStaticRoute = req.path === "/" || req.path === "/blog";
        const sMaxAge = isStaticRoute ? 1800 : 600;
        res.setHeader("Cache-Control", `public, max-age=0, s-maxage=${sMaxAge}, stale-while-revalidate=60`);
        res.send(html);
      } else {
        res.setHeader("Cache-Control", "public, max-age=0, s-maxage=1800, stale-while-revalidate=60");
        res.sendFile(indexPath);
      }
    } catch (err) {
      console.error("[meta-injector] error on", req.path, err);
      res.sendFile(indexPath);
    }
  });
}

export default app;
