import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";
import { db, toolsTable, categoriesTable, blogPostsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import { resolvePageMeta, buildHtml } from "./meta-injector";

const app: Express = express();

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

app.use("/api/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));
app.use("/api", router);

// ── robots.txt ───────────────────────────────────────────────────────────────
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(
`User-agent: *
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

Sitemap: https://creatorstoolhub.com/sitemap.xml`
  );
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

- [YouTube Tags in 2026: What They Do, How to Use Them & Best Tools](https://creatorstoolhub.com/blog/youtube-tags-in-2026-what-they-do-how-to-use-them-and-which-tools-work-best)
- [How to Go Viral on TikTok in 2026](https://creatorstoolhub.com/blog/how-to-go-viral-on-tiktok-2026-strategies-that-work)
- [Faceless YouTube Channel Ideas: Proven Niches 2026](https://creatorstoolhub.com/blog/faceless-youtube-channel-ideas-proven-niches-2026)
- [How to Grow TikTok Followers Fast in 2026](https://creatorstoolhub.com/blog/how-to-grow-tiktok-followers-fast-2026)
- [Instagram Hashtag Strategy 2026: Get More Reach](https://creatorstoolhub.com/blog/instagram-hashtag-strategy-2026-get-more-reach)
- [YouTube SEO Tips for Beginners That Work in 2026](https://creatorstoolhub.com/blog/youtube-seo-tips-beginners-that-work-2026)
- [How to Start a Faceless YouTube Channel: Complete Guide 2026](https://creatorstoolhub.com/blog/how-to-start-faceless-youtube-channel-complete-guide-2026)
- [Best Free AI Tools for Content Creators 2026](https://creatorstoolhub.com/blog/best-free-ai-tools-content-creators-2026)
- [How to Go Viral on YouTube as a Beginner in 2026](https://creatorstoolhub.com/blog/how-to-go-viral-on-youtube-beginner-2026)
- [How to Write a YouTube Script Fast with a Free Generator](https://creatorstoolhub.com/blog/how-to-write-youtube-script-fast-free-script-generator)
- [How to Get TikTok Video Ideas Every Single Day for Free](https://creatorstoolhub.com/blog/how-to-get-tiktok-video-ideas-every-day-free)
- [How to Create Content Using AI: Complete Beginner's Guide 2026](https://creatorstoolhub.com/blog/how-to-create-content-using-ai-beginners-guide-2026)
- [50 Viral Content Ideas for Beginners That Actually Get Views in 2026](https://creatorstoolhub.com/blog/50-viral-content-ideas-beginners-get-views-2026)
- [Best Free Creator Tools for Beginners in 2026](https://creatorstoolhub.com/blog/best-free-creator-tools-beginners-2026)

## Optional

- [About](https://creatorstoolhub.com/about): About creatorsToolHub and its founder Nnaemeka Immanuels — content creator strategist and digital growth enthusiast.
- [Blog](https://creatorstoolhub.com/blog): Creator growth guides covering YouTube, TikTok, and Instagram strategies.
- [Sitemap](https://creatorstoolhub.com/sitemap.xml): Full XML sitemap of all URLs.`
  );
});

// ── 301 redirects for consolidated duplicate blog posts ──────────────────────
const BLOG_REDIRECTS: Record<string, string> = {
  "how-to-go-viral-on-tiktok-in-2026-understanding-tiktok-algorithm": "how-to-go-viral-on-tiktok-2026-strategies-that-work",
  "instagram-hashtag-strategy-2026-more-reach":                        "instagram-hashtag-strategy-2026-get-more-reach",
  "how-to-start-faceless-youtube-channel-2026":                        "how-to-start-faceless-youtube-channel-complete-guide-2026",
  "youtube-seo-tips-beginners-2026":                                   "youtube-seo-tips-beginners-that-work-2026",
  "best-free-ai-tools-for-content-creators-work-smarter-grow-faster":  "best-free-ai-tools-content-creators-2026",
  "viral-content-ideas-beginners-2026":                                "50-viral-content-ideas-beginners-get-views-2026",
  "how-to-write-youtube-script-fast-free-generator":                   "how-to-write-youtube-script-fast-free-script-generator",
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

  app.use(express.static(staticDir));

  // ── SSR-lite: inject page-specific meta tags before serving index.html ────
  // Crawlers (Googlebot, GPTBot, ClaudeBot, PerplexityBot) read the first-byte
  // HTML. React's useEffect meta tags are invisible to them. This intercepts
  // every SPA route and replaces the generic meta tags with the correct ones
  // for that URL — no full SSR, just the critical <head> content.
  let indexTemplate: string | null = null;

  app.get("/{*path}", async (req, res) => {
    try {
      // Read and cache the built index.html template once per process
      if (!indexTemplate) {
        indexTemplate = fs.readFileSync(indexPath, "utf-8");
      }

      const meta = await resolvePageMeta(req.path);
      if (meta && indexTemplate) {
        const html = buildHtml(indexTemplate, meta);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.send(html);
      } else {
        res.sendFile(indexPath);
      }
    } catch (err) {
      console.error("[meta-injector] error on", req.path, err);
      res.sendFile(indexPath);
    }
  });
}

export default app;
