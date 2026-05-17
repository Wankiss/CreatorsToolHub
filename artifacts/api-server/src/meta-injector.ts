/**
 * meta-injector.ts
 *
 * Server-side meta tag injection + static body HTML injection for the CSR SPA.
 *
 * The React app sets all meta tags via useEffect (client-side only), so
 * crawlers — Googlebot, GPTBot, ClaudeBot, PerplexityBot — receive a blank
 * <div id="root"> with the generic homepage title on every URL.
 *
 * This module:
 *   1. Replaces <title>, <meta description>, OG/Twitter tags, and <link canonical>
 *      with page-specific values fetched from the database.
 *   2. Injects a static HTML body into <div id="root"><!--app-html--></div>.
 *      Crawlers read this HTML directly (they don't execute JavaScript).
 *      The React app hydrates normally on the client and replaces it within ~1s.
 *
 * Result: crawlers see real <h1> headings, body copy, and internal links for
 * every URL — fixing the 0 GSC impressions problem.
 */

import { db, toolsTable, categoriesTable, blogPostsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const SITE_URL  = "https://creatorstoolhub.com";
const SITE_NAME = "creatorsToolHub";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageMeta {
  title:       string;
  description: string;
  canonical:   string;
  ogType?:     string;
  ogImage?:    string;
  schemas?:    object[];
  /** Static HTML injected into <div id="root"><!--app-html--></div>.
   *  Crawlers read this; React replaces it on the client. */
  bodyHtml?:   string;
}

// ── Simple in-memory cache (slug → {meta, expiresAt}) ─────────────────────────

// Blog post pages that can be updated by the admin: 15 min TTL.
// Static pages (homepage, blog list) use CACHE_TTL_STATIC_MS instead.
const CACHE_TTL_MS        = 15 * 60 * 1000; // 15 min — dynamic pages
const CACHE_TTL_STATIC_MS = 60 * 60 * 1000; // 60 min — homepage / blog list

interface CacheEntry {
  meta:      PageMeta;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): PageMeta | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.meta;
}

function setCached(key: string, meta: PageMeta, ttl = CACHE_TTL_MS): void {
  cache.set(key, { meta, expiresAt: Date.now() + ttl });
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

/** Escape only the characters that break HTML attribute values. */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Shared inline styles so the static HTML shell looks reasonable before React
// mounts (~1-2 s on slow connections). Uses CSS variables already defined in
// index.css so colours match once the stylesheet loads.
const S = {
  wrap:    `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;background:#fff;min-height:100vh`,
  nav:     `padding:0.85rem 1.5rem;border-bottom:1px solid #e2e8f0;background:#fff;display:flex;align-items:center;gap:1.5rem`,
  logo:    `font-weight:800;font-size:1.05rem;color:#7c3aed;text-decoration:none`,
  navLink: `font-size:0.9rem;color:#64748b;text-decoration:none`,
  main:    `max-width:1100px;margin:0 auto;padding:2.5rem 1.25rem 4rem`,
  crumb:   `font-size:0.82rem;color:#94a3b8;margin-bottom:1.25rem`,
  crumbA:  `color:#7c3aed;text-decoration:none`,
  h1:      `font-size:clamp(1.6rem,4vw,2.4rem);font-weight:800;letter-spacing:-0.03em;margin:0 0 0.6rem;color:#0f172a`,
  h2:      `font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a`,
  desc:    `font-size:1.05rem;line-height:1.65;color:#475569;margin:0 0 1.25rem`,
  badge:   `display:inline-block;padding:0.25rem 0.7rem;background:#f3f0ff;color:#7c3aed;border-radius:99px;font-size:0.78rem;font-weight:600;margin-bottom:1rem`,
  grid:    `display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0.5rem;list-style:none;padding:0;margin:0 0 0.5rem`,
  toolA:   `color:#7c3aed;text-decoration:none;font-size:0.95rem;font-weight:500;padding:0.35rem 0;display:block`,
  pill:    `display:inline-block;margin:0.2rem;padding:0.3rem 0.8rem;background:#f1f5f9;border-radius:99px;font-size:0.82rem;color:#475569`,
  faqQ:    `font-weight:600;margin:1.25rem 0 0.35rem;color:#0f172a`,
  faqA:    `color:#475569;font-size:0.95rem;line-height:1.6;margin:0`,
};

/** Shared nav bar rendered in every body shell. */
function navHtml(): string {
  return `<nav style="${S.nav}">
    <a href="/" style="${S.logo}">${SITE_NAME}</a>
    <a href="/category/youtube-tools" style="${S.navLink}">YouTube</a>
    <a href="/category/tiktok-tools" style="${S.navLink}">TikTok</a>
    <a href="/category/instagram-tools" style="${S.navLink}">Instagram</a>
    <a href="/blog" style="${S.navLink}">Blog</a>
  </nav>`;
}

/**
 * Replace the generic meta tags baked into index.html with page-specific
 * values, and optionally inject additional JSON-LD <script> blocks and a
 * static body HTML into <div id="root">.
 */
export function buildHtml(template: string, meta: PageMeta): string {
  const {
    title,
    description,
    canonical,
    ogType  = "website",
    ogImage = `${SITE_URL}/opengraph.jpg`,
    schemas = [],
    bodyHtml = "",
  } = meta;

  // Avoid double-branding: some metaTitles are stored with "| CreatorsToolHub"
  // already appended. Check case-insensitively before adding again.
  const fullTitle = title.toLowerCase().includes(`| ${SITE_NAME.toLowerCase()}`)
    ? title
    : `${title} | ${SITE_NAME}`;
  const t = esc(fullTitle);
  const d = esc(description);
  const c = esc(canonical);
  const i = esc(ogImage);

  let html = template
    .replace(/<title>[^<]*<\/title>/,                          `<title>${t}</title>`)
    .replace(/<meta name="description"[^>]*\/>/,               `<meta name="description" content="${d}" />`)
    .replace(/<meta property="og:title"[^>]*\/>/,              `<meta property="og:title" content="${t}" />`)
    .replace(/<meta property="og:description"[^>]*\/>/,        `<meta property="og:description" content="${d}" />`)
    .replace(/<meta property="og:url"[^>]*\/>/,                `<meta property="og:url" content="${c}" />`)
    .replace(/<meta property="og:type"[^>]*\/>/,               `<meta property="og:type" content="${ogType}" />`)
    .replace(/<meta property="og:image"[^>]*\/>/,              `<meta property="og:image" content="${i}" />`)
    .replace(/<meta name="twitter:title"[^>]*\/>/,             `<meta name="twitter:title" content="${t}" />`)
    .replace(/<meta name="twitter:description"[^>]*\/>/,       `<meta name="twitter:description" content="${d}" />`)
    .replace(/<meta name="twitter:image"[^>]*\/>/,             `<meta name="twitter:image" content="${i}" />`)
    .replace(/<link rel="canonical"[^>]*\/>/,                  `<link rel="canonical" href="${c}" />`);

  if (schemas.length > 0) {
    const blocks = schemas
      .map(s => `  <script type="application/ld+json">${JSON.stringify(s)}</script>`)
      .join("\n");
    html = html.replace("</head>", `${blocks}\n</head>`);
  }

  // Inject static body HTML into the root div placeholder.
  // The placeholder <!--app-html--> sits inside <div id="root">.
  if (bodyHtml) {
    html = html.replace("<!--app-html-->", bodyHtml);
  }

  return html;
}

// ── Breadcrumb helper ─────────────────────────────────────────────────────────

function breadcrumb(...items: { name: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": item.name,
        "item": item.url,
      })),
    ],
  };
}

// ── Static body HTML builders ─────────────────────────────────────────────────

function buildHomepageBody(tools: { name: string; slug: string; categoryId: number }[]): string {
  const youtube   = tools.filter(t => t.categoryId === 1);
  const tiktok    = tools.filter(t => t.categoryId === 2);
  const instagram = tools.filter(t => t.categoryId === 3);
  const ai        = tools.filter(t => t.categoryId === 4);

  const toolList = (arr: typeof tools) =>
    `<ul style="${S.grid}">${arr.map(t =>
      `<li><a href="/tools/${t.slug}" style="${S.toolA}">${esc(t.name)}</a></li>`
    ).join("")}</ul>`;

  return `<div style="${S.wrap}">
  ${navHtml()}
  <main style="${S.main}">
    <span style="${S.badge}">35+ Free Tools — No signup required</span>
    <h1 style="${S.h1}">Free AI Tools for Content Creators</h1>
    <p style="${S.desc}">
      creatorsToolHub gives you 35+ free AI-powered tools built for YouTube, TikTok,
      Instagram, and AI content creation. Generate titles that get clicked, scripts
      that hold attention, captions that drive engagement, hashtags that expand reach,
      and prompts that get real results from AI tools — all instantly, with no signup,
      no subscription, and no usage limits. Every tool works directly in your browser.
    </p>

    <h2 style="${S.h2}">Free YouTube Tools</h2>
    <p style="${S.desc}">
      YouTube is the world's second-largest search engine — your title, tags, and
      description are ranking signals just like a blog post's SEO. Our free YouTube
      tools help you optimize every one: write click-worthy titles that balance search
      keywords with curiosity-driven copy, extract the exact tags top-performing videos
      in your niche use, and generate full video scripts built around the hook-body-CTA
      structure that retains viewers past the 30-second mark. Whether you're starting
      your first channel or optimizing an established one, these tools cut prep time
      from hours to minutes.
    </p>
    ${toolList(youtube)}
    <p style="margin-bottom:1.5rem">
      <a href="/category/youtube-tools" style="${S.crumbA}">Browse all ${youtube.length} free YouTube tools →</a>
    </p>

    <h2 style="${S.h2}">Free TikTok Tools</h2>
    <p style="${S.desc}">
      TikTok's For You Page algorithm rewards relevance and consistency above follower
      count — the right hashtags and captions move the needle more than how long you've
      been posting. Our free TikTok tools generate trending hashtag sets targeted to
      your specific niche, write captions in TikTok's native short-form voice, and
      suggest video ideas matched to what's performing in your category right now.
      Every tool is built specifically for TikTok's format, not adapted from longer-form
      platforms like YouTube or blog content strategies.
    </p>
    ${toolList(tiktok)}
    <p style="margin-bottom:1.5rem">
      <a href="/category/tiktok-tools" style="${S.crumbA}">Browse all ${tiktok.length} free TikTok tools →</a>
    </p>

    <h2 style="${S.h2}">Free Instagram Tools</h2>
    <p style="${S.desc}">
      Instagram reach now depends on keyword-rich captions and Reels optimization —
      the hashtag-only strategy that worked before 2023 no longer drives discovery on
      its own. Our free Instagram tools help you adapt to the current algorithm: generate
      niche hashtag sets that reach targeted audiences instead of oversaturated tags with
      millions of posts, write Reels captions structured for saves and shares, and build
      a profile bio that converts visitors into followers. Whether you're growing a
      personal brand or a business account, these tools cut research time from hours
      to seconds.
    </p>
    ${toolList(instagram)}
    <p style="margin-bottom:1.5rem">
      <a href="/category/instagram-tools" style="${S.crumbA}">Browse all ${instagram.length} free Instagram tools →</a>
    </p>

    <h2 style="${S.h2}">Free AI Creator Tools</h2>
    <p style="${S.desc}">
      AI tools like ChatGPT, Gemini, and Midjourney are now standard in the creator
      workflow — but the output quality depends entirely on the quality of the prompt.
      Our free AI creator tools generate optimized prompts for image generation
      (Midjourney, DALL·E, Stable Diffusion, Flux), structure content briefs that get
      usable AI outputs on the first attempt, and help you build a faster content
      pipeline without any prompt engineering experience. Copy the prompt, paste it
      into your AI tool of choice, and get results that actually match your vision.
    </p>
    ${toolList(ai)}
    <p style="margin-bottom:1.5rem">
      <a href="/category/ai-creator-tools" style="${S.crumbA}">Browse all ${ai.length} free AI creator tools →</a>
    </p>

    <h2 style="${S.h2}">Why Content Creators Use creatorsToolHub</h2>
    <p style="${S.desc}">
      creatorsToolHub was built with one rule: every tool stays free, forever. There are
      no trial periods, no freemium gates, and no credit card fields anywhere on the
      platform. Open any tool, enter your topic or keyword, and get professional-quality
      AI-generated output in seconds — on desktop or mobile. The platform is funded by
      non-intrusive Google AdSense ads, which means creators never pay anything.
    </p>
    <ul style="padding-left:1.2rem;color:#475569;line-height:2">
      <li>Completely free — no credit card, no trial, no subscription, ever</li>
      <li>No account required — open any tool and start instantly</li>
      <li>AI-powered results optimised for each platform's current algorithm</li>
      <li>35+ tools covering YouTube, TikTok, Instagram, and AI content creation</li>
      <li>Works in any browser on desktop, tablet, and mobile</li>
      <li>No daily limits, no usage caps, no watermarks on generated content</li>
    </ul>

    <p style="margin-top:2rem">
      <a href="/category/youtube-tools" style="${S.crumbA}">YouTube Tools</a> ·
      <a href="/category/tiktok-tools" style="${S.crumbA}">TikTok Tools</a> ·
      <a href="/category/instagram-tools" style="${S.crumbA}">Instagram Tools</a> ·
      <a href="/category/ai-creator-tools" style="${S.crumbA}">AI Creator Tools</a> ·
      <a href="/blog" style="${S.crumbA}">Creator Blog</a>
    </p>
  </main>
</div>`;
}

/** Returns the 5 FAQ items for a tool page.
 *  Shared by buildToolBody (HTML) and the FAQPage JSON-LD schema injected
 *  server-side so crawlers (Googlebot, Bingbot, GPTBot) can read it. */
function buildToolFaqs(toolName: string, categorySlug: string): Array<{ q: string; a: string }> {
  const platformFAQ = categorySlug.includes("tiktok")
    ? { q: `Can I use the ${toolName} for TikTok videos?`, a: `Yes. The ${toolName} is built specifically for TikTok creators. It understands TikTok's short-form format, trending content patterns, and what actually gets views on the platform.` }
    : categorySlug.includes("instagram")
    ? { q: `Can I use the ${toolName} for Instagram Reels?`, a: `Yes. The ${toolName} works for all Instagram content formats including Reels, posts, carousels, and Stories. Results are optimised for Instagram's algorithm and audience behaviour.` }
    : categorySlug.includes("ai")
    ? { q: `Which AI models work with the ${toolName}?`, a: `The ${toolName} generates prompts and content compatible with ChatGPT, Claude, Gemini, and other major AI tools. You can copy the output and paste it directly into any AI assistant.` }
    : { q: `Can I use the ${toolName} for YouTube Shorts?`, a: `Yes. The ${toolName} works for both long-form YouTube videos and YouTube Shorts. Simply specify your format when entering your topic and the AI will tailor the output accordingly.` };

  return [
    { q: `Is the ${toolName} free?`, a: `Yes, the ${toolName} on creatorsToolHub is completely free. There is no signup, no subscription, and no usage limit. Open the tool, enter your details, and get results instantly — forever free.` },
    { q: `How does the ${toolName} work?`, a: `The ${toolName} uses advanced AI to generate high-quality results based on your input. Enter your topic, keyword, or content idea, click Generate, and receive professional-quality output in seconds.` },
    { q: `How many times can I use the ${toolName}?`, a: `Unlimited. creatorsToolHub does not cap how many times you can use the ${toolName}. Generate as many results as you need — the tool stays completely free with no daily limits or credit system.` },
    platformFAQ,
    { q: `Do I need to create an account to use the ${toolName}?`, a: `No account is required. The ${toolName} works instantly in your browser without any signup, email address, or payment information. Just open the page and start generating.` },
  ];
}

function buildToolBody(
  tool: { name: string; description: string; slug: string },
  categoryName: string,
  categorySlug: string,
): string {
  const faqs = buildToolFaqs(tool.name, categorySlug);

  return `<div style="${S.wrap}">
  ${navHtml()}
  <main style="${S.main}">
    <nav aria-label="Breadcrumb" style="${S.crumb}">
      <a href="/" style="${S.crumbA}">Home</a> ›
      <a href="/category/${categorySlug}" style="${S.crumbA}">${esc(categoryName)}</a> ›
      <span>${esc(tool.name)}</span>
    </nav>

    <span style="${S.badge}">Free · No signup · Unlimited uses</span>
    <h1 style="${S.h1}">Free ${esc(tool.name)}</h1>
    <p style="${S.desc}">${esc(tool.description)}</p>
    <p style="color:#475569;margin-bottom:2rem">
      Completely free. No signup required. No usage limit.
      Works instantly in your browser on desktop and mobile.
    </p>

    <h2 style="${S.h2}">Frequently Asked Questions</h2>
    <div>
      ${faqs.map(f => `
      <p style="${S.faqQ}">${esc(f.q)}</p>
      <p style="${S.faqA}">${esc(f.a)}</p>`).join("")}
    </div>

    <p style="margin-top:2.5rem">
      <a href="/category/${categorySlug}" style="${S.crumbA}">More ${esc(categoryName)}</a> ·
      <a href="/" style="${S.crumbA}">All Free Tools</a> ·
      <a href="/blog" style="${S.crumbA}">Creator Blog</a>
    </p>
  </main>
</div>`;
}

function buildCategoryBody(
  category: { name: string; description: string | null; slug: string },
  tools: { name: string; slug: string }[],
): string {
  return `<div style="${S.wrap}">
  ${navHtml()}
  <main style="${S.main}">
    <nav aria-label="Breadcrumb" style="${S.crumb}">
      <a href="/" style="${S.crumbA}">Home</a> ›
      <span>${esc(category.name)}</span>
    </nav>

    <span style="${S.badge}">Free · No signup required</span>
    <h1 style="${S.h1}">Free ${esc(category.name)} — AI Tools for Content Creators</h1>
    ${category.description ? `<p style="${S.desc}">${esc(category.description)}</p>` : ""}

    <h2 style="${S.h2}">All ${esc(category.name)} (${tools.length} free tools)</h2>
    <ul style="${S.grid}">
      ${tools.map(t =>
        `<li><a href="/tools/${t.slug}" style="${S.toolA}">${esc(t.name)}</a></li>`
      ).join("")}
    </ul>

    <p style="margin-top:2rem">
      <a href="/" style="${S.crumbA}">All Free Tools</a> ·
      <a href="/blog" style="${S.crumbA}">Creator Blog</a>
    </p>
  </main>
</div>`;
}

function buildBlogPostBody(post: {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  tags: string;
  slug: string;
}): string {
  let tags: string[] = [];
  try { tags = JSON.parse(post.tags); } catch { /* skip */ }

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return `<div style="${S.wrap}">
  ${navHtml()}
  <main style="${S.main}">
    <nav aria-label="Breadcrumb" style="${S.crumb}">
      <a href="/" style="${S.crumbA}">Home</a> ›
      <a href="/blog" style="${S.crumbA}">Blog</a> ›
      <span>${esc(post.title)}</span>
    </nav>

    ${tags.map(tag => `<span style="${S.pill}">${esc(tag)}</span>`).join("")}

    <h1 style="${S.h1};margin-top:0.75rem">${esc(post.title)}</h1>
    <p style="font-size:0.875rem;color:#94a3b8;margin-bottom:1.25rem">
      By ${esc(post.author)}${dateStr ? ` · ${dateStr}` : ""}
    </p>

    <article style="color:#1e293b;line-height:1.75;font-size:1rem;margin-top:1.5rem">
      ${post.content}
    </article>

    <p style="margin-top:2rem">
      <a href="/blog" style="${S.crumbA}">More Articles</a> ·
      <a href="/" style="${S.crumbA}">Free Creator Tools</a>
    </p>
  </main>
</div>`;
}

function buildBlogListBody(posts: { title: string; slug: string; excerpt: string }[]): string {
  return `<div style="${S.wrap}">
  ${navHtml()}
  <main style="${S.main}">
    <span style="${S.badge}">Creator Growth Blog</span>
    <h1 style="${S.h1}">Creator Growth Blog</h1>
    <p style="${S.desc}">
      Free guides for content creators: YouTube SEO, TikTok growth strategies,
      Instagram tips, faceless channel ideas, and AI content tools.
    </p>
    <ul style="list-style:none;padding:0;margin:0">
      ${posts.map(p => `
      <li style="padding:1.25rem 0;border-bottom:1px solid #f1f5f9">
        <a href="/blog/${p.slug}" style="font-weight:600;font-size:1.05rem;color:#0f172a;text-decoration:none">${esc(p.title)}</a>
        <p style="color:#64748b;font-size:0.9rem;margin:0.35rem 0 0">${esc(p.excerpt)}</p>
      </li>`).join("")}
    </ul>
    <p style="margin-top:2rem">
      <a href="/" style="${S.crumbA}">Free Creator Tools</a>
    </p>
  </main>
</div>`;
}

// ── VideoObject extractor ─────────────────────────────────────────────────────
// Parses YouTube embeds from a blog post's HTML content and returns an array
// of VideoObject schema objects — one per embedded video.
//
// The embed template (geo_update3.py / EMBED_TPL) produces this structure:
//   <iframe ... allowfullscreen title="{title}" aria-label="{desc}"></iframe>
//   <noscript><a href="https://www.youtube.com/watch?v={vid}" ...>
//     Watch: {title} on YouTube</a></noscript>
//
// We parse (positionally):
//   • video ID  + title   → noscript href + link text
//   • description         → iframe aria-label (falls back to title)
//
// uploadDate uses the post's publishedAt — the closest date we have without
// hitting the YouTube Data API.

function extractVideoObjects(content: string, publishedAt: Date | null): object[] {
  if (!content) return [];

  // Extract video IDs and titles from noscript fallback links
  const nsPattern =
    /href="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"[^>]*>Watch: ([^<]+) on YouTube/g;

  // Extract descriptions from iframe aria-label (last two attrs before ></iframe>)
  const ariaPattern = /title="[^"]+" aria-label="([^"]+)"><\/iframe>/g;

  const vids: Array<{ id: string; title: string }> = [];
  const descs: string[] = [];

  let m: RegExpExecArray | null;
  while ((m = nsPattern.exec(content))  !== null) vids.push({ id: m[1], title: m[2] });
  while ((m = ariaPattern.exec(content)) !== null) descs.push(m[1]);

  if (vids.length === 0) return [];

  const dateStr = publishedAt
    ? new Date(publishedAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return vids.map(({ id, title }, i) => ({
    "@context":     "https://schema.org",
    "@type":        "VideoObject",
    "name":         title,
    "description":  descs[i] ?? title,
    "thumbnailUrl": `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    "uploadDate":   dateStr,
    "embedUrl":     `https://www.youtube.com/embed/${id}`,
    "url":          `https://www.youtube.com/watch?v=${id}`,
  }));
}

// ── Route resolvers ───────────────────────────────────────────────────────────

/** Returns page-specific metadata for a given URL path, or null to fall back
 *  to the unmodified index.html (404-ish pages, admin, etc.). */
export async function resolvePageMeta(rawPathname: string): Promise<PageMeta | null> {
  // Hostinger/LiteSpeed adds a trailing slash via 301, so /blog → /blog/.
  // Normalise once so all route checks below work regardless of trailing slash.
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/$/, "") : rawPathname;

  // ── Homepage (/') ──────────────────────────────────────────────────────────

  if (pathname === "/" || pathname === "") {
    const cacheKey = "home";
    const cached = getCached(cacheKey);
    if (cached) return cached;

    let bodyHtml = "";
    try {
      const tools = await db
        .select({ name: toolsTable.name, slug: toolsTable.slug, categoryId: toolsTable.categoryId })
        .from(toolsTable)
        .where(eq(toolsTable.isActive, true));
      bodyHtml = buildHomepageBody(tools);
    } catch { /* fall back to no body */ }

    const meta: PageMeta = {
      title:       "Free AI Tools for Content Creators",
      description: "35+ free AI tools for YouTube, TikTok & Instagram creators. Generate titles, scripts, captions, hashtags, and prompts instantly — no signup required.",
      canonical:   SITE_URL,
      bodyHtml,
    };
    setCached(cacheKey, meta, CACHE_TTL_STATIC_MS);
    return meta;
  }

  // ── Blog list (/blog) ──────────────────────────────────────────────────────

  if (pathname === "/blog") {
    const cacheKey = "blog-list";
    const cached = getCached(cacheKey);
    if (cached) return cached;

    let bodyHtml = "";
    try {
      const posts = await db
        .select({ title: blogPostsTable.title, slug: blogPostsTable.slug, excerpt: blogPostsTable.excerpt })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.isPublished, true));
      bodyHtml = buildBlogListBody(posts);
    } catch { /* fall back to no body */ }

    const meta: PageMeta = {
      title:       "Creator Growth Blog 2026",
      description: "Free guides for content creators: YouTube SEO, TikTok growth strategies, Instagram tips, faceless channel ideas, and AI content tools. Updated for 2026.",
      canonical:   `${SITE_URL}/blog`,
      bodyHtml,
    };
    setCached(cacheKey, meta, CACHE_TTL_STATIC_MS);
    return meta;
  }

  // ── About ──────────────────────────────────────────────────────────────────

  if (pathname === "/about") {
    return {
      title:       "About creatorsToolHub",
      description: "creatorsToolHub is built by Nnaemeka Immanuels — 35+ free AI tools for YouTube, TikTok & Instagram creators. No signup, no subscription, ever.",
      canonical:   `${SITE_URL}/about`,
      bodyHtml: `<div style="${S.wrap}">
  ${navHtml()}
  <main style="${S.main}">
    <h1 style="${S.h1}">About creatorsToolHub</h1>
    <p style="${S.desc}">
      creatorsToolHub is a free platform built by Nnaemeka Immanuels — a content creator
      strategist and digital growth enthusiast. The platform offers 35+ free AI-powered
      tools for YouTube, TikTok, and Instagram creators. No signup, no subscription,
      no cost — ever.
    </p>
    <p style="${S.desc}">
      Every tool is designed to solve a real problem creators face: writing titles that
      get clicked, scripts that retain viewers, captions that convert, and hashtags that
      reach new audiences.
    </p>
    <p style="margin-top:1.5rem">
      <a href="/" style="${S.crumbA}">Explore All Free Tools</a> ·
      <a href="/contact" style="${S.crumbA}">Contact</a>
    </p>
  </main>
</div>`,
      schemas: [
        {
          "@context": "https://schema.org",
          "@type":    "Person",
          "name":     "Nnaemeka Immanuels",
          "url":      `${SITE_URL}/about`,
          "jobTitle": "Founder & Content Creator Strategist",
          "worksFor": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
          "sameAs":   ["https://www.linkedin.com/in/immanuels", "https://twitter.com/creatorstoolhub"],
        },
      ],
    };
  }

  // ── Contact ────────────────────────────────────────────────────────────────

  if (pathname === "/contact") {
    return {
      title:       "Contact creatorsToolHub",
      description: "Get in touch with the creatorsToolHub team. Questions, feedback, or partnership enquiries — we read every message.",
      canonical:   `${SITE_URL}/contact`,
      bodyHtml: `<div style="${S.wrap}">
  ${navHtml()}
  <main style="${S.main}">
    <h1 style="${S.h1}">Contact creatorsToolHub</h1>
    <p style="${S.desc}">
      Questions, feedback, bug reports, or partnership enquiries — we read every message.
      Reach out and we'll get back to you as soon as possible.
    </p>
    <p style="margin-top:1.5rem">
      <a href="/" style="${S.crumbA}">Back to All Tools</a>
    </p>
  </main>
</div>`,
    };
  }

  // ── Legal pages ───────────────────────────────────────────────────────────

  if (pathname === "/privacy") {
    return {
      title:       "Privacy Policy",
      description: "Read the creatorsToolHub Privacy Policy. Learn how we collect data, use cookies, and keep your information safe. Free tools, no signup required.",
      canonical:   `${SITE_URL}/privacy`,
      bodyHtml: `<div style="${S.wrap}">${navHtml()}<main style="${S.main}"><h1 style="${S.h1}">Privacy Policy</h1><p style="${S.desc}">This Privacy Policy explains how creatorsToolHub collects, uses, and protects your information when you use our free AI creator tools. We use Google Analytics for traffic insights and Google AdSense to fund the platform.</p><p style="margin-top:1.5rem"><a href="/" style="${S.crumbA}">Back to All Tools</a></p></main></div>`,
    };
  }

  if (pathname === "/terms") {
    return {
      title:       "Terms & Conditions",
      description: "Read creatorsToolHub's Terms and Conditions. Covers acceptable use, AI-generated content ownership, advertising consent, and your rights as a user.",
      canonical:   `${SITE_URL}/terms`,
      bodyHtml: `<div style="${S.wrap}">${navHtml()}<main style="${S.main}"><h1 style="${S.h1}">Terms &amp; Conditions</h1><p style="${S.desc}">These Terms govern your access to and use of creatorsToolHub's free AI creator tools at creatorstoolhub.com. By using our platform you agree to these terms.</p><p style="margin-top:1.5rem"><a href="/" style="${S.crumbA}">Back to All Tools</a></p></main></div>`,
    };
  }

  if (pathname === "/disclaimer") {
    return {
      title:       "Disclaimer",
      description: "Important disclaimer for creatorsToolHub users. AI-generated content should be reviewed before publishing. No guarantees of viral performance or earnings.",
      canonical:   `${SITE_URL}/disclaimer`,
      bodyHtml: `<div style="${S.wrap}">${navHtml()}<main style="${S.main}"><h1 style="${S.h1}">Disclaimer</h1><p style="${S.desc}">creatorsToolHub provides AI-generated content for informational and creative purposes only. Outputs should be reviewed before publication. We make no guarantees of viral performance, revenue, or platform-specific results.</p><p style="margin-top:1.5rem"><a href="/" style="${S.crumbA}">Back to All Tools</a></p></main></div>`,
    };
  }

  if (pathname === "/cookie-policy") {
    return {
      title:       "Cookie Policy",
      description: "Learn how creatorsToolHub uses cookies including Google Analytics and AdSense. Manage your cookie preferences at any time — no account required.",
      canonical:   `${SITE_URL}/cookie-policy`,
      bodyHtml: `<div style="${S.wrap}">${navHtml()}<main style="${S.main}"><h1 style="${S.h1}">Cookie Policy</h1><p style="${S.desc}">creatorsToolHub uses cookies for essential site operation, Google Analytics traffic analysis, and Google AdSense advertising. You can manage your cookie preferences at any time using our built-in consent tool.</p><p style="margin-top:1.5rem"><a href="/" style="${S.crumbA}">Back to All Tools</a></p></main></div>`,
    };
  }

  // ── Blog post (/blog/:slug) ────────────────────────────────────────────────

  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const cacheKey = `blog:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const [post] = await db
        .select({
          title:           blogPostsTable.title,
          metaTitle:       blogPostsTable.metaTitle,
          metaDescription: blogPostsTable.metaDescription,
          excerpt:         blogPostsTable.excerpt,
          content:         blogPostsTable.content,
          coverImage:      blogPostsTable.coverImage,
          author:          blogPostsTable.author,
          publishedAt:     blogPostsTable.publishedAt,
          updatedAt:       blogPostsTable.updatedAt,
          tags:            blogPostsTable.tags,
          faqSchema:       blogPostsTable.faqSchema,
          isPublished:     blogPostsTable.isPublished,
          slug:            blogPostsTable.slug,
        })
        .from(blogPostsTable)
        .where(eq(blogPostsTable.slug, slug))
        .limit(1);

      if (!post || !post.isPublished) return null;

      const title       = (post.metaTitle  || post.title).trim();
      const description = (post.metaDescription || post.excerpt).trim();
      const canonical   = `${SITE_URL}/blog/${slug}`;
      const imageUrl    = post.coverImage
        ? (post.coverImage.startsWith("http") ? post.coverImage : `${SITE_URL}${post.coverImage}`)
        : `${SITE_URL}/opengraph.jpg`;

      let tags: string[] = [];
      try { tags = JSON.parse(post.tags); } catch { /* malformed — skip */ }

      const articleSchema: object = {
        "@context":           "https://schema.org",
        "@type":              "BlogPosting",
        "headline":           post.title,
        "description":        description,
        "image":              { "@type": "ImageObject", "url": imageUrl, "width": 1200, "height": 630 },
        "url":                canonical,
        "datePublished":      post.publishedAt,
        "dateModified":       post.updatedAt ?? post.publishedAt,
        "author": {
          "@type":   "Person",
          "name":    post.author,
          "url":     `${SITE_URL}/about`,
          "sameAs":  ["https://www.linkedin.com/in/immanuels", "https://twitter.com/creatorstoolhub"],
        },
        "publisher": {
          "@type": "Organization",
          "name":  SITE_NAME,
          "url":   SITE_URL,
          "logo":  { "@type": "ImageObject", "url": `${SITE_URL}/favicon.svg` },
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
        "keywords":          tags.join(", "),
        "articleSection":    tags[0] ?? "Creator Tips",
        "inLanguage":        "en",
        "isAccessibleForFree": true,
        "speakable": {
          "@type":      "SpeakableSpecification",
          "cssSelector": ["h1", "h2"],
        },
      };

      const schemas: object[] = [
        articleSchema,
        breadcrumb(
          { name: "Blog", url: `${SITE_URL}/blog` },
          { name: post.title, url: canonical },
        ),
      ];

      // FAQ schema
      if (post.faqSchema) {
        try {
          const faqs = JSON.parse(post.faqSchema) as Array<{ question: string; answer: string }>;
          if (Array.isArray(faqs) && faqs.length > 0) {
            schemas.push({
              "@context": "https://schema.org",
              "@type":    "FAQPage",
              "mainEntity": faqs.map(item => ({
                "@type": "Question",
                "name":  item.question,
                "acceptedAnswer": { "@type": "Answer", "text": item.answer },
              })),
            });
          }
        } catch { /* malformed — skip */ }
      }

      // VideoObject schema — parsed from YouTube embeds in the post content.
      // Each embedded video gets its own VideoObject so AI systems (and Google's
      // Video Search) can discover and cite them as first-class entities.
      const videoObjects = extractVideoObjects(post.content ?? "", post.publishedAt);
      for (const vo of videoObjects) schemas.push(vo);

      const meta: PageMeta = {
        title,
        description,
        canonical,
        ogType:  "article",
        ogImage: imageUrl,
        schemas,
        bodyHtml: buildBlogPostBody({
          title:       post.title,
          excerpt:     post.excerpt,
          content:     post.content ?? "",
          author:      post.author,
          publishedAt: post.publishedAt,
          tags:        post.tags,
          slug,
        }),
      };
      setCached(cacheKey, meta);
      return meta;
    } catch {
      return null;
    }
  }

  // ── Per-tool OG images ────────────────────────────────────────────────────
  // Images are committed to git under artifacts/creator-toolbox/public/og/
  // and served as static files via the /og/ route in app.ts. This means
  // they survive all server restarts and redeploys with no external dependencies.
  const TOOL_OG_IMAGES: Record<string, string> = {
    "youtube-title-generator":           `${SITE_URL}/og/youtube-title-generator.png`,
    "youtube-tag-generator":             `${SITE_URL}/og/youtube-tag-generator.png`,
    "youtube-tag-extractor":             `${SITE_URL}/og/youtube-tag-extractor.png`,
    "youtube-description-generator":     `${SITE_URL}/og/youtube-description-generator.png`,
    "youtube-channel-name-generator":    `${SITE_URL}/og/youtube-channel-name-generator.png`,
    "youtube-money-calculator":          `${SITE_URL}/og/youtube-money-calculator.png`,
    "youtube-thumbnail-downloader":      `${SITE_URL}/og/youtube-thumbnail-downloader.png`,
    "youtube-hashtag-generator":         `${SITE_URL}/og/youtube-hashtag-generator.png`,
    "youtube-shorts-revenue-calculator": `${SITE_URL}/og/youtube-shorts-revenue-calculator.png`,
    "youtube-video-idea-generator":      `${SITE_URL}/og/youtube-video-idea-generator.png`,
    "youtube-seo-score-checker":         `${SITE_URL}/og/youtube-seo-score-checker.png`,
    "youtube-cpm-calculator":            `${SITE_URL}/og/youtube-cpm-calculator.png`,
    "youtube-title-analyzer":            `${SITE_URL}/og/youtube-title-analyzer.png`,
    "youtube-keyword-generator":         `${SITE_URL}/og/youtube-keyword-generator.png`,
    "youtube-script-generator":          `${SITE_URL}/og/youtube-script-generator.png`,
    "youtube-engagement-calculator":     `${SITE_URL}/og/youtube-engagement-calculator.png`,
    "tiktok-viral-idea-generator":       `${SITE_URL}/og/tiktok-viral-idea-generator.png`,
    "tiktok-hook-generator":             `${SITE_URL}/og/tiktok-hook-generator.png`,
    "tiktok-script-generator":           `${SITE_URL}/og/tiktok-script-generator.png`,
    "tiktok-caption-generator":          `${SITE_URL}/og/tiktok-caption-generator.png`,
    "tiktok-hashtag-generator":          `${SITE_URL}/og/tiktok-hashtag-generator.png`,
    "tiktok-money-calculator":           `${SITE_URL}/og/tiktok-money-calculator.png`,
    "tiktok-bio-generator":              `${SITE_URL}/og/tiktok-bio-generator.png`,
    "tiktok-username-generator":         `${SITE_URL}/og/tiktok-username-generator.png`,
    "instagram-hashtag-generator":       `${SITE_URL}/og/instagram-hashtag-generator.png`,
    "instagram-caption-generator":       `${SITE_URL}/og/instagram-caption-generator.png`,
    "instagram-bio-generator":           `${SITE_URL}/og/instagram-bio-generator.png`,
    "instagram-username-generator":      `${SITE_URL}/og/instagram-username-generator.png`,
    "instagram-reel-idea-generator":     `${SITE_URL}/og/instagram-reel-idea-generator.png`,
    "instagram-hook-generator":          `${SITE_URL}/og/instagram-hook-generator.png`,
    "instagram-engagement-calculator":   `${SITE_URL}/og/instagram-engagement-calculator.png`,
    "instagram-money-calculator":        `${SITE_URL}/og/instagram-money-calculator.png`,
    "instagram-content-planner":         `${SITE_URL}/og/instagram-content-planner.png`,
    "ai-prompt-generator":               `${SITE_URL}/og/ai-prompt-generator.png`,
    "midjourney-prompt-generator":       `${SITE_URL}/og/midjourney-prompt-generator.png`,
  };

  const CATEGORY_OG_IMAGES: Record<string, string> = {
    "youtube-tools":    `${SITE_URL}/og/youtube-tools.png`,
    "tiktok-tools":     `${SITE_URL}/og/tiktok-tools.png`,
    "instagram-tools":  `${SITE_URL}/og/instagram-tools.png`,
    "ai-creator-tools": `${SITE_URL}/og/ai-creator-tools.png`,
  };

  // ── Tool page (/tools/:slug) ───────────────────────────────────────────────

  const toolMatch = pathname.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const slug = toolMatch[1];
    const cacheKey = `tool:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const [tool] = await db
        .select({
          name:        toolsTable.name,
          description: toolsTable.description,
          slug:        toolsTable.slug,
          isActive:    toolsTable.isActive,
          categoryId:  toolsTable.categoryId,
        })
        .from(toolsTable)
        .where(eq(toolsTable.slug, slug))
        .limit(1);

      if (!tool || !tool.isActive) return null;

      const canonical = `${SITE_URL}/tools/${slug}`;

      // categoryId: 1=YouTube, 2=TikTok, 3=Instagram, 4=AI Creator Tools
      const isTikTok    = tool.categoryId === 2;
      const isInstagram = tool.categoryId === 3;
      const isAI        = tool.categoryId === 4;

      const categoryName = isTikTok ? "TikTok Tools"
        : isInstagram ? "Instagram Tools"
        : isAI        ? "AI Creator Tools"
        : "YouTube Tools";
      const categorySlug = isTikTok ? "tiktok-tools"
        : isInstagram ? "instagram-tools"
        : isAI        ? "ai-creator-tools"
        : "youtube-tools";

      // Build the 5 FAQ items once — used in both the HTML body and FAQPage JSON-LD.
      // Client-side components also inject a richer tool-specific FAQPage via useEffect,
      // but that is invisible to crawlers (Googlebot, Bingbot, GPTBot don't execute JS).
      // This server-side FAQPage ensures crawlers AND Google Rich Results Test can see
      // structured FAQ markup for every tool page.
      const toolFaqs = buildToolFaqs(tool.name, categorySlug);

      const meta: PageMeta = {
        title:       `Free ${tool.name}`,
        description: tool.description,
        canonical,
        ogImage:     TOOL_OG_IMAGES[slug],
        bodyHtml:    buildToolBody(tool, categoryName, categorySlug),
        schemas: [
          {
            "@context":            "https://schema.org",
            "@type":               "SoftwareApplication",
            "name":                tool.name,
            "url":                 canonical,
            "applicationCategory": "WebApplication",
            "operatingSystem":     "Web",
            "offers":              { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            "isAccessibleForFree": true,
            "description":         tool.description,
            "creator": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
          },
          {
            "@context":   "https://schema.org",
            "@type":      "FAQPage",
            "mainEntity": toolFaqs.map(item => ({
              "@type": "Question",
              "name":  item.q,
              "acceptedAnswer": { "@type": "Answer", "text": item.a },
            })),
          },
          breadcrumb(
            { name: categoryName, url: `${SITE_URL}/category/${categorySlug}` },
            { name: tool.name,    url: canonical },
          ),
        ],
      };
      setCached(cacheKey, meta);
      return meta;
    } catch {
      return null;
    }
  }

  // ── Category page (/category/:slug) ───────────────────────────────────────

  const categoryMatch = pathname.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    const cacheKey = `category:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const ALLOWED_SLUGS = ["youtube-tools", "tiktok-tools", "instagram-tools", "ai-creator-tools"];
      if (!ALLOWED_SLUGS.includes(slug)) return null;

      const [[category], tools] = await Promise.all([
        db.select({
          name:        categoriesTable.name,
          description: categoriesTable.description,
          slug:        categoriesTable.slug,
        })
          .from(categoriesTable)
          .where(eq(categoriesTable.slug, slug))
          .limit(1),

        db.select({ name: toolsTable.name, slug: toolsTable.slug, categoryId: toolsTable.categoryId })
          .from(toolsTable)
          .where(eq(toolsTable.isActive, true)),
      ]);

      if (!category) return null;

      // Filter tools to this category based on slug mapping
      const categoryIdMap: Record<string, number> = {
        "youtube-tools":   1,
        "tiktok-tools":    2,
        "instagram-tools": 3,
        "ai-creator-tools": 4,
      };
      const catId = categoryIdMap[slug];
      const categoryTools = (tools as Array<{ name: string; slug: string; categoryId: number }>).filter(t => t.categoryId === catId);

      const CATEGORY_META_DESCRIPTIONS: Record<string, string> = {
        "youtube-tools":    "Access 16 free YouTube tools for titles, tags, SEO, scripts, hashtags, and revenue calculations. No signup required — grow your channel faster starting today.",
        "tiktok-tools":     "Access 8 free TikTok tools for viral ideas, hooks, scripts, hashtags, and earnings estimates. No signup — create content that reaches the For You Page.",
        "instagram-tools":  "Access 9 free Instagram tools for captions, hashtags, Reel hooks, content planning, and earnings estimates. No signup — grow your Instagram account today.",
        "ai-creator-tools": "Access free AI prompt tools for ChatGPT, Claude, Gemini, and Midjourney. Free AI creator tools built for content creators — no signup, instant results.",
      };

      const canonical = `${SITE_URL}/category/${slug}`;
      const meta: PageMeta = {
        title:       `Free ${category.name} — AI Tools for Content Creators`,
        description: CATEGORY_META_DESCRIPTIONS[slug] ?? category.description ?? "Free AI-powered tools for content creators. No signup required.",
        canonical,
        ogImage:     CATEGORY_OG_IMAGES[slug],
        bodyHtml:    buildCategoryBody(
          { name: category.name, description: category.description ?? null, slug: category.slug },
          categoryTools,
        ),
        schemas: [
          // CollectionPage — tells AI models this is a structured page of tools
          {
            "@context":   "https://schema.org",
            "@type":      "CollectionPage",
            "name":       `Free ${category.name} — AI Tools for Content Creators`,
            "description": category.description ?? "Free AI-powered tools for content creators. No signup required.",
            "url":        canonical,
            "inLanguage": "en",
            "publisher":  { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
            "hasPart": categoryTools.map(t => ({
              "@type":               "SoftwareApplication",
              "name":                t.name,
              "url":                 `${SITE_URL}/tools/${t.slug}`,
              "applicationCategory": "UtilitiesApplication",
              "isAccessibleForFree": true,
              "offers":              { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
            })),
          },
          // ItemList — each tool as a named, positioned, linkable entity
          {
            "@context":      "https://schema.org",
            "@type":         "ItemList",
            "name":          `Free ${category.name}`,
            "description":   category.description ?? "Free AI-powered tools for content creators. No signup required.",
            "url":           canonical,
            "numberOfItems": categoryTools.length,
            "itemListElement": categoryTools.map((t, i) => ({
              "@type":    "ListItem",
              "position": i + 1,
              "name":     t.name,
              "url":      `${SITE_URL}/tools/${t.slug}`,
            })),
          },
          breadcrumb({ name: category.name, url: canonical }),
        ],
      };
      setCached(cacheKey, meta);
      return meta;
    } catch {
      return null;
    }
  }

  // Unknown route — let Express fall back to the generic index.html
  return null;
}
