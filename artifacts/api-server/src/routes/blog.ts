import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";

const router: IRouter = Router();

const TAG_COVER_DEFAULTS: [string, string][] = [
  ["YouTube Growth",   "/blog/how-to-go-viral-on-youtube-beginner-2026.png"],
  ["TikTok Growth",    "/blog/how-to-go-viral-on-tiktok-2026-strategies-that-work.png"],
  ["Instagram Growth", "/blog/instagram-hashtag-strategy-2026-get-more-reach.png"],
  ["AI Tools",         "/blog/best-free-ai-tools-content-creators-2026.png"],
  ["SEO",              "/blog/youtube-seo-tips-beginners-that-work-2026.png"],
  ["Creator Tips",     "/blog/best-free-creator-tools-beginners-2026.png"],
  ["Free Tools",       "/blog/best-free-creator-tools-beginners-2026.png"],
  ["Beginner Guide",   "/blog/best-free-creator-tools-beginners-2026.png"],
  ["Scripting",        "/blog/how-to-write-youtube-script-fast-free-script-generator.png"],
  ["Faceless",         "/blog/how-to-start-faceless-youtube-channel-complete-guide-2026.png"],
];
const FALLBACK_COVER = "/blog/best-free-creator-tools-beginners-2026.png";

function resolveCoverImage(coverImage: string | null | undefined, tags: string[]): string {
  if (coverImage) return coverImage;
  for (const [tag, img] of TAG_COVER_DEFAULTS) {
    if (tags.includes(tag)) return img;
  }
  return FALLBACK_COVER;
}

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

    const formatted = posts.map(p => {
      const parsedTags = (() => { try { return JSON.parse(p.tags); } catch { return []; } })();
      return {
        ...p,
        tags: parsedTags,
        coverImage: resolveCoverImage(p.coverImage, parsedTags),
        publishedAt: p.publishedAt?.toISOString() ?? new Date().toISOString(),
      };
    });

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
    const parsedTags = (() => { try { return JSON.parse(p.tags); } catch { return []; } })();
    res.json({
      ...p,
      tags: parsedTags,
      coverImage: resolveCoverImage(p.coverImage, parsedTags),
      publishedAt: p.publishedAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch blog post" });
  }
});

export default router;
