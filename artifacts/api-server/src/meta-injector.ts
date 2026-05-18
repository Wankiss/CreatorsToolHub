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

  // Inject hero image preload only on the homepage — prevents wasted fetches
  // on tool/blog pages where hero-bg.webp is never used as the LCP element.
  if (canonical === SITE_URL || canonical === `${SITE_URL}/`) {
    html = html.replace(
      "</head>",
      `  <!-- Preload LCP hero image — homepage only -->\n  <link rel="preload" as="image" href="/images/hero-bg.webp" type="image/webp" fetchpriority="high">\n</head>`,
    );
  }

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

// ── Per-tool answer-first sections ───────────────────────────────────────────
// Each entry is raw HTML injected between the tool description and the FAQ.
// Sections follow answer-first formatting: every H2 opens with a 40-60 word
// stat-backed paragraph so AI crawlers (GPTBot, ClaudeBot, PerplexityBot) can
// extract and cite each section independently.
const TOOL_ANSWER_SECTIONS: Record<string, string> = {

  "midjourney-prompt-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Midjourney Prompts Are Different From Text AI Prompts</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Midjourney doesn't interpret natural language the way ChatGPT or Claude does — it responds to structured visual descriptors that define subject, medium, style, lighting, mood, and composition simultaneously. A prompt like "a woman in a coffee shop" produces generic results. A prompt like "a woman in a rainy Paris cafe, bokeh background, warm tungsten lighting, editorial photography, shot on Leica M11, --ar 4:5 --v 6.1" produces professional-grade imagery. The gap between those outputs is purely prompt structure, not AI capability.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Every High-Quality Midjourney Prompt Needs</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective Midjourney prompts follow a six-component framework: subject (who or what), action or context (what's happening), artistic medium (photography, oil painting, digital art), lighting style (golden hour, studio, neon), mood or atmosphere (melancholic, energetic, serene), and composition (wide angle, close-up, overhead). Appending version parameters (--v 6.1 for photorealism) and aspect ratio flags (--ar 16:9 for landscape) gives Midjourney the technical constraints it needs to consistently produce usable output on the first generation.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Get Professional Results With the Generator</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your image concept, preferred style, and intended use (blog hero, social media, product mockup) and the generator builds a structured prompt you can paste directly into Midjourney's /imagine command. If the first result isn't right, add a negative prompt using --no to exclude unwanted elements — "blurry, low quality, watermark" eliminates the most common issues. Vary the lighting descriptor first when iterating; lighting changes transform the emotional tone of an image more than any other single element.</p>`,

  "ai-prompt-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Most AI Prompts Fail (and How to Fix Them)</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most common reason AI outputs disappoint is vague prompting — asking "write me a caption" instead of "write me a 3-sentence Instagram caption for a lifestyle brand targeting 25-35 year old women, in a warm conversational tone, ending with a question to drive comments." AI models like ChatGPT, Claude, and Gemini don't guess at context; they work with what they're given. Research on <a href="https://arxiv.org/abs/2201.11903" style="color:#7c3aed;text-decoration:none">chain-of-thought prompting</a> from Google and Stanford found that structuring prompts with explicit role assignment, task definition, and output format improves response quality by 40% or more across complex tasks.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a High-Quality AI Prompt</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Every high-performing AI prompt includes four components: a role assignment that tells the model what expertise to draw on ("You are an experienced YouTube SEO specialist"), a clearly scoped task with specific constraints, an output format specification (bullet list, paragraph, table), and at least one example of the desired style or quality. Adding context about the intended audience and any formats to avoid dramatically reduces the iteration cycles needed to get usable output — and saves real time at scale.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Generator for Consistent AI Output</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your task, target audience, and preferred output format and the generator builds a structured prompt ready to paste into ChatGPT, Claude, or Gemini. Save prompts that produce great outputs as templates — the same prompt structure works repeatedly for the same task type. For complex multi-step tasks, break the work into a prompt sequence: generate an outline first, then expand each section in a separate prompt. Chained prompts consistently outperform single long prompts for structured content creation.</p>`,

  "instagram-engagement-calculator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Is a Good Instagram Engagement Rate?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">A healthy Instagram engagement rate sits between 1% and 3% for accounts with 10,000 to 100,000 followers — and above 3% for accounts under 10,000, where audiences tend to be more tightly connected to the creator. Below 0.5% is a red flag that usually indicates an audience mismatch, purchased followers, or content that consistently fails to deliver on what the account's bio promises. <a href="https://sproutsocial.com/insights/instagram-stats/" style="color:#7c3aed;text-decoration:none">Sprout Social's 2025 benchmarks</a> show the average engagement rate across all Instagram account sizes has stabilized at around 0.98% for feed posts and 2.1% for Reels.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Engagement Rate Matters More Than Follower Count</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram's algorithm distributes content based on engagement signals, not follower size — a post from a 5,000-follower account with 8% engagement reaches more non-followers through the Explore page than a post from a 500,000-follower account at 0.3% engagement. Brands that run influencer campaigns have largely shifted to evaluating creators on engagement rate rather than raw reach, because engagement predicts actual influence. A 2% rate on 20,000 followers is more commercially valuable than a 0.2% rate on 200,000.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use Your Engagement Score to Grow</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your likes, comments, saves, and follower count to calculate your engagement rate, then benchmark it against niche averages. If you're below 1%, audit your last 10 posts for content-audience mismatch — the most common cause. If you're above 3%, identify the specific content formats driving that number and build your next month's content calendar around them. Saves are the strongest single engagement signal on Instagram in 2026, worth more to the algorithm than likes or comments.</p>`,

  "instagram-username-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Your Instagram Username Affects Discoverability</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram's search algorithm uses your username as a primary ranking signal when people search for accounts in your niche. A username that includes a relevant keyword — like @fitnesswithsara or @techreviewer — consistently surfaces higher in Instagram's Explore search than abstract handles for the same search terms. Instagram usernames are capped at 30 characters and can be changed, but frequent changes reset your search ranking history, making early optimization far cheaper than rebranding after you've built an audience.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a Strong Instagram Username</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective Instagram usernames are easy to say aloud and spell from memory, niche-relevant without being so narrow they limit your growth, free of random numbers and underscores that signal inauthenticity, and available across TikTok and YouTube so you can maintain consistent branding across platforms. Creators who own the same handle across all three major platforms build cross-platform recognition faster — every mention, tag, and collaboration reinforces the same name in the audience's memory.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Choose a Username Worth Keeping</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche, name preferences, and tone and generate several rounds until one clicks. Before committing, search Instagram for the exact handle and close variations to avoid audience confusion with existing accounts. Then verify availability on TikTok and YouTube simultaneously using a handle-checker tool. A username you can own across every platform is worth generating a few extra rounds to find — consistency compounds over time in a way that a clever-but-isolated handle never does.</p>`,

  "instagram-money-calculator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How Instagram Monetization Actually Works in 2026</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram offers multiple monetization paths: brand partnerships (sponsored posts and Reels), affiliate commissions, Instagram's Reels bonus program, and digital product sales through the link in bio. Brand deals are the primary income source for most creators — and rates have shifted significantly toward engagement-based pricing. According to <a href="https://influencermarketinghub.com/influencer-rates/" style="color:#7c3aed;text-decoration:none">Influencer Marketing Hub's 2025 benchmarks</a>, nano creators (1,000 to 10,000 followers) earn $10 to $100 per post, micro creators (10,000 to 100,000) earn $100 to $500, and mid-tier creators (100,000 to 500,000) earn $500 to $5,000 per post.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Affects Your Instagram Earning Potential Most</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Engagement rate matters more than follower count for brand deals on Instagram. A creator with 15,000 highly engaged followers in a specific niche regularly earns more per post than one with 150,000 passive followers in a broad category — because brands pay for actual influence, not just reach. Niche also matters enormously: finance, beauty, and fitness creators command 2 to 3x higher rates than general lifestyle creators at the same follower count, because their audiences have demonstrated purchasing intent in high-margin categories.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Calculator to Plan Your Instagram Income</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your follower count and engagement rate to see projected earnings across brand deals, affiliate commissions, and platform bonuses. Use the output as a baseline for brand deal negotiations — knowing your market rate prevents undercharging by 50 to 70%, which is how most new creators leave money on the table. If your calculated rate feels low, focus on improving your engagement rate first — a 2% engagement jump often doubles your brand deal value more effectively than gaining 10,000 new followers.</p>`,

  "instagram-content-planner": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Consistent Posting Beats Going Viral on Instagram</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">A single viral post drives a temporary follower spike that rarely sticks — most of those followers came for the trend, not for you. Consistent posting at 3 to 5 times per week builds the kind of audience that actually converts: people who follow because they want to see your next post, not because an algorithm served them one anomaly. According to <a href="https://later.com/blog/how-often-to-post-on-instagram/" style="color:#7c3aed;text-decoration:none">Later's Instagram benchmarks</a>, accounts that post consistently at least 4 times per week see 2x more profile visits and 40% faster follower growth than accounts that post sporadically, even when the sporadic posts perform individually well.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What the Best Instagram Content Mix Looks Like</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The 60/30/10 content mix is the most reliable framework for sustainable Instagram growth: 60% educational or entertaining value content that serves your audience, 30% engagement-focused content (polls, questions, debate-starters) that builds community, and 10% promotional content that drives a direct action. Accounts that lead too heavily with promotional content see engagement rates drop sharply as Instagram's algorithm deprioritizes content that doesn't generate organic interaction from existing followers.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Content Planner to Stay Consistent</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche and target audience and the planner generates a full week of Instagram content — Reels ideas, carousel topics, and Stories prompts — with captions, hashtag sets, and optimal posting times for your audience timezone. Batch-create content on one day per week using the plan as your brief, then schedule posts using Later or Meta Business Suite to maintain consistency without daily effort. Creators who batch and schedule consistently outperform those who post reactively in every metric that matters.</p>`,

  "instagram-reel-idea-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Kinds of Reels Actually Get Reach on Instagram in 2026?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram Reels are now the platform's primary growth engine — <a href="https://about.fb.com/news/2023/10/metas-q3-2023-earnings/" style="color:#7c3aed;text-decoration:none">Meta's own data</a> shows that Reels generate 91% more reach than static posts and drive 3x the follower growth rate for accounts that post them consistently. The formats that drive the highest watch-through rates are fast-paced tutorials (information-dense, every second earns its keep), relatable POV content (immediate emotional recognition), and transformation reveals (strong visual payoff that rewards watching to the end). Content that makes viewers save or share gets distributed far beyond the original follower base.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How Instagram's Algorithm Decides Which Reels to Push</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram's Reels algorithm evaluates content on four signals in rough order of importance: completion rate (did viewers watch to the end?), saves (the strongest quality signal), shares (the strongest reach signal), and comments. Likes matter least of the five main engagement types. A Reel with 200 saves and 50 shares will be distributed far more aggressively than one with 2,000 likes and no saves — because saves and shares indicate that the content has standalone value beyond a passive scroll.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use Generated Ideas in Your Content Calendar</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche and target audience to generate Reel ideas with suggested hooks, format types, and hashtag categories. Sort ideas by the engagement trigger each one is designed to drive — save-worthy ideas for authority content, share-worthy ideas for reach, comment-drivers for community building. Aim for at least one Reel per week that's explicitly designed to be saved (a checklist, a template, a "screenshot this" moment) — saves are the most under-optimized growth lever most Instagram creators ignore entirely.</p>`,

  "instagram-hook-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why the First Second of Your Reel Determines Its Reach</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram's algorithm uses early watch-through rate as the primary signal for Reels distribution — and most viewers decide whether to keep watching in the first 1 to 2 seconds. A Reel that loses 70% of viewers in the opening moment is unlikely to be pushed to non-followers regardless of how strong the rest of the content is. Strong hooks increase completion rate, which directly increases Explore page distribution. According to Meta's creator tools data, Reels with high completion rates in the first test audience receive 3 to 5x more non-follower distribution than those with high early drop-off.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a Scroll-Stopping Instagram Hook</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective Instagram hooks use one of four triggers: a bold visual that looks different from everything else in the feed (unexpected color, movement, or framing), a text overlay that opens a loop the viewer needs to watch to close, a direct address that calls out the viewer's specific situation ("If you have under 1,000 Instagram followers..."), or a bold claim that creates immediate tension. Generic openers like "Today I'm going to talk about..." lose viewers before the first sentence ends.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use Generated Hooks Across Different Content Formats</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your topic, audience, and content format — Reel, carousel, or caption — and the generator produces hooks across multiple trigger types. For Reels, test your hook as both a visual opening and as on-screen text in the first frame. Record three delivery variations and watch them back without sound: if the hook still makes you want to keep watching on mute, it's strong enough to compete in a feed where 60% of viewers never unmute.</p>`,

  "instagram-bio-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Your Instagram Bio Controls Your Follow Rate</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Most Instagram followers are won or lost at the profile page, not in the feed. When a Reel or post lands in front of a new viewer and they tap your profile, your bio has 3 seconds to answer "why should I follow this account?" Instagram's 150-character bio limit forces you to be ruthlessly specific. Accounts with a clear niche declaration, a specific value promise, and a CTA convert profile visitors to followers at 20 to 40% higher rates than accounts with vague or generic bios, according to conversion data tracked across creator cohorts by <a href="https://later.com" style="color:#7c3aed;text-decoration:none">Later</a>.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Every High-Converting Instagram Bio Contains</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective Instagram bios answer three questions in three lines: what you do and for whom (line one), why you're credible or what makes you different (line two), and what the visitor should do next — usually a link in bio CTA (line three). A keyword in your bio also helps Instagram's search algorithm surface your account for relevant queries. Emojis used as bullet points — one per line — improve visual scanning without cluttering the limited character space.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Write a Bio That Converts Visitors to Followers</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche, target audience, and what makes your account worth following, and the generator produces five bio variations across different tones. Pick the one that sounds most like you, then A/B test it against your current bio by switching for two weeks and comparing the profile-to-follower conversion rate in Instagram Insights. If your current bio converts at under 10% of profile visitors, a single bio rewrite is likely the highest-leverage change you can make to your entire Instagram strategy.</p>`,

  "instagram-hashtag-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Do Instagram Hashtags Still Work After the 2025 Update?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram hashtags still drive reach — but the strategy changed significantly in late 2025 when Instagram officially recommended using 3 to 5 highly relevant hashtags instead of the previous 30-hashtag approach. The platform's algorithm shifted to prioritizing content quality signals (saves, shares, completion rate) over keyword stuffing, making niche-specific hashtags more powerful than ever for targeted reach while making mega-hashtags like #instagood effectively useless. <a href="https://creators.instagram.com" style="color:#7c3aed;text-decoration:none">Instagram's Creator documentation</a> now explicitly cautions against using irrelevant hashtags to chase reach.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">The Instagram Hashtag Strategy That Works in 2026</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective Instagram hashtag strategy for 2026 uses a three-tier mix: 1 to 2 broad category tags (500K to 5M posts) for general topic association, 2 to 3 niche-specific tags (50K to 500K posts) for targeted reach where your ideal audience actually browses, and 1 to 2 micro-niche tags (under 50K posts) where newer content has the best chance of surfacing in the top posts section. Avoid any tag that feels like a stretch — the algorithm evaluates tag relevance and penalizes mismatches.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Build Your Hashtag Set With the Generator</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your post topic and niche and the generator produces a tiered hashtag set matched to the 2026 best-practice approach. Copy the top 3 to 5 into your post caption and rotate sets across posts to discover which combinations drive the most Explore page reach in your specific niche. Check Instagram's built-in Insights after 48 hours to see how much reach came from hashtags versus non-followers — that split tells you whether your hashtag strategy is pulling in new audiences or just reaching people who already follow you.</p>`,

  "instagram-caption-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Do Instagram Captions Affect How the Algorithm Distributes Your Posts?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Instagram's algorithm reads your caption text to classify your content's topic and match it to the right audience — making captions a direct on-page SEO signal for Instagram's internal search and Explore feed. Beyond classification, captions that pose a question or create unresolved tension drive comments, which is one of Instagram's strongest engagement signals for content distribution. <a href="https://sproutsocial.com/insights/instagram-stats/" style="color:#7c3aed;text-decoration:none">Sprout Social's research</a> found that captions ending with a direct question generate 3x more comments than descriptive captions of the same length.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a High-Engagement Instagram Caption</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Only the first 125 characters of an Instagram caption display before the "more" tap — making the opening line the most critical copy real estate on the entire post. The strongest Instagram captions open with a hook that creates an information gap ("The Instagram strategy that doubled my reach — and it's not what you think"), then deliver the value in 2 to 3 short paragraphs, then close with a specific engagement prompt. Saves are the most algorithmically powerful interaction in 2026, so captions that include a "save this for later" prompt consistently outperform those that don't.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Caption Generator Across All Post Formats</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your post topic, target audience, and format — Reel, carousel, or single image — and the generator produces captions with a strong opening hook, body content, integrated hashtags, and an engagement CTA tailored to the format. For Reels, prioritize captions that create curiosity about what the video contains. For carousels, use captions that tease the most valuable slide. For single images, lead with the most surprising or counterintuitive statement about the subject.</p>`,

  "tiktok-username-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Your TikTok Username Affects More Than Your Brand</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Your TikTok username is how people find, tag, and share your profile — and it's searchable within TikTok's discover system. A username that reflects your niche helps TikTok's algorithm associate your account with relevant content categories, giving you a small but compounding discoverability advantage from day one. TikTok usernames are capped at 24 characters and can only be changed once every 30 days, so getting it right before you build an audience saves you from a painful rebrand later.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a TikTok Username Actually Work</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The strongest TikTok usernames are short (under 15 characters), phonetically easy to say aloud, free of random numbers and underscores that signal a placeholder account, and ideally available across Instagram and YouTube too. Creators who maintain a consistent handle across all three platforms benefit from cross-platform recognition — viewers who find you on TikTok can locate your other channels instantly, compounding your audience growth without any extra effort.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Find a Username Worth Keeping</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche, name preferences, and desired tone (fun, professional, or mysterious) and generate several rounds of options. Before committing, search TikTok for the exact username and one-letter variations — you don't want to build a following under a name that gets confused with an existing account. Then check Instagram and YouTube availability. A username you can own everywhere is worth generating a few extra rounds to find.</p>`,

  "tiktok-bio-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Your TikTok Bio Determines Your Follow Rate</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Most TikTok views come from the For You Page — meaning the majority of people who see your content have never visited your profile. When a video lands in someone's feed and they're curious enough to tap your name, your bio has roughly three seconds to answer "why should I follow you?" TikTok's 80-character bio limit forces brutal clarity. A compelling bio converts profile visitors to followers at 15 to 25% higher rates than a generic or empty one, according to creator growth data tracked across multiple TikTok growth communities.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Every High-Converting TikTok Bio Needs</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective TikTok bios follow a three-line formula: line one states your niche and who you help, line two gives a specific value promise or proof point (posts per week, results achieved, credentials), and line three delivers a clear CTA pointing to your link in bio. Emojis used sparingly — one per line maximum — improve visual scanning speed without making the bio look unprofessional. Every word that doesn't earn its place in 80 characters is a follow you didn't get.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Write a Bio That Converts</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche, target audience, and what you post and the generator produces five bio options across different tones — witty, professional, curiosity-driven, results-focused, and conversational. Pick the one that sounds most like you, then test it for one to two weeks and check your profile visit-to-follower conversion rate in TikTok Analytics. If it's below 10%, regenerate with a more specific value promise or a stronger CTA.</p>`,

  "tiktok-money-calculator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How TikTok Actually Pays Creators in 2026</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">TikTok's Creator Rewards Program — which replaced the original Creator Fund in 2024 — pays eligible creators $0.40 to $1.00 per 1,000 qualified views on videos over one minute long. That's a significant improvement from the old Creator Fund's $0.02 to $0.04 per 1,000 views. To qualify, creators need at least 10,000 followers, 100,000 views in the past 30 days, and must post original content. Views under one minute, replays, and views from the creator's own account don't count toward qualified view totals.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Affects Your TikTok Earning Potential Most</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Ad revenue from the Creator Rewards Program is rarely a creator's primary income on TikTok. The real money is in brand deals, which scale with both follower count and engagement rate. Nano creators (1,000 to 10,000 followers) typically earn $25 to $150 per sponsored post. Micro creators (10,000 to 100,000) earn $150 to $1,000. A highly engaged 50,000-follower account often earns more from brand partnerships than a disengaged 500,000-follower account — because brands increasingly pay for influence, not just reach.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Calculator to Plan Your TikTok Income</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your monthly view count and follower tier to see projected Creator Rewards earnings alongside estimated brand deal potential. Use the result to set realistic income expectations and identify your fastest path to meaningful revenue — for most creators under 50,000 followers, brand deals and affiliate partnerships outperform platform payouts by a factor of 3 to 5, so building engagement over raw views is always the better investment.</p>`,

  "tiktok-hashtag-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Do TikTok Hashtags Still Matter in 2026?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">TikTok hashtags still influence how the algorithm classifies and distributes your content — but the old strategy of piling on #FYP and #ForYou is dead. Those tags are so overused they provide zero classification signal. What actually works is a mix of 3 to 5 targeted hashtags: one or two broad category tags to establish your content type, two or three niche-specific tags to reach your target audience, and one trending tag if it genuinely fits your content. <a href="https://newsroom.tiktok.com" style="color:#7c3aed;text-decoration:none">TikTok's own creator guidance</a> recommends keeping hashtag use focused rather than exhaustive.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">The TikTok Hashtag Strategy That Actually Increases Reach</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Niche hashtags consistently outperform mega-hashtags on TikTok because competition is lower and audience match is stronger. A video tagged #FitnessMotivation (45 billion views) has almost zero chance of surfacing through that tag. The same video tagged #CalisthenicsForBeginners (200 million views) reaches a far more targeted audience who are actively interested in exactly that content. Strong hashtag strategy means finding the tags where your ideal viewer actually browses, not the ones with the most total posts.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Build the Right TikTok Hashtag Set</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your video topic and niche and the generator produces a tiered hashtag set: broad, mid-range, and niche. Pick 3 to 5 and add them to your caption or comments — TikTok reads both locations equally. Rotate your hashtag sets across videos to discover which combinations drive the highest For You Page distribution, and check TikTok's Discover tab weekly for emerging niche hashtags in your content category before they become oversaturated.</p>`,

  "tiktok-caption-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Do TikTok Captions Actually Affect How Your Video Performs?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">TikTok's algorithm reads captions as a classification signal — the words you use help TikTok understand your content's topic and match it to the right audience. Beyond algorithm signals, captions that pose a question or tease an unresolved tension drive comments, and comments are one of the strongest engagement signals for For You Page distribution. A well-written caption can turn a moderately performing video into a conversation thread that keeps pushing reach long after the first 24 hours.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a High-Engagement TikTok Caption</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective TikTok captions do one of three things: ask a direct question that invites debate ("Which side are you on?"), create curiosity about something not shown in the video ("The part I didn't show you is in the comments"), or validate a shared experience that makes viewers tag a friend. Only the first 125 characters display before the "more" tap, so the hook has to be in that opening line. Captions that prompt tagging consistently drive 2 to 3x more reach than purely descriptive ones.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Get the Most From the Caption Generator</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your video topic, target audience, and preferred tone — educational, entertaining, or conversational — and the generator produces three caption options with integrated hashtags and a CTA. Review each option for the opening 125 characters first: that's what decides whether a viewer reads on or scrolls. Pair the strongest opening with 3 to 5 hashtags from the TikTok Hashtag Generator, then post and monitor comment velocity in the first hour as your early signal of distribution potential.</p>`,

  "tiktok-viral-idea-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Actually Makes Content Go Viral on TikTok?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">TikTok's For You Page algorithm distributes content based on three engagement signals above all others: completion rate (how many viewers watched to the end), shares (the strongest signal of external value), and saves (indicating content worth returning to). Ideas that generate virality almost always tap one of three psychological triggers: strong relatability ("this is literally me"), surprising information ("I didn't know this"), or entertainment that rewards re-watching. Understanding which trigger fits your niche is more valuable than chasing any specific format or trend.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What TikTok Content Formats Perform Best in 2026</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The formats with the strongest organic reach in 2026 combine education with entertainment: tutorials that feel like a friend showing you something, "things I wish I knew" lists that validate real pain points, and before-and-after transformations with a strong visual payoff. According to <a href="https://www.tiktok.com/creators/creator-portal" style="color:#7c3aed;text-decoration:none">TikTok's Creator Portal</a>, creators who post a consistent mix of educational and entertaining content see 40% higher average For You Page distribution than those who focus on a single format.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Turn Generated Ideas Into a Consistent Content Calendar</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche and channel description and generate 10 ideas at a time. Sort them into three buckets: educational (build authority), entertaining (drive shares), and relatable (drive comments). Aim for a 3:2:1 ratio across your weekly posts. The ideas that immediately make you think "yes, I have something to say about this" are the ones to film first — authentic familiarity with a topic shows in the first three seconds and is impossible to fake.</p>`,

  "tiktok-script-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why TikTok Scripts Are Different From YouTube Scripts</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">TikTok's completion rate algorithm punishes any moment of friction or padding. Where a YouTube script can build context over several minutes before getting to the point, a TikTok script has 1 to 3 seconds to hook, then must deliver value at a pace that earns every additional second of watch time. The optimal TikTok video length for highest completion rate is 21 to 34 seconds — short enough to watch twice, long enough to deliver a complete idea. Every word in a TikTok script needs to justify its place.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Structure Works Best for TikTok Retention</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">High-retention TikTok scripts follow a four-beat structure: hook (a statement or question that creates immediate tension), setup (the fastest possible context), payoff (the value, insight, or punchline), and loop trigger (something at the end that makes viewers watch again — a callback to the hook or an unresolved question). <a href="https://www.tiktok.com/creators/creator-portal" style="color:#7c3aed;text-decoration:none">TikTok's own creator data</a> shows that videos with a strong loop trigger — content that rewards re-watching — are distributed 2x more aggressively by the algorithm than linear videos.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Adapt Generated Scripts to Sound Like You</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your topic, target audience, and tone, then use the generated script as a structural skeleton rather than a verbatim read. Record yourself delivering the hook section multiple ways until one feels natural — that's your real voice. Replace any words that feel unnatural to say out loud with your own language. The script handles the structure and timing; your delivery handles the personality. TikTok audiences can detect scripted stiffness instantly, and they swipe away from it.</p>`,

  "tiktok-hook-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why the First 3 Seconds Determine Everything on TikTok</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">TikTok's For You Page algorithm makes its first distribution decision based on the earliest engagement signals — and most of those signals are determined in the first 3 seconds. If viewers swipe away immediately, the algorithm stops pushing the video. If they watch past the hook, it tests with a larger audience. <a href="https://www.tiktok.com/creators/creator-portal" style="color:#7c3aed;text-decoration:none">TikTok's creator research</a> found that videos retaining at least 65% of viewers through the first 3 seconds receive dramatically more For You Page distribution than those that don't. Your hook isn't just creative — it's algorithmic.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a TikTok Hook Stop the Scroll</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective TikTok hooks use one of five psychological triggers: a bold controversial statement that creates instant tension, a direct address of a specific pain point the viewer has felt, a surprising fact that breaks an assumption, a visual pattern interrupt that looks different from everything else in the feed, or an open loop that poses a question only the rest of the video resolves. The worst hooks are generic — "Today I'm going to show you how to..." tells the viewer nothing they couldn't have guessed.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use Generated Hooks Effectively</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your topic and desired tone and the generator produces 10 hook options across different trigger types. Review each one and ask: would this make me stop scrolling? If the answer is yes, record it multiple ways — delivery matters as much as the words. Test two different hooks on the same video concept in back-to-back posts and compare 3-second retention rates in TikTok Analytics. The hook with the higher retention rate is your template for that content type.</p>`,

  "youtube-thumbnail-downloader": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Thumbnail Research Is as Important as Keyword Research</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Thumbnails control click-through rate — and CTR is one of YouTube's strongest ranking signals. <a href="https://creatoracademy.youtube.com" style="color:#7c3aed;text-decoration:none">YouTube's own data</a> shows that 90% of the best-performing videos on the platform use custom thumbnails. Studying what works in your niche before designing your own is one of the highest-leverage moves a creator can make. Downloading competitor thumbnails lets you reverse-engineer exactly what visual patterns are driving clicks in your specific topic area right now.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Which Thumbnail Resolution to Download and Why</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube stores thumbnails in four resolutions: maxresdefault (1280x720, the full HD version), hqdefault (480x360), mqdefault (320x180), and sddefault (640x480). Always download maxresdefault for reference work — it's the version YouTube displays in search results and on smart TVs, so it shows you the thumbnail exactly as most viewers see it. Smaller resolutions compress detail and make color and text analysis unreliable for design purposes.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Turn Downloaded Thumbnails Into Better Designs</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Paste the YouTube video URL and download the maxresdefault thumbnail in one click. Collect 10 to 15 thumbnails from the top-ranking videos in your niche and look for repeating patterns: face expressions, color schemes, text placement, and contrast choices. Use those patterns as your baseline — then add one differentiating element that makes yours stand out in the same feed. Testing two thumbnail variants using YouTube Studio's A/B feature can lift CTR by 20 to 40%.</p>`,

  "youtube-engagement-calculator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Is a Good YouTube Engagement Rate?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">A healthy YouTube engagement rate — combining likes, comments, and shares relative to total views — sits between 3% and 6% for most channels. Below 1% is a red flag: it typically signals that your content is reaching the wrong audience, your thumbnails are misleading viewers about the video's content, or your retention is dropping before the call-to-action. YouTube's algorithm uses engagement as a quality signal to decide whether to keep recommending a video after its initial push.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Engagement Rate Matters More Than Subscriber Count</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">A channel with 10,000 subscribers and 5% engagement reaches more new viewers through recommendations than a channel with 100,000 subscribers at 0.3% engagement. YouTube's recommendation engine distributes videos to non-subscribers based on performance signals — and engagement rate is one of the strongest. Brands and sponsorship platforms also evaluate channels on engagement, not just subscriber counts. A 4% rate on a small channel beats a 0.5% rate on a large one for most sponsorship calculations.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use Your Engagement Score to Improve Your Channel</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your views, likes, and comments to calculate your engagement rate, then benchmark it against your niche average. If you're below 2%, audit your last 10 videos for thumbnail-to-content mismatch — the most common cause of low engagement. If you're above 5%, identify which video topics and formats drove that number and build your next content cluster around them. Engagement is a diagnostic, not just a metric.</p>`,

  "youtube-cpm-calculator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Is CPM and Why Does It Matter to YouTube Creators?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">CPM (cost per mille) is what advertisers pay YouTube per 1,000 ad impressions — before YouTube takes its 45% cut. The number creators actually receive is called RPM (revenue per mille), which reflects their share after that split. Average YouTube CPM ranges from $2 to $15 depending on niche, audience geography, and time of year. Finance, legal, and SaaS content commands CPMs of $12 to $25, while gaming and entertainment averages $2 to $5, according to data from creator income reports tracked by <a href="https://www.streamscharts.com" style="color:#7c3aed;text-decoration:none">StreamsCharts</a>.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Affects Your YouTube CPM the Most</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Four factors move CPM more than anything else: your content niche (advertisers bid more for business-intent audiences), your audience's country (US and UK viewers attract 3 to 5x higher CPMs than global averages), the season (Q4 ad spend pushes CPMs 30 to 50% above Q1 levels), and your video length (videos over 8 minutes qualify for mid-roll ads, multiplying impressions per view). Optimizing for watch time in a high-CPM niche is the fastest path to meaningful ad revenue.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Calculate Your Actual Earnings From CPM</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your CPM rate, monthly view count, and estimated ad impression rate (typically 50 to 60% of total views). The calculator outputs your projected monthly earnings after YouTube's 45% revenue share. Use the result as a planning baseline — then test whether moving to a higher-CPM topic cluster would increase your revenue without requiring more views. Sometimes a niche shift is worth more than doubling your upload frequency.</p>`,

  "youtube-shorts-revenue-calculator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How YouTube Shorts Monetization Actually Works</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube Shorts monetization works differently from long-form ad revenue. Instead of CPM-based ads, Shorts creators earn through the YouTube Partner Program's Shorts ad revenue pool — a shared pool that YouTube distributes to eligible creators based on their share of total Shorts views in a given month. Creators need 500 subscribers, 3 public uploads in 90 days, and 3,000 watch hours on long-form videos (or 3 million Shorts views in 90 days) to qualify. Typical Shorts RPM ranges from $0.03 to $0.08 per 1,000 views.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How Much Can You Actually Earn From YouTube Shorts?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Shorts ad revenue is lower per view than long-form content — the real monetization opportunity is using Shorts as a discovery engine to grow a long-form audience where CPM rates are significantly higher. Creators who use Shorts to drive subscriptions and then convert those subscribers to long-form viewers consistently earn more total revenue than those who treat Shorts as a standalone income stream. The math on 10 million Shorts views at $0.05 RPM ($500) vs. 100,000 long-form views at $5 RPM ($500) shows they're equivalent — but long-form builds the audience that compounds.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Calculator to Plan Your Shorts Strategy</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your monthly Shorts view count and content niche to see projected ad revenue. Use the result alongside your long-form earnings estimate to understand the actual revenue contribution of Shorts in your channel mix. If Shorts are driving 80% of your views but less than 20% of your revenue, that's a strong signal to use them as a top-of-funnel growth tool — not your primary monetization vehicle.</p>`,

  "youtube-seo-score-checker": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Does a YouTube SEO Score Actually Measure?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">A YouTube SEO score measures how well a video's on-page elements are optimized for search discoverability — covering title keyword placement, description quality, tag relevance, category selection, and thumbnail alt text. These factors tell YouTube's algorithm what your video is about before it has any performance data to work with. <a href="https://backlinko.com/youtube-seo" style="color:#7c3aed;text-decoration:none">Backlinko's YouTube SEO study</a> found that keyword-optimized titles and descriptions are the two strongest on-page ranking factors, influencing both YouTube search placement and Google Video results.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Which YouTube SEO Factors Matter Most</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Of all YouTube SEO factors, three have the most measurable impact on rankings: exact-match keyword in the title (the strongest on-page signal), keyword in the first 150 characters of the description (the above-the-fold text YouTube and Google index most heavily), and video tags that match the primary keyword plus 4 to 6 related terms. Getting these three right before publishing gives a new video the best possible starting position in search before watch time data accumulates.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Fix a Low YouTube SEO Score</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your video title, description, and tags to receive a score and a prioritized list of fixes. Address issues in order of impact: title first, then description, then tags. If your title is already optimized, check whether your primary keyword appears within the first two sentences of your description — most low scores trace back to descriptions that bury the keyword or use boilerplate copy across multiple videos. Updating descriptions on underperforming videos can revive rankings within days.</p>`,

  "youtube-title-analyzer": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What a YouTube Title Analyzer Actually Measures</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">A YouTube title analyzer scores your title across five dimensions that directly predict click-through rate: keyword strength (is your primary search term present and near the front?), character length (47 to 60 characters is the optimal range before mobile truncation), power word presence (emotional triggers that increase clicks), number usage (titles with specific numbers outperform vague alternatives), and search intent alignment (does the title match what viewers are actually looking for?). Each dimension maps to a measurable CTR impact.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Which Title Factors Drive the Most Clicks</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Research from <a href="https://coschedule.com/headline-analyzer" style="color:#7c3aed;text-decoration:none">CoSchedule's headline analysis</a> of millions of titles found that headlines combining emotional trigger words with a clear, specific benefit generate up to 36% more clicks than purely descriptive alternatives. On YouTube specifically, titles that include a number ("7 Ways to..."), a strong result promise ("Get 1,000 Subscribers"), or a curiosity gap ("What Nobody Tells You About...") consistently outperform generic statement titles across every niche studied.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Act on Your Title Analysis</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Paste your draft title and review the score breakdown by category. Fix the lowest-scoring dimension first — usually it's either keyword placement (move it to the first 4 words) or length (trim to under 60 characters). Once you have two strong variants, run them through the analyzer side by side, then A/B test the top two using YouTube Studio's experiment feature. A single title optimization can improve CTR by 20 to 40% on an existing video without changing a frame of footage.</p>`,

  "youtube-channel-name-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Your Channel Name Is a Growth Decision, Not Just a Branding One</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Your YouTube channel name appears in search results, on your handle, and in every notification your subscribers receive — making it one of the most visible pieces of your brand. YouTube's search algorithm uses channel names as a relevance signal, meaning a niche-specific name can help new viewers find you through keyword searches before you've posted a single video. Channels with clear, searchable names grow their subscriber base faster in the early stages than those with abstract or generic names.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a YouTube Channel Name Actually Work</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The strongest YouTube channel names share four traits: they're under 20 characters (so they display in full on mobile notifications), they're easy to spell phonetically, they hint at the content niche, and they're available across major social platforms. Consistency across YouTube, Instagram, and TikTok builds brand recognition that turns casual viewers into cross-platform followers — a compounding advantage that generic or platform-specific names can't match.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Generator to Find a Name Worth Keeping</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche and target audience, then generate multiple rounds until a name clicks. Before committing, search YouTube for the exact name and close variations — you don't want to build an audience on a name that's already claimed nearby. Then check Instagram and TikTok handle availability using Namecheckr or a quick platform search. A name you can own everywhere is worth waiting for.</p>`,

  "youtube-video-idea-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Kinds of YouTube Video Ideas Actually Get Views?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube distributes content through two primary channels: search (viewers actively looking for something) and browse (YouTube recommending videos to passive viewers). Search-optimized videos — tutorials, comparisons, and "how to" content — are the fastest way for new channels to get consistent views because they match real queries. Browse-friendly content like listicles and opinion pieces works better once a channel has an established subscriber base that YouTube can use as a seed audience for recommendations.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How YouTube Decides Which Video Ideas to Reward</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube's algorithm evaluates ideas indirectly through the performance signals they generate — CTR, watch time, and audience satisfaction surveys. Topics with proven search demand and low competition give new creators the best shot at ranking. According to <a href="https://backlinko.com/youtube-seo" style="color:#7c3aed;text-decoration:none">Backlinko's YouTube SEO research</a>, targeting keywords with at least 100 monthly searches but fewer than 10 well-optimized competing videos is the most reliable path to first-page placement for channels under 10,000 subscribers.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Turn a Generated Idea Into a Video That Ranks</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche and channel focus, then filter the generated ideas by search intent — prioritize tutorials and "how to" formats if you're under 1,000 subscribers, then mix in entertainment and opinion content as your audience grows. Before filming, search the idea's core keyword on YouTube and watch the top 3 results to identify what the audience already got — then find the angle they missed. That gap is your video.</p>`,

  "youtube-money-calculator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How YouTube Actually Pays Creators</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube pays creators through the YouTube Partner Program, which splits ad revenue 55% to creators and 45% to YouTube. The actual number you see per 1,000 views is RPM (revenue per mille), which is your share after YouTube's cut. RPM varies dramatically by niche — finance and business content earns $12 to $20 RPM, while gaming and entertainment typically lands between $2 and $5, according to data aggregated by <a href="https://www.streamscharts.com" style="color:#7c3aed;text-decoration:none">StreamsCharts</a> and multiple creator income reports.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Affects Your YouTube Earnings the Most</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Three factors control your YouTube ad revenue more than anything else: your niche CPM (set by advertisers, not you), your ad impression rate (typically 40 to 60% of total views), and your average view duration. Longer videos earn more ad impressions per view — a 10-minute video can show two mid-roll ads versus none for a video under 8 minutes. Creators who optimize for watch time in high-CPM niches consistently earn 3 to 5x more per view than those who don't.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Calculator Accurately</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your monthly view count and select your content niche to get a realistic RPM-based earnings range. The calculator outputs a low and high estimate — real earnings fall somewhere between them depending on your audience's geography (US and UK viewers attract higher CPMs than global averages), your video length, and seasonal ad spend patterns (Q4 is consistently 30 to 50% higher than Q1).</p>`,

  "youtube-keyword-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why YouTube Keyword Research Is Different From Google</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube is the world's second-largest search engine, processing over 3 billion searches per month — but the way people search on YouTube is fundamentally different from Google. YouTube queries are more conversational, action-oriented, and visual: people search for "how to" and "best way to" far more than they do on Google. <a href="https://backlinko.com/youtube-seo" style="color:#7c3aed;text-decoration:none">Backlinko's YouTube research</a> found that 90% of top-ranking YouTube videos target keywords with clear tutorial or informational intent — making intent match the single most important factor in keyword selection.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Makes a High-Value YouTube Keyword</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">A high-value YouTube keyword combines three qualities: meaningful search volume (at least 100 monthly searches), manageable competition (fewer than 10 well-optimized videos on the first page), and strong viewer intent that matches your content format. Long-tail keywords — three to five words — are especially powerful for newer channels because they face less competition while still driving targeted, high-intent traffic that converts to subscribers at a much higher rate than broad terms.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Keywords You Find</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your niche or content topic and the generator surfaces keyword variations grouped by intent. Take your primary keyword and place it in the first 60 characters of your video title, in the first 25 words of your description, and as your first tag. Build a content cluster by targeting 5 to 10 related keywords across multiple videos — YouTube's algorithm rewards channels that establish topical authority within a niche, boosting all videos in that cluster over time.</p>`,

  "youtube-description-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Your YouTube Description Is an Underused SEO Asset</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube descriptions can be up to 5,000 characters, but most creators leave the majority blank. That's a missed opportunity — YouTube's algorithm reads your description to understand your video's topic, associate it with related searches, and determine which viewers to recommend it to. The first 150 characters appear in search results before the "show more" cutoff, making them the equivalent of a meta description for your video. Front-load your primary keyword and a clear value statement there.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What a High-Performing YouTube Description Actually Contains</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The strongest YouTube descriptions follow a consistent structure: an above-the-fold hook with the primary keyword in the first sentence, a 2 to 3 paragraph body that naturally includes secondary keywords, timestamped chapter links that increase session time, links to related videos or playlists, and a subscribe CTA. <a href="https://backlinko.com/youtube-seo" style="color:#7c3aed;text-decoration:none">Backlinko's analysis</a> found that videos with keyword-optimized descriptions rank significantly higher in both YouTube search and Google Video results.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Get the Most Out of the Description Generator</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your video title, main topic, and target keyword. The generator outputs a full description with the keyword placed in the first sentence and throughout the body at a natural density. Copy it into YouTube Studio and then add your own chapter timestamps — YouTube surfaces chapter-marked videos in Google Search snippets, giving you an extra visibility surface most creators never claim.</p>`,

  "youtube-hashtag-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Do Hashtags Actually Help YouTube Videos Get Views?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube hashtags drive discovery in two distinct ways: they appear as clickable links above your video title on desktop, and they feed into YouTube's topic classification system for the Shorts feed. <a href="https://support.google.com/youtube/answer/6390658" style="color:#7c3aed;text-decoration:none">YouTube's own guidelines</a> recommend using 3 to 5 focused hashtags per video — enough to improve discoverability without triggering the over-tagging penalty. Add more than 60 hashtags and YouTube automatically ignores all of them on that video.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Where to Put Your Hashtags for Maximum Impact</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Hashtags placed in your video description appear as clickable links above the video title — prime visibility real estate most creators overlook. Hashtags added directly to the title show even more prominently on mobile, where over 70% of YouTube watch time now occurs according to <a href="https://blog.youtube/news-and-events/youtube-at-15-by-the-numbers/" style="color:#7c3aed;text-decoration:none">YouTube's platform data</a>. For Shorts, hashtags in the description are the primary signal YouTube uses to categorize and distribute content in the dedicated Shorts feed.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Build the Right Hashtag Set With the Generator</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your video topic and the generator produces a tiered set: 1 to 2 broad channel-level hashtags, 2 to 3 topic-specific tags, and 1 niche tag. Copy the top 3 to 5 into your video description first — they'll appear above your title automatically. If you're posting a Short, include #Shorts as one of your tags. It significantly increases distribution in the dedicated Shorts feed.</p>`,

  "youtube-script-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Why Your Script Determines Your Watch Time</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Watch time is YouTube's most heavily weighted ranking signal — and your script controls it from the first second. YouTube's algorithm prioritizes videos that keep viewers watching longest, using average view duration and audience retention to decide which videos to recommend next. According to <a href="https://creatoracademy.youtube.com" style="color:#7c3aed;text-decoration:none">YouTube's Creator Academy</a>, channels that improve average view duration see a direct uplift in impressions from the recommendation engine. A better script means more watch time. More watch time means more reach.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What Every High-Retention YouTube Script Needs</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">High-retention YouTube scripts follow a consistent structure: a pattern-interrupt hook in the first 15 seconds, a value bridge that tells viewers exactly what they'll learn, and open loops throughout the body that delay resolution and keep people watching. <a href="https://www.tubebuddy.com/blog" style="color:#7c3aed;text-decoration:none">TubeBuddy's creator data</a> shows that videos with a strong opening hook retain significantly more viewers past the two-minute mark — the threshold where YouTube's algorithm starts treating a video as high-quality content.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Turn a Generated Script Into a Video People Watch</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your topic, target audience, and preferred tone, then use the generated script as a structural guide rather than a word-for-word read. The most natural YouTube videos blend a tight script with casual delivery — read the core points, then improvise the connective tissue between them. Always record the hook section as a polished read: if the first 30 seconds don't land, nothing else matters.</p>`,

  "youtube-tag-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">Do YouTube Tags Still Matter in 2026?</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">YouTube tags still matter — just differently than they did five years ago. YouTube's algorithm uses tags primarily to classify videos in ambiguous niches and to connect your content with related videos in the Suggested feed. According to <a href="https://support.google.com/youtube/answer/146402" style="color:#7c3aed;text-decoration:none">YouTube's own creator documentation</a>, tags are especially valuable when a keyword in your title is commonly misspelled — helping the algorithm surface your video for both spelling variations.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">The Tag Strategy That Actually Works</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">The most effective YouTube tag strategy mixes three tiers: 2 to 3 broad tags covering your main topic, 4 to 5 mid-tail tags targeting your specific angle, and 2 to 3 long-tail tags matching exact phrases your audience searches. <a href="https://backlinko.com/youtube-seo" style="color:#7c3aed;text-decoration:none">Backlinko's YouTube SEO study</a> found that videos using a mix of broad and specific tags consistently rank higher in both YouTube search and Google Video results than videos relying on a single tag type.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Get the Most Out of the Tag Generator</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your video's main keyword and the generator produces a tiered set of tags covering broad, mid-tail, and long-tail variations. Copy the full set into YouTube Studio's tag field — YouTube allows up to 500 characters total. Put your most important keyword as the first tag: YouTube gives slightly more weight to tags listed earlier in the sequence, so lead with the term you most want to rank for.</p>`,

  "youtube-title-generator": `
    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How Your YouTube Title Controls the Algorithm</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Your title is the first thing both viewers and YouTube's algorithm read. YouTube uses click-through rate as a primary signal for search rankings and recommendations — and your title drives CTR more than any other on-page factor. <a href="https://backlinko.com/youtube-seo" style="color:#7c3aed;text-decoration:none">Backlinko's analysis of 4 million YouTube videos</a> found title optimization is the strongest on-page ranking factor on the platform. Titles between 47 and 60 characters consistently perform best.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">What High-CTR YouTube Titles Have in Common</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">High-performing YouTube titles share a clear pattern: they lead with the primary keyword, include a number or a specific promise, and stay under 60 characters to avoid being cut off on mobile. Research from <a href="https://blog.hubspot.com/marketing/headline-formulas" style="color:#7c3aed;text-decoration:none">HubSpot and CoSchedule</a> shows that headlines combining emotional trigger words with a direct benefit see up to 36% higher CTR than purely descriptive alternatives. That's exactly the framework this generator applies to every title it produces.</p>

    <h2 style="font-size:1.35rem;font-weight:700;margin:2rem 0 0.75rem;color:#0f172a">How to Use the Generator to Find Your Best Title</h2>
    <p style="font-size:1.05rem;line-height:1.7;color:#374151;margin:0 0 1.25rem">Enter your topic or main keyword, then review all 10 title options before you pick one. Look for the title that leads with your keyword, makes a clear promise, and would make you click if you saw it in a feed. The real move: take your top two and A/B test them using YouTube Studio's built-in experiment feature. Channels that test titles consistently outperform those that guess.</p>`,

};

function buildToolBody(
  tool: { name: string; description: string; slug: string },
  categoryName: string,
  categorySlug: string,
): string {
  const faqs = buildToolFaqs(tool.name, categorySlug);
  const answerSections = TOOL_ANSWER_SECTIONS[tool.slug] ?? "";

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

    ${answerSections}

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

      // Optimised meta descriptions (140-160 chars): keyword-rich, benefit-led,
      // free + no-signup signal — overrides whatever is stored in the DB.
      const TOOL_META_DESCRIPTIONS: Record<string, string> = {
        // YouTube
        "youtube-title-generator":          "Generate SEO-optimized YouTube titles that boost clicks and search rankings. Free AI title generator delivers 10 proven title options for any topic instantly.",
        "youtube-tag-generator":            "Generate keyword-optimized YouTube tags that help videos rank in search. Free tag generator delivers 20 SEO-ready tags for any topic instantly. No signup.",
        "youtube-description-generator":    "Create YouTube descriptions with timestamps, keywords, and CTAs that improve rankings. Free description generator - professional results in seconds. No signup.",
        "youtube-channel-name-generator":   "Generate creative, brandable YouTube channel names for your niche. Free generator delivers 10+ unique, searchable ideas - find one that's memorable and yours.",
        "youtube-money-calculator":         "Calculate YouTube earnings by views, niche, and location. Free money calculator uses real CPM and RPM data by category - see your true earning potential.",
        "youtube-thumbnail-downloader":     "Download YouTube thumbnails in HD from any video URL instantly. Free thumbnail downloader grabs maxresdefault, hqdefault, and SD frames. No signup needed.",
        "youtube-hashtag-generator":        "Generate the best YouTube hashtags for any video topic. Free hashtag generator finds trending, niche-specific tags that improve discoverability and reach.",
        "youtube-shorts-revenue-calculator":"Estimate YouTube Shorts earnings by views and niche CPM rates. Free Shorts revenue calculator shows realistic income projections for short-form creators.",
        "youtube-video-idea-generator":     "Generate YouTube video ideas for your niche and trending topics. Free idea generator delivers 10+ content angles for any channel - beat creator's block.",
        "youtube-seo-score-checker":        "Analyze your YouTube video SEO and get a score with actionable fixes. Free SEO checker evaluates title, tags, and description to help your videos rank.",
        "youtube-cpm-calculator":           "Calculate YouTube CPM and RPM to benchmark your ad earnings. Free CPM calculator with niche-specific rate data - see what advertisers pay per 1,000 views.",
        "youtube-title-analyzer":           "Score your YouTube title for SEO and CTR. Free title analyzer rates keyword placement, length, and power words - improve click-through rate before publishing.",
        "youtube-keyword-generator":        "Find high-volume, low-competition YouTube keywords for any topic. Free keyword generator surfaces the best search terms to rank in YouTube and Google.",
        "youtube-script-generator":         "Create YouTube scripts with a viral hook, structured body, and strong CTA. Free script generator writes complete video scripts for any niche in minutes.",
        "youtube-engagement-calculator":    "Measure YouTube engagement rate from likes, comments, and shares. Free calculator benchmarks your channel against niche averages to spot top-performing videos.",
        "youtube-tag-extractor":            "See hidden tags on any YouTube video instantly. Free tag extractor reveals the exact keywords competitors use to rank - paste a URL, get results in seconds.",
        // TikTok
        "tiktok-viral-idea-generator":      "Generate trending TikTok video ideas for your niche. Free viral idea generator surfaces proven content angles and hooks built around what works on the FYP.",
        "tiktok-hook-generator":            "Generate proven TikTok hooks for the first 3 seconds of your video. Free hook generator uses question, shock, and story formulas to stop scrolling instantly.",
        "tiktok-script-generator":          "Generate TikTok scripts with a viral hook, structured body, and strong CTA. Free script generator writes complete, ready-to-film scripts for any niche.",
        "tiktok-hashtag-generator":         "Get trending TikTok hashtags that maximize For You Page reach. Free generator delivers viral, niche, and micro-tag mixes for any video topic - instantly.",
        "tiktok-caption-generator":         "Write TikTok captions that drive comments, shares, and follows. Free caption generator adds keywords, emojis, and hashtags for any video topic in seconds.",
        "tiktok-money-calculator":          "Estimate TikTok income from brand deals, Creator Fund, and live gifts. Free money calculator delivers niche-specific earnings projections by follower count.",
        "tiktok-bio-generator":             "Create a TikTok bio that converts profile visitors into followers. Free bio generator writes compelling copy with your niche, personality, and CTA in one click.",
        "tiktok-username-generator":        "Find a creative, brandable TikTok username for your niche. Free generator creates 10+ modern, memorable name ideas matched to your content style and brand.",
        // Instagram
        "instagram-hashtag-generator":      "Generate 30 Instagram hashtags using a proven tiered strategy. Free hashtag generator delivers broad, niche, and micro tags to maximize reach and impressions.",
        "instagram-caption-generator":      "Generate Instagram captions that drive comments, saves, and shares. Free generator produces ready-to-post copy for Reels, carousels, and static posts instantly.",
        "instagram-bio-generator":          "Create an Instagram bio that turns visitors into followers. Free bio generator writes keyword-rich copy with a clear CTA and personality matched to your niche.",
        "instagram-username-generator":     "Find creative, brandable Instagram usernames for your niche. Free generator creates 10+ memorable, searchable name ideas for your content style and brand.",
        "instagram-reel-idea-generator":    "Generate viral Instagram Reel ideas for your niche. Free idea generator delivers trending concepts, hooks, and formats designed to maximize reach and saves.",
        "instagram-hook-generator":         "Create scroll-stopping Instagram Reel hooks for the first 3 seconds. Free hook generator delivers proven question, shock, and story formulas that boost views.",
        "instagram-engagement-calculator":  "Calculate Instagram engagement rate from likes, comments, and saves. Free tool benchmarks your account against niche averages - see what content is working.",
        "instagram-money-calculator":       "Estimate Instagram income from brand deals, affiliate sales, and sponsorships. Free calculator gives niche-specific income projections by follower count.",
        "instagram-content-planner":        "Plan Instagram content with a calendar balancing Reels, carousels, stories, and posts. Free planner aligns your schedule with content pillars and growth goals.",
        // AI Tools
        "ai-prompt-generator":              "Generate structured, role-based prompts for ChatGPT, Claude, and Gemini. Free AI prompt generator produces professional-quality outputs on the first attempt.",
        "midjourney-prompt-generator":      "Generate optimized Midjourney prompts with correct syntax, style descriptors, and aspect ratios. Free generator creates stunning AI images on the first try.",
      };

      const meta: PageMeta = {
        title:       `Free ${tool.name}`,
        description: TOOL_META_DESCRIPTIONS[slug] ?? tool.description,
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
            "description":         TOOL_META_DESCRIPTIONS[slug] ?? tool.description,
            "creator":             { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
            "speakable":           { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2", ".tool-description"] },
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
            "speakable":  { "@type": "SpeakableSpecification", "cssSelector": ["h1", "h2", ".category-description"] },
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
