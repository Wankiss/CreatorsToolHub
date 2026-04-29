import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { blogPostsTable } from "./schema/blog.js";
import { desc } from "drizzle-orm";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function run() {
  const posts = await db
    .select({ id: blogPostsTable.id, slug: blogPostsTable.slug, title: blogPostsTable.title, isPublished: blogPostsTable.isPublished })
    .from(blogPostsTable)
    .orderBy(desc(blogPostsTable.publishedAt));

  console.log(`\nTotal posts in DB: ${posts.length}\n`);
  posts.forEach((p, i) =>
    console.log(`${String(i + 1).padStart(2)}. ${p.isPublished ? "[PUB]" : "[DFT]"} ${p.slug}`)
  );

  // Check for duplicate slugs
  const slugs = posts.map(p => p.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) {
    console.log(`\n⚠ DUPLICATE SLUGS FOUND: ${dupes.join(", ")}`);
  } else {
    console.log(`\n✅ No duplicate slugs found.`);
  }

  // Check for similar titles
  console.log("\n── Titles ─────────────────────────────────────────────────");
  posts.forEach((p, i) =>
    console.log(`${String(i + 1).padStart(2)}. ${p.title}`)
  );

  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
