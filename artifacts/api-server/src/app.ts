import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";
import { db, toolsTable, categoriesTable, blogPostsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const app: Express = express();

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));
app.use("/api", router);

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
  app.use(express.static(staticDir));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
