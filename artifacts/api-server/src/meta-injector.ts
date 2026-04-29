/**
 * meta-injector.ts
 *
 * Server-side meta tag injection for the CSR SPA.
 *
 * The React app sets all meta tags via useEffect (client-side only), so
 * crawlers — Googlebot, GPTBot, ClaudeBot, PerplexityBot — receive a blank
 * <div id="root"> with the generic homepage title on every URL.
 *
 * This module intercepts the index.html before it is sent and replaces the
 * default meta tags with route-specific values fetched from the database.
 * The React app still hydrates normally on the client side; this is purely
 * for the first-byte HTML that crawlers and link-preview scrapers read.
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
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Replace the generic meta tags baked into index.html with page-specific
 * values, and optionally inject additional JSON-LD <script> blocks.
 */
export function buildHtml(template: string, meta: PageMeta): string {
  const {
    title,
    description,
    canonical,
    ogType  = "website",
    ogImage = `${SITE_URL}/opengraph.jpg`,
    schemas = [],
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

// ── Route resolvers ───────────────────────────────────────────────────────────

/** Returns page-specific metadata for a given URL path, or null to fall back
 *  to the unmodified index.html (404-ish pages, admin, etc.). */
export async function resolvePageMeta(pathname: string): Promise<PageMeta | null> {

  // ── Static routes (no DB needed) ──────────────────────────────────────────

  if (pathname === "/" || pathname === "") {
    return {
      title:       "Free AI Tools for Content Creators — YouTube, TikTok & Instagram",
      description: "35+ free AI-powered tools for YouTube, TikTok, and Instagram creators. Generate titles, scripts, captions, hashtags, and prompts instantly — no signup required.",
      canonical:   SITE_URL,
    };
  }

  if (pathname === "/blog") {
    return {
      title:       "Creator Growth Blog — YouTube, TikTok & Instagram Tips 2026",
      description: "Free guides for content creators: YouTube SEO, TikTok growth strategies, Instagram tips, faceless channel ideas, and AI content tools. Updated for 2026.",
      canonical:   `${SITE_URL}/blog`,
    };
  }

  if (pathname === "/about") {
    return {
      title:       "About creatorsToolHub — Free AI Tools for Content Creators",
      description: "creatorsToolHub is built by Nnaemeka Immanuels — a content creator strategist who made 35+ free AI tools for YouTube, TikTok, and Instagram creators. No signup, no cost, ever.",
      canonical:   `${SITE_URL}/about`,
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

  if (pathname === "/contact") {
    return {
      title:       "Contact creatorsToolHub",
      description: "Get in touch with the creatorsToolHub team. Questions, feedback, or partnership enquiries — we read every message.",
      canonical:   `${SITE_URL}/contact`,
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

      const platformQA = isTikTok
        ? { q: `Can I use the ${tool.name} for TikTok videos?`, a: `Yes. The ${tool.name} is built specifically for TikTok creators. It understands TikTok's short-form format, trending content patterns, and what actually gets views on the platform.` }
        : isInstagram
        ? { q: `Can I use the ${tool.name} for Instagram Reels?`, a: `Yes. The ${tool.name} works for all Instagram content formats including Reels, posts, carousels, and Stories. Results are optimised for Instagram's algorithm and audience behaviour.` }
        : isAI
        ? { q: `Which AI models work with the ${tool.name}?`, a: `The ${tool.name} generates prompts and content compatible with ChatGPT, Claude, Gemini, and other major AI tools. You can copy the output and paste it directly into any AI assistant.` }
        : { q: `Can I use the ${tool.name} for YouTube Shorts?`, a: `Yes. The ${tool.name} works for both long-form YouTube videos and YouTube Shorts. Simply specify your format when entering your topic and the AI will tailor the output accordingly.` };

      const faqSchema: object = {
        "@context": "https://schema.org",
        "@type":    "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name":  `Is the ${tool.name} free?`,
            "acceptedAnswer": { "@type": "Answer", "text": `Yes, the ${tool.name} on creatorsToolHub is completely free. There is no signup, no subscription, and no usage limit. Open the tool, enter your details, and get results instantly — forever free.` },
          },
          {
            "@type": "Question",
            "name":  `How does the ${tool.name} work?`,
            "acceptedAnswer": { "@type": "Answer", "text": `The ${tool.name} uses advanced AI to generate high-quality results based on your input. Enter your topic, keyword, or content idea, click Generate, and receive professional-quality output in seconds. No prompt engineering or technical knowledge required.` },
          },
          {
            "@type": "Question",
            "name":  `How many times can I use the ${tool.name}?`,
            "acceptedAnswer": { "@type": "Answer", "text": `Unlimited. creatorsToolHub does not cap how many times you can use the ${tool.name}. Generate as many results as you need — the tool stays completely free with no daily limits or credit system.` },
          },
          {
            "@type": "Question",
            "name":  platformQA.q,
            "acceptedAnswer": { "@type": "Answer", "text": platformQA.a },
          },
          {
            "@type": "Question",
            "name":  `Do I need to create an account to use the ${tool.name}?`,
            "acceptedAnswer": { "@type": "Answer", "text": `No account is required. The ${tool.name} works instantly in your browser without any signup, email address, or payment information. Just open the page and start generating.` },
          },
        ],
      };

      const meta: PageMeta = {
        title:       `Free ${tool.name}`,
        description: tool.description,
        canonical,
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
          faqSchema,
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
      const [category] = await db
        .select({
          name:        categoriesTable.name,
          description: categoriesTable.description,
          slug:        categoriesTable.slug,
        })
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, slug))
        .limit(1);

      if (!category) return null;

      const canonical = `${SITE_URL}/category/${slug}`;
      const meta: PageMeta = {
        title:       `Free ${category.name} — AI Tools for Content Creators`,
        description: category.description ?? "Free AI-powered tools for content creators. No signup required.",
        canonical,
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
