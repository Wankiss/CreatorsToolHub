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

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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

function setCached(key: string, meta: PageMeta): void {
  cache.set(key, { meta, expiresAt: Date.now() + CACHE_TTL_MS });
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

  const fullTitle = `${title} | ${SITE_NAME}`;
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
      35+ free AI-powered tools for YouTube, TikTok, and Instagram creators.
      Generate titles, scripts, captions, hashtags, and prompts instantly —
      no signup, no subscription, no usage limits.
    </p>

    <h2 style="${S.h2}">YouTube Tools</h2>
    ${toolList(youtube)}

    <h2 style="${S.h2}">TikTok Tools</h2>
    ${toolList(tiktok)}

    <h2 style="${S.h2}">Instagram Tools</h2>
    ${toolList(instagram)}

    <h2 style="${S.h2}">AI Creator Tools</h2>
    ${toolList(ai)}

    <h2 style="${S.h2}">Why Content Creators Use creatorsToolHub</h2>
    <ul style="padding-left:1.2rem;color:#475569;line-height:2">
      <li>Completely free — no credit card, no trial, no subscription</li>
      <li>No account required — open any tool and start instantly</li>
      <li>AI-powered results trained on what actually works on each platform</li>
      <li>Works for YouTube, TikTok, Instagram, and AI content tools</li>
    </ul>

    <p style="margin-top:2rem">
      <a href="/category/youtube-tools" style="${S.crumbA}">YouTube Tools</a> ·
      <a href="/category/tiktok-tools" style="${S.crumbA}">TikTok Tools</a> ·
      <a href="/category/instagram-tools" style="${S.crumbA}">Instagram Tools</a> ·
      <a href="/category/ai-creator-tools" style="${S.crumbA}">AI Creator Tools</a> ·
      <a href="/blog" style="${S.crumbA}">Blog</a>
    </p>
  </main>
</div>`;
}

function buildToolBody(
  tool: { name: string; description: string; slug: string },
  categoryName: string,
  categorySlug: string,
): string {
  const platformFAQ = categorySlug.includes("tiktok")
    ? { q: `Can I use the ${tool.name} for TikTok videos?`, a: `Yes. The ${tool.name} is built specifically for TikTok creators. It understands TikTok's short-form format, trending content patterns, and what actually gets views on the platform.` }
    : categorySlug.includes("instagram")
    ? { q: `Can I use the ${tool.name} for Instagram Reels?`, a: `Yes. The ${tool.name} works for all Instagram content formats including Reels, posts, carousels, and Stories. Results are optimised for Instagram's algorithm and audience behaviour.` }
    : categorySlug.includes("ai")
    ? { q: `Which AI models work with the ${tool.name}?`, a: `The ${tool.name} generates prompts and content compatible with ChatGPT, Claude, Gemini, and other major AI tools. You can copy the output and paste it directly into any AI assistant.` }
    : { q: `Can I use the ${tool.name} for YouTube Shorts?`, a: `Yes. The ${tool.name} works for both long-form YouTube videos and YouTube Shorts. Simply specify your format when entering your topic and the AI will tailor the output accordingly.` };

  const faqs = [
    { q: `Is the ${tool.name} free?`, a: `Yes, the ${tool.name} on creatorsToolHub is completely free. There is no signup, no subscription, and no usage limit. Open the tool, enter your details, and get results instantly — forever free.` },
    { q: `How does the ${tool.name} work?`, a: `The ${tool.name} uses advanced AI to generate high-quality results based on your input. Enter your topic, keyword, or content idea, click Generate, and receive professional-quality output in seconds.` },
    { q: `How many times can I use the ${tool.name}?`, a: `Unlimited. creatorsToolHub does not cap how many times you can use the ${tool.name}. Generate as many results as you need — the tool stays completely free with no daily limits or credit system.` },
    platformFAQ,
    { q: `Do I need to create an account to use the ${tool.name}?`, a: `No account is required. The ${tool.name} works instantly in your browser without any signup, email address, or payment information. Just open the page and start generating.` },
  ];

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
    <p style="${S.desc}">${esc(post.excerpt)}</p>

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

// ── Route resolvers ───────────────────────────────────────────────────────────

/** Returns page-specific metadata for a given URL path, or null to fall back
 *  to the unmodified index.html (404-ish pages, admin, etc.). */
export async function resolvePageMeta(pathname: string): Promise<PageMeta | null> {

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
      title:       "Free AI Tools for Content Creators — YouTube, TikTok & Instagram",
      description: "35+ free AI-powered tools for YouTube, TikTok, and Instagram creators. Generate titles, scripts, captions, hashtags, and prompts instantly — no signup required.",
      canonical:   SITE_URL,
      bodyHtml,
    };
    setCached(cacheKey, meta);
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
      title:       "Creator Growth Blog — YouTube, TikTok & Instagram Tips 2026",
      description: "Free guides for content creators: YouTube SEO, TikTok growth strategies, Instagram tips, faceless channel ideas, and AI content tools. Updated for 2026.",
      canonical:   `${SITE_URL}/blog`,
      bodyHtml,
    };
    setCached(cacheKey, meta);
    return meta;
  }

  // ── About ──────────────────────────────────────────────────────────────────

  if (pathname === "/about") {
    return {
      title:       "About creatorsToolHub — Free AI Tools for Content Creators",
      description: "creatorsToolHub is built by Nnaemeka Immanuels — a content creator strategist who made 35+ free AI tools for YouTube, TikTok, and Instagram creators. No signup, no cost, ever.",
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

      // NOTE: FAQPage schema is NOT injected server-side for tool pages.
      // Each tool component injects its own rich, tool-specific FAQPage schema
      // client-side (e.g. youtube-title-generator.tsx, tiktok-hashtag-generator.tsx).
      // Injecting a generic FAQPage here AND in the component causes a
      // "Duplicate field 'FAQPage'" GSC error that blocks FAQ rich results.
      // The component-level schemas are richer (7 tool-specific Q&As vs 5 generic ones)
      // and Google executes JS to find them — so SSR for FAQ is not needed here.

      const meta: PageMeta = {
        title:       `Free ${tool.name}`,
        description: tool.description,
        canonical,
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

      const canonical = `${SITE_URL}/category/${slug}`;
      const meta: PageMeta = {
        title:       `Free ${category.name} — AI Tools for Content Creators`,
        description: category.description ?? "Free AI-powered tools for content creators. No signup required.",
        canonical,
        bodyHtml:    buildCategoryBody(
          { name: category.name, description: category.description ?? null, slug: category.slug },
          categoryTools,
        ),
        schemas: [
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
