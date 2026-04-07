import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { blogPostsTable } from "./schema/index.js";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const COVER_IMAGES: Record<string, string> = {
  // Original 12 seeded posts
  "youtube-seo-tips-beginners-that-work-2026":                  "/blog/youtube-seo-tips-beginners-that-work-2026.png",
  "instagram-hashtag-strategy-2026-get-more-reach":             "/blog/instagram-hashtag-strategy-2026-get-more-reach.png",
  "50-viral-content-ideas-beginners-get-views-2026":            "/blog/50-viral-content-ideas-beginners-get-views-2026.png",
  "how-to-create-content-using-ai-beginners-guide-2026":        "/blog/how-to-create-content-using-ai-beginners-guide-2026.png",
  "how-to-grow-tiktok-followers-fast-2026":                     "/blog/how-to-grow-tiktok-followers-fast-2026.png",
  "how-to-get-tiktok-video-ideas-every-day-free":               "/blog/how-to-get-tiktok-video-ideas-every-day-free.png",
  "how-to-go-viral-on-tiktok-2026-strategies-that-work":        "/blog/how-to-go-viral-on-tiktok-2026-strategies-that-work.png",
  "best-free-ai-tools-content-creators-2026":                   "/blog/best-free-ai-tools-content-creators-2026.png",
  "how-to-start-faceless-youtube-channel-complete-guide-2026":  "/blog/how-to-start-faceless-youtube-channel-complete-guide-2026.png",
  "how-to-go-viral-on-youtube-beginner-2026":                   "/blog/how-to-go-viral-on-youtube-beginner-2026.png",
  "how-to-write-youtube-script-fast-free-script-generator":     "/blog/how-to-write-youtube-script-fast-free-script-generator.png",
  "best-free-creator-tools-beginners-2026":                     "/blog/best-free-creator-tools-beginners-2026.png",
  // Extra posts — reuse the closest matching image
  "faceless-youtube-channel-ideas-proven-niches-2026":          "/blog/how-to-start-faceless-youtube-channel-complete-guide-2026.png",
  "instagram-hashtag-strategy-2026-more-reach":                 "/blog/instagram-hashtag-strategy-2026-get-more-reach.png",
  "viral-content-ideas-beginners-2026":                         "/blog/50-viral-content-ideas-beginners-get-views-2026.png",
  "how-to-go-viral-on-tiktok-2026":                             "/blog/how-to-go-viral-on-tiktok-2026-strategies-that-work.png",
  "how-to-start-faceless-youtube-channel-2026":                 "/blog/how-to-start-faceless-youtube-channel-complete-guide-2026.png",
  "how-to-write-youtube-script-fast-free-generator":            "/blog/how-to-write-youtube-script-fast-free-script-generator.png",
  "youtube-seo-tips-beginners-2026":                            "/blog/youtube-seo-tips-beginners-that-work-2026.png",
  "youtube-tags-in-2026-what-they-do-how-to-use-them-and-which-tools-work-best": "/blog/youtube-seo-tips-beginners-that-work-2026.png",
};

async function run() {
  let updated = 0;
  for (const [slug, coverImage] of Object.entries(COVER_IMAGES)) {
    const result = await db
      .update(blogPostsTable)
      .set({ coverImage })
      .where(eq(blogPostsTable.slug, slug))
      .returning({ id: blogPostsTable.id, title: blogPostsTable.title });

    if (result.length > 0) {
      console.log(`  ✓ "${result[0].title}"`);
      updated++;
    } else {
      console.log(`  ⚠ No post found for slug: ${slug}`);
    }
  }
  console.log(`\nDone — updated ${updated} posts.`);
  await pool.end();
}

run().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
