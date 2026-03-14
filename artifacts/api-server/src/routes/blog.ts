import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/blog", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const offset = Number(req.query.offset) || 0;
    const tag = req.query.tag as string | undefined;

    let posts = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true))
      .orderBy(desc(blogPostsTable.publishedAt))
      .limit(limit)
      .offset(offset);

    if (tag) {
      posts = posts.filter(p => {
        try {
          const tags = JSON.parse(p.tags);
          return tags.includes(tag);
        } catch {
          return false;
        }
      });
    }

    const total = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.isPublished, true));

    const formatted = posts.map(p => ({
      ...p,
      tags: (() => { try { return JSON.parse(p.tags); } catch { return []; } })(),
      publishedAt: p.publishedAt?.toISOString() ?? new Date().toISOString(),
    }));

    res.json({ posts: formatted, total: total[0]?.count ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch blog posts" });
  }
});

router.get("/blog/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const posts = await db
      .select()
      .from(blogPostsTable)
      .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.isPublished, true)))
      .limit(1);

    if (!posts.length) {
      res.status(404).json({ error: "not_found", message: "Blog post not found" });
      return;
    }

    const p = posts[0];
    res.json({
      ...p,
      tags: (() => { try { return JSON.parse(p.tags); } catch { return []; } })(),
      publishedAt: p.publishedAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch blog post" });
  }
});

export default router;
