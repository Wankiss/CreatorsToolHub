import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import router from "./routes";
import { db, toolsTable, categoriesTable, blogPostsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

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
      ...posts.map(p => `<url><loc>${baseUrl}/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
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
