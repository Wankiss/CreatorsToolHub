import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { toolsTable } from "./schema/index.js";
import { asc } from "drizzle-orm";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function run() {
  const tools = await db
    .select({ slug: toolsTable.slug, name: toolsTable.name, howToGuide: toolsTable.howToGuide, seoContent: toolsTable.seoContent, faqContent: toolsTable.faqContent })
    .from(toolsTable)
    .orderBy(asc(toolsTable.categoryId), asc(toolsTable.id));

  const empty   = tools.filter(t => !t.howToGuide && !t.seoContent && !t.faqContent);
  const partial = tools.filter(t => (!!t.howToGuide || !!t.seoContent || !!t.faqContent) && !(t.howToGuide && t.seoContent && t.faqContent));
  const full    = tools.filter(t => t.howToGuide && t.seoContent && t.faqContent);

  console.log(`\nTotal tools: ${tools.length}`);
  console.log(`Full content: ${full.length} | Partial: ${partial.length} | Empty: ${empty.length}\n`);

  console.log("── Empty (all 3 fields blank) ──────────────────────");
  empty.forEach(t => console.log(`  • ${t.slug}`));
  if (partial.length) {
    console.log("\n── Partial ─────────────────────────────────────────");
    partial.forEach(t => console.log(`  • ${t.slug}  [how:${!!t.howToGuide} seo:${!!t.seoContent} faq:${!!t.faqContent}]`));
  }
  await pool.end();
}
run().catch(e => { console.error(e); process.exit(1); });
