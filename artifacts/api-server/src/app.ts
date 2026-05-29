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
app.disable("x-powered-by");

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

// ── Trailing slash → canonical redirect (critical for Google deduplication) ──
// Prevents "Duplicate, Google chose different canonical than user" GSC error.
// Any URL with a trailing slash (except the root "/") gets 301-redirected to
// the non-slash version, which matches what canonical tags and the sitemap use.
app.use((req, res, next) => {
  const url = req.originalUrl;
  if (url.length > 1 && url.endsWith("/") && !url.includes("?")) {
    return res.redirect(301, url.slice(0, -1));
  }
  if (url.length > 1 && url.includes("/?")) {
    return res.redirect(301, url.replace("/?", "?"));
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

User-agent: GoogleOther
Allow: /

User-agent: Amazonbot
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
- [Sitemap](https://creatorstoolhub.com/sitemap.xml): Full XML sitemap of all URLs.
- [llms-full.txt](https://creatorstoolhub.com/llms-full.txt): Full prose descriptions for all 35 tools, 4 categories, and 12 blog posts — for AI crawlers requiring richer context.`
  );
});

// ── llms-full.txt ────────────────────────────────────────────────────────────
// Full prose descriptions for AI crawlers (GPTBot, ClaudeBot, PerplexityBot).
// Follows the llms.txt spec: llms-full.txt contains rich, citable content about
// every tool, category, and resource on the site.
app.get("/llms-full.txt", (_req, res) => {
  res.type("text/plain").send(
`# creatorsToolHub — Full AI Reference

> creatorsToolHub (https://creatorstoolhub.com) is a free platform of 35+ AI-powered tools for YouTube, TikTok, and Instagram content creators. Every tool is completely free — no account, no signup, no paywall. Built by Nnaemeka Immanuels, a content creator strategist and digital growth enthusiast based online.

---

## YouTube Tools

### YouTube Title Generator
URL: https://creatorstoolhub.com/tools/youtube-title-generator
The YouTube Title Generator uses AI to create SEO-optimized, high-CTR video titles based on 7 proven viral frameworks — including curiosity gaps, number lists, and how-to formats. Creators enter their topic or keyword and receive 10 title variations instantly, each scored for search intent alignment and emotional trigger strength. It is the most-used tool on creatorsToolHub, relied on by beginner and intermediate YouTube creators who want to improve click-through rates without spending money on paid SEO software.

### YouTube Tag Generator
URL: https://creatorstoolhub.com/tools/youtube-tag-generator
The YouTube Tag Generator produces a set of tiered, relevant tags for any YouTube video topic in seconds. Tags are organized by search volume tier — broad, mid-tail, and long-tail — so creators can cover the full keyword landscape YouTube's algorithm uses to classify and recommend videos. Unlike generic keyword tools, it is purpose-built for YouTube's tag field, respecting the 500-character tag limit and prioritizing terms that match YouTube's autocomplete patterns.

### YouTube Script Generator
URL: https://creatorstoolhub.com/tools/youtube-script-generator
The YouTube Script Generator creates complete video scripts structured with a hook, body sections, and a call-to-action tailored to the creator's topic and audience. Scripts are written to optimize audience retention by placing the most compelling information early and using pattern interrupts throughout. It is especially useful for faceless channel operators, beginner creators who struggle with on-camera delivery, and automation workflows where consistent script output matters.

### YouTube Hashtag Generator
URL: https://creatorstoolhub.com/tools/youtube-hashtag-generator
The YouTube Hashtag Generator creates a tiered set of hashtags for YouTube videos and Shorts, mixing broad trending tags with niche-specific tags to maximize reach across both search and the hashtag browse page. YouTube recommends using 3 to 5 hashtags per video; this tool generates 15 options across tiers so creators can select the best fit. It accounts for hashtag placement best practices — including putting the three most important hashtags directly in the video title.

### YouTube Description Generator
URL: https://creatorstoolhub.com/tools/youtube-description-generator
The YouTube Description Generator builds keyword-rich video descriptions with above-the-fold hooks, natural keyword insertion, timestamped chapter markers, social links, and a subscribe CTA. A strong YouTube description improves search ranking, increases session time by guiding viewers to related content, and helps YouTube's algorithm understand the video's topic. The generator follows YouTube's 5,000-character limit and places primary keywords within the first 150 characters.

### YouTube Keyword Generator
URL: https://creatorstoolhub.com/tools/youtube-keyword-generator
The YouTube Keyword Generator surfaces high-volume, low-competition YouTube search terms for any topic or niche. Results are grouped by search intent — informational, tutorial, comparison, and review — so creators can build content clusters that rank for multiple related searches. Unlike Google keyword tools, it focuses on YouTube-specific query patterns, including question-format searches that drive high watch time from viewers seeking tutorials.

### YouTube Money Calculator
URL: https://creatorstoolhub.com/tools/youtube-money-calculator
The YouTube Money Calculator estimates channel earnings based on monthly view count, niche CPM rate, and ad-enabled video ratio. It outputs a projected monthly and annual revenue range, accounting for YouTube's 45% revenue share and typical RPM variance by content category. Finance and business content earns CPMs of $12 to $20, while gaming and entertainment averages $2 to $5. The calculator helps creators set realistic monetization expectations and plan their content strategy around higher-CPM topics.

### YouTube Video Idea Generator
URL: https://creatorstoolhub.com/tools/youtube-video-idea-generator
The YouTube Video Idea Generator produces niche-specific video concepts with built-in hooks, target audience definitions, and suggested title formats. Each idea is designed for searchability — grounded in the types of queries real viewers type into YouTube's search bar. Creators input their niche and a brief description of their channel and receive 10 actionable ideas that span tutorials, listicles, reactions, and opinion formats to maintain content variety.

### YouTube Channel Name Generator
URL: https://creatorstoolhub.com/tools/youtube-channel-name-generator
The YouTube Channel Name Generator creates unique, brandable channel name ideas that are memorable, niche-relevant, and available on most social platforms. Each suggestion is short enough to display in full on mobile (under 20 characters), easy to spell phonetically, and avoids generic terms that make it hard to rank in YouTube search. Creators specify their niche and target audience and receive 10 name options with brief rationale for each.

### YouTube Title Analyzer
URL: https://creatorstoolhub.com/tools/youtube-title-analyzer
The YouTube Title Analyzer scores an existing or draft video title across five dimensions: keyword strength, emotional trigger presence, length optimization (55 to 70 characters), power word usage, and search intent clarity. It returns a composite score out of 100 plus specific, actionable suggestions to improve the title before publishing. Research shows that optimizing a video title before upload increases CTR by up to 36% compared to unanalyzed titles.

### YouTube SEO Score Checker
URL: https://creatorstoolhub.com/tools/youtube-seo-score-checker
The YouTube SEO Score Checker audits all the on-page SEO signals for a YouTube video — title, description, tags, thumbnail text, and category selection — and assigns a score out of 100. It flags missing elements, keyword gaps, and over-optimization issues that can suppress a video's ranking. The tool is designed for creators who publish regularly and want a consistent pre-upload SEO checklist without relying on paid tools like TubeBuddy or VidIQ.

### YouTube Shorts Revenue Calculator
URL: https://creatorstoolhub.com/tools/youtube-shorts-revenue-calculator
The YouTube Shorts Revenue Calculator estimates earnings from the YouTube Shorts monetization program based on monthly view count and content category. YouTube pays Shorts creators through the Shorts ad revenue pool, which distributes earnings differently from long-form RPM — typically $0.03 to $0.06 per 1,000 views. The calculator helps creators understand the revenue potential of Shorts as a growth and monetization strategy alongside their main long-form channel.

### YouTube CPM Calculator
URL: https://creatorstoolhub.com/tools/youtube-cpm-calculator
The YouTube CPM Calculator converts CPM (cost per mille, the rate advertisers pay per 1,000 ad impressions) into estimated creator earnings after YouTube's 45% cut. It accepts CPM, view count, and estimated ad impression rate (typically 50 to 60% of views) to project monthly and annual ad revenue. The tool also provides average CPM benchmarks by niche, helping creators understand whether their current niche is underperforming relative to more advertiser-friendly topics.

### YouTube Engagement Calculator
URL: https://creatorstoolhub.com/tools/youtube-engagement-calculator
The YouTube Engagement Calculator measures a channel's engagement rate by combining likes, comments, shares, and saves relative to total views or subscribers. A healthy YouTube engagement rate is 3 to 6%; below 1% suggests weak audience connection. The calculator outputs an engagement score plus interpretation guidance, helping creators diagnose whether low views stem from poor SEO, weak thumbnails, or audience engagement problems that affect how YouTube distributes content.

### YouTube Thumbnail Downloader
URL: https://creatorstoolhub.com/tools/youtube-thumbnail-downloader
The YouTube Thumbnail Downloader extracts and downloads any YouTube video's thumbnail in all available resolutions — maxresdefault (1280x720), hqdefault (480x360), mqdefault (320x180), and sddefault (640x480). Creators use it to analyze competitor thumbnails, repurpose high-performing thumbnail designs for A/B testing, or save reference images for their design team. No software installation or YouTube login is required.

---

## TikTok Tools

### TikTok Hook Generator
URL: https://creatorstoolhub.com/tools/tiktok-hook-generator
The TikTok Hook Generator creates scroll-stopping opening lines for TikTok videos based on proven psychological triggers — curiosity, controversy, social proof, and urgency. Research shows TikTok viewers decide whether to keep watching in the first 1 to 3 seconds; a strong hook is the single highest-leverage variable in a video's completion rate. Creators input their topic and desired emotional tone and receive 10 hook variations across different trigger types.

### TikTok Script Generator
URL: https://creatorstoolhub.com/tools/tiktok-script-generator
The TikTok Script Generator produces short-form video scripts structured for TikTok's algorithm — front-loading the value statement, maintaining a fast information density throughout, and ending with a clear engagement prompt (comment, share, follow). Scripts are kept under 60 seconds in read time to match the sweet spot for TikTok completion rate. The generator is used by branded content creators, affiliate marketers, and coaches who batch-produce TikTok content.

### TikTok Viral Idea Generator
URL: https://creatorstoolhub.com/tools/tiktok-viral-idea-generator
The TikTok Viral Idea Generator produces niche-specific content concepts with pre-written hooks, suggested hashtag categories, and optimal video format (talking head, text-on-screen, duet bait, trend participation). Each idea is grounded in TikTok's For You Page distribution logic — content formats that generate saves and shares get amplified to cold audiences. The tool targets creators who are stuck in a content rut and need ideas that are both original and algorithmically sound.

### TikTok Caption Generator
URL: https://creatorstoolhub.com/tools/tiktok-caption-generator
The TikTok Caption Generator creates engaging captions with integrated hashtags and CTAs optimized for TikTok's 2,200-character caption limit. Captions are written to extend watch time by posing questions or creating unresolved tension that drives comment engagement. The tool produces captions in multiple tones — educational, entertaining, inspirational, and conversational — so creators can match their brand voice without spending time on copywriting.

### TikTok Hashtag Generator
URL: https://creatorstoolhub.com/tools/tiktok-hashtag-generator
The TikTok Hashtag Generator produces a tiered mix of trending, niche, and micro hashtags designed to maximize For You Page distribution. TikTok's algorithm uses hashtags as classification signals; a good mix of 3 to 5 broad tags and 3 to 5 niche tags outperforms either strategy alone. The generator refreshes tag suggestions based on current trending data and niche-specific search patterns, helping creators avoid stale or shadowbanned tags.

### TikTok Money Calculator
URL: https://creatorstoolhub.com/tools/tiktok-money-calculator
The TikTok Money Calculator estimates creator earnings from the TikTok Creator Rewards Program based on monthly view count and engagement rate. TikTok's Creator Rewards Program pays $0.40 to $1.00 per 1,000 qualified views for long-form videos (over 1 minute), significantly higher than the old Creator Fund rate of $0.02 to $0.04. The calculator also estimates brand deal revenue at typical market rates for the creator's follower tier, from nano (1K to 10K) through mega (1M+).

### TikTok Bio Generator
URL: https://creatorstoolhub.com/tools/tiktok-bio-generator
The TikTok Bio Generator creates compelling TikTok profile bios within the 80-character limit that clearly communicate the creator's niche, value proposition, and follow reason. A strong bio converts profile visitors into followers at a 15 to 25% higher rate than a generic or blank bio. The generator produces 5 bio options per request across different tones — witty, professional, curiosity-driven — so creators can choose the one that best represents their personal brand.

### TikTok Username Generator
URL: https://creatorstoolhub.com/tools/tiktok-username-generator
The TikTok Username Generator creates unique, memorable usernames for any niche or personal brand. Usernames are kept under 24 characters (TikTok's limit), are easy to type on mobile, avoid numbers and underscores that reduce memorability, and are cross-checked for common availability patterns. Creators can specify their niche, tone (fun, professional, mysterious), and any name preferences to receive 10 tailored options.

---

## Instagram Tools

### Instagram Caption Generator
URL: https://creatorstoolhub.com/tools/instagram-caption-generator
The Instagram Caption Generator creates engaging captions for feed posts, Reels, and carousels — including an attention-grabbing first line, body content with natural storytelling, a call-to-action, and integrated hashtags. Instagram captions can be up to 2,200 characters, but the visible preview is only the first 125 characters before the "more" cut; the generator front-loads the hook accordingly. It supports multiple caption styles including educational, personal story, product showcase, and engagement-bait formats.

### Instagram Hashtag Generator
URL: https://creatorstoolhub.com/tools/instagram-hashtag-generator
The Instagram Hashtag Generator creates a 30-hashtag set using a broad-mid-micro strategy — 5 high-volume tags (1M+ posts) for reach, 15 medium tags (100K to 1M posts) for discoverability, and 10 micro-niche tags (under 100K posts) for ranking. Following Instagram's December 2025 update recommending 3 to 5 focused hashtags, the tool also generates an optimized short-set variant for creators who prefer the new minimalist approach. All tags are verified against common shadowban patterns.

### Instagram Bio Generator
URL: https://creatorstoolhub.com/tools/instagram-bio-generator
The Instagram Bio Generator creates a compelling 150-character Instagram bio that communicates niche authority, value proposition, and a clear CTA in three short lines. A well-optimized bio increases the profile-to-follow conversion rate by 20 to 40% for new visitors arriving from Reels or hashtag pages. The generator produces 5 bio variations per request, including emoji-formatted options for creators who want visual hierarchy in their profile without writing from scratch.

### Instagram Hook Generator
URL: https://creatorstoolhub.com/tools/instagram-hook-generator
The Instagram Hook Generator creates attention-grabbing first lines for Reels, carousels, and captions using the same psychological trigger frameworks used in direct response copywriting — pattern interrupts, bold claims, relatable pain points, and curiosity gaps. Instagram's algorithm measures whether viewers expand captions or rewatch Reels; a strong first line increases both metrics. The tool produces hooks across multiple formats including question openers, statement openers, and data-led openers.

### Instagram Reel Idea Generator
URL: https://creatorstoolhub.com/tools/instagram-reel-idea-generator
The Instagram Reel Idea Generator produces viral-ready Reel concepts for any niche, complete with a suggested hook, format type (talking head, text overlay, trending audio), estimated engagement trigger, and hashtag category. Reels account for 91% of Instagram's reach growth in 2026; creators who post Reels consistently grow 3x faster than those who post only static images. Each idea is designed to be executable with a smartphone and free editing tools — no studio or budget required.

### Instagram Content Planner
URL: https://creatorstoolhub.com/tools/instagram-content-planner
The Instagram Content Planner generates a full week of Instagram content — posts, Reels, and Stories — with captions, hashtag sets, and optimal posting times for each piece. It applies the 60/30/10 content mix: 60% educational or entertaining value content, 30% engagement content (polls, questions), and 10% promotional content. The planner outputs a structured schedule in table format that creators can paste into a spreadsheet or content calendar tool.

### Instagram Money Calculator
URL: https://creatorstoolhub.com/tools/instagram-money-calculator
The Instagram Money Calculator estimates earnings from brand deals, sponsored posts, affiliate partnerships, and Instagram's Reels Play Bonus program based on follower count and engagement rate. Instagram brand deal rates in 2026 range from $10 to $100 per 1,000 followers for nano creators (1K to 10K), up to $5,000 to $20,000 per post for mega influencers (1M+). The calculator outputs a realistic monthly income range and breaks it down by revenue stream so creators can prioritize the highest-ROI monetization strategy.

### Instagram Username Generator
URL: https://creatorstoolhub.com/tools/instagram-username-generator
The Instagram Username Generator creates unique, niche-relevant usernames that are memorable, available on most platforms, and free of the numbers and symbols that signal a generic account. A consistent username across Instagram, TikTok, and YouTube makes it easier for fans to find a creator across platforms and strengthens personal brand recognition. Creators specify their niche, name preferences, and desired tone to receive 10 tailored suggestions.

### Instagram Engagement Calculator
URL: https://creatorstoolhub.com/tools/instagram-engagement-calculator
The Instagram Engagement Calculator computes engagement rate as (likes + comments + saves) divided by reach or follower count, depending on the creator's reporting preference. A healthy Instagram engagement rate is 1 to 3% for accounts with 10K to 100K followers; below 0.5% indicates an audience mismatch or content quality issue. The tool also benchmarks the result against niche averages, helping creators understand whether their engagement is competitive for their audience size.

---

## AI Creator Tools

### AI Prompt Generator
URL: https://creatorstoolhub.com/tools/ai-prompt-generator
The AI Prompt Generator creates structured, high-output prompts for ChatGPT, Claude, Anthropic, and Gemini — formatted with clear role assignment, task definition, output format specification, and constraint parameters. Vague prompts produce vague outputs; the generator applies the RACI and chain-of-thought prompt engineering frameworks to ensure consistently detailed, usable AI responses. It is used by content creators, marketers, and freelancers who work with AI tools daily and want to save time on prompt iteration.

### Midjourney Prompt Generator
URL: https://creatorstoolhub.com/tools/midjourney-prompt-generator
The Midjourney Prompt Generator creates detailed, parameter-rich prompts for Midjourney AI image generation — including style modifiers, lighting descriptions, aspect ratio flags, negative prompts, and version parameters (--v 6.1 default). A well-structured Midjourney prompt produces dramatically better results than a plain text description; the generator applies the subject/medium/style/lighting/mood/composition framework used by professional AI artists. Output can be used directly in Midjourney's /imagine command.

---

## Categories

### YouTube Tools Category
URL: https://creatorstoolhub.com/category/youtube-tools
The YouTube Tools category on creatorsToolHub contains 15 free AI tools covering every stage of the YouTube content workflow — from keyword research and title optimization through scripting, SEO scoring, monetization calculation, and thumbnail downloading. It is the largest tool category on the site, reflecting YouTube's position as the highest-CPM platform for creator monetization. All 15 tools are completely free with no usage limits.

### TikTok Tools Category
URL: https://creatorstoolhub.com/category/tiktok-tools
The TikTok Tools category contains 8 free AI tools designed for TikTok's short-form content model — hook generation, scripting, caption writing, hashtag research, viral idea generation, bio optimization, username creation, and earnings estimation. TikTok's Creator Rewards Program launched in 2024 and pays up to $1.00 per 1,000 qualified views, making monetization a growing priority alongside audience growth for TikTok creators.

### Instagram Tools Category
URL: https://creatorstoolhub.com/category/instagram-tools
The Instagram Tools category contains 9 free AI tools for Instagram creators covering all primary content formats — feed posts, Reels, Stories, and carousels. Tools address the full creator workflow from ideation (Reel Idea Generator, Content Planner) through publishing (Caption Generator, Hashtag Generator) and analysis (Engagement Calculator, Money Calculator). Instagram Reels reach peaked at 9x feed post reach in 2025, making Reels-first tools the highest priority for growth-focused creators.

### AI Creator Tools Category
URL: https://creatorstoolhub.com/category/ai-creator-tools
The AI Creator Tools category contains free prompt generators for the most widely used AI platforms — ChatGPT, Claude, Gemini, and Midjourney. As AI becomes a standard part of the content creation workflow in 2026, prompt quality is the primary differentiator between creators who get usable AI output and those who struggle with generic results. These tools are designed for non-technical creators who want professional-grade AI output without learning prompt engineering from scratch.

---

## Blog

- [How to Start YouTube Automation With AI Free Tools in 2026](https://creatorstoolhub.com/blog/how-to-start-youtube-automation-with-ai-free-tools): Complete beginner guide to YouTube automation using free AI tools — covers niche selection, AI scripting, voiceover, thumbnail creation, and upload scheduling at zero cost.
- [Instagram Hashtag Strategy 2026: Get More Reach on Every Post](https://creatorstoolhub.com/blog/instagram-hashtag-strategy-2026-get-more-reach): Updated strategy guide following Instagram's December 2025 5-hashtag cap, covering niche hashtag tiers and data-backed reach results.
- [How to Use YouTube Tags to Get More Views in 2026](https://creatorstoolhub.com/blog/how-to-use-youtube-tags-to-get-more-views): Data-backed guide covering what YouTube tags do, how many to use, and which free tools generate the best tags for any niche.
- [50 Content Creation Ideas for Beginners](https://creatorstoolhub.com/blog/content-creation-ideas-for-beginners): 50 proven content ideas for beginner creators across YouTube, TikTok, and Instagram with hooks, formats, and free production tools for each.
- [How to Write a YouTube Script for Beginners](https://creatorstoolhub.com/blog/how-to-write-a-youtube-script-for-beginners): Step-by-step guide to writing a video script with hook, body, and CTA — includes a free template and script generator.
- [Free Content Creation Tool Stack for Beginners](https://creatorstoolhub.com/blog/free-content-creation-tool-stack-beginners): The complete free tool stack for beginner creators in 2026 covering YouTube, TikTok, Instagram, AI writing, and graphic design.
- [Instagram Hashtags Not Working in 2026? Here is Why and How to Fix It](https://creatorstoolhub.com/blog/instagram-hashtags-not-working-2026): Explains why hashtags stop working and how to fix it — covers banned tags, the December 2025 5-tag cap, and the correct niche strategy.
- [How to Get Your First 1,000 TikTok Followers](https://creatorstoolhub.com/blog/how-to-get-your-first-1000-tiktok-followers): Complete strategy for reaching 1,000 TikTok followers in 2026 — posting frequency, niche selection, hook formulas, and formats that grow accounts from zero.
- [Free AI Tools for Beginner Content Creators](https://creatorstoolhub.com/blog/free-ai-tools-for-beginner-content-creators): The best free AI tools for content creators in 2026 covering scripting, caption generation, hashtag research, thumbnail creation, and video editing at zero cost.
- [How to Start a Faceless YouTube Channel With AI](https://creatorstoolhub.com/blog/how-to-start-a-faceless-youtube-channel-with-ai): How to build a faceless YouTube channel using AI in 2026 — niche selection, scripting, voiceover, editing, and monetization without showing your face.
- [YouTube SEO Checklist for Beginners: 10 Steps to Rank Your Videos](https://creatorstoolhub.com/blog/youtube-seo-checklist-for-beginners): A 10-step YouTube SEO checklist covering title optimization, description keywords, tags, thumbnails, and audience retention signals that drive rankings.
- [How to Get Views on YouTube With No Subscribers](https://creatorstoolhub.com/blog/how-to-get-views-on-youtube-with-no-subscribers): Proven strategies for getting YouTube views with zero subscribers — keyword research, search-optimized titles, thumbnail CTR, and content formats that rank from day one.

---

## Site Information

- Homepage: https://creatorstoolhub.com
- Full tool index: https://creatorstoolhub.com/tools
- Blog index: https://creatorstoolhub.com/blog
- Sitemap: https://creatorstoolhub.com/sitemap.xml
- llms.txt: https://creatorstoolhub.com/llms.txt
- Contact: Built by Nnaemeka Immanuels (swiftseotools@gmail.com)`
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
      `<url><loc>${baseUrl}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
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

  // /blog/ → /blog redirect is now handled by the global trailing-slash
  // middleware registered at the top of app.ts. Nothing to do here.

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
