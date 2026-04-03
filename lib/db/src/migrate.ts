import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running database migrations...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "description" text DEFAULT '',
        "icon" varchar(50) DEFAULT '',
        "color" varchar(50) DEFAULT 'blue',
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "tools" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL UNIQUE,
        "category_id" integer REFERENCES "categories"("id"),
        "description" text DEFAULT '',
        "short_description" text DEFAULT '',
        "icon" varchar(50) DEFAULT '',
        "usage_count" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "updated_at" timestamp NOT NULL DEFAULT now(),
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "blog_posts" (
        "id" serial PRIMARY KEY,
        "title" varchar(500) NOT NULL,
        "slug" varchar(500) NOT NULL UNIQUE,
        "excerpt" text NOT NULL DEFAULT '',
        "content" text NOT NULL DEFAULT '',
        "author" varchar(255) NOT NULL DEFAULT 'Creator Toolbox Team',
        "tags" text NOT NULL DEFAULT '[]',
        "meta_title" varchar(500) NOT NULL DEFAULT '',
        "meta_description" text NOT NULL DEFAULT '',
        "cover_image" text DEFAULT '',
        "faq_schema" text DEFAULT '',
        "reading_time" integer NOT NULL DEFAULT 5,
        "is_published" boolean NOT NULL DEFAULT false,
        "published_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "tool_usage" (
        "id" serial PRIMARY KEY,
        "tool_id" integer REFERENCES "tools"("id"),
        "tool_slug" varchar(255),
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "contact_submissions" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "subject" varchar(500),
        "message" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now()
      )
    `);

    // Safely add any missing columns to existing tables
    const addIfMissing = async (table: string, column: string, definition: string) => {
      await client.query(`
        ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" ${definition}
      `);
    };

    await addIfMissing("blog_posts", "faq_schema", "text DEFAULT ''");
    await addIfMissing("blog_posts", "cover_image", "text DEFAULT ''");
    await addIfMissing("blog_posts", "reading_time", "integer NOT NULL DEFAULT 5");
    await addIfMissing("tools", "updated_at", "timestamp NOT NULL DEFAULT now()");
    await addIfMissing("tools", "short_description", "text DEFAULT ''");

    console.log("Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
