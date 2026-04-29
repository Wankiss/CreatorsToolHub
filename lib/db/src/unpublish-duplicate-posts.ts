/**
 * unpublish-duplicate-posts.ts
 *
 * Unpublishes the 9 duplicate blog posts that either:
 * (a) already have 301 redirects set in app.ts BLOG_REDIRECTS, or
 * (b) are near-duplicates of a canonical post
 *
 * These posts should never appear in the blog list, sitemap, or
 * be indexed by crawlers. The URL-level 301 redirects stay in place
 * to pass any existing link equity to the canonical post.
 *
 * Run with:
 *   DATABASE_URL=... pnpm --filter @workspace/db run unpublish-duplicates
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { blogPostsTable } from "./schema/index.js";
import { inArray } from "drizzle-orm";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// 7 already have 301 redirects in app.ts + 2 new near-duplicates
const DUPLICATE_SLUGS = [
  // Already redirected in app.ts BLOG_REDIRECTS:
  "youtube-seo-tips-beginners-2026",
  "instagram-hashtag-strategy-2026-more-reach",
  "viral-content-ideas-beginners-2026",
  "how-to-start-faceless-youtube-channel-2026",
  "how-to-write-youtube-script-fast-free-generator",
  "best-free-ai-tools-for-content-creators-work-smarter-grow-faster",
  "how-to-go-viral-on-tiktok-in-2026-understanding-tiktok-algorithm",
  // Near-duplicates — adding redirects in app.ts for these too:
  "how-to-go-viral-on-tiktok-2026",
  "how-to-get-more-tiktok-followers-for-free-understand-tiktok-algorithm",
];

async function run() {
  console.log(`\n🗑  Unpublishing ${DUPLICATE_SLUGS.length} duplicate posts...\n`);

  const result = await db
    .update(blogPostsTable)
    .set({ isPublished: false })
    .where(inArray(blogPostsTable.slug, DUPLICATE_SLUGS))
    .returning({ slug: blogPostsTable.slug, title: blogPostsTable.title });

  if (result.length === 0) {
    console.log("  ⚠ No posts matched — already unpublished or slugs not found.");
  } else {
    result.forEach(p => console.log(`  ✓ Unpublished: "${p.title}"`));
  }

  console.log(`\n✅ Done — unpublished ${result.length}/${DUPLICATE_SLUGS.length} posts.\n`);
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
