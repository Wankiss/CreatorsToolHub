import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable, toolsTable, blogPostsTable } from "@workspace/db/schema";
import { eq, sql, ilike, or, desc, ne } from "drizzle-orm";
import { executeTool } from "../lib/toolEngine.js";

const router: IRouter = Router();

router.get("/tools", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;
    const search = req.query.search as string | undefined;
    const categorySlug = req.query.category as string | undefined;

    let categoryId: number | null = null;
    if (categorySlug) {
      const cat = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, categorySlug)).limit(1);
      if (cat.length) categoryId = cat[0].id;
    }

    const conditions: ReturnType<typeof eq>[] = [eq(toolsTable.isActive, true)];
    if (categoryId) conditions.push(eq(toolsTable.categoryId, categoryId) as any);

    const baseQuery = db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        slug: toolsTable.slug,
        categoryId: toolsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        description: toolsTable.description,
        shortDescription: toolsTable.shortDescription,
        icon: toolsTable.icon,
        usageCount: toolsTable.usageCount,
        isActive: toolsTable.isActive,
        createdAt: sql<string>`${toolsTable.createdAt}::text`,
      })
      .from(toolsTable)
      .leftJoin(categoriesTable, eq(toolsTable.categoryId, categoriesTable.id));

    let tools;
    if (search) {
      tools = await baseQuery
        .where(or(ilike(toolsTable.name, `%${search}%`), ilike(toolsTable.shortDescription, `%${search}%`)))
        .limit(limit).offset(offset);
    } else if (categoryId) {
      tools = await baseQuery.where(eq(toolsTable.categoryId, categoryId)).limit(limit).offset(offset);
    } else {
      tools = await baseQuery.where(eq(toolsTable.isActive, true)).limit(limit).offset(offset);
    }

    const total = await db.select({ count: sql<number>`count(*)::int` }).from(toolsTable).where(eq(toolsTable.isActive, true));
    res.json({ tools, total: total[0]?.count ?? 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch tools" });
  }
});

router.get("/tools/popular", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 12, 24);
    const tools = await db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        slug: toolsTable.slug,
        categoryId: toolsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        description: toolsTable.description,
        shortDescription: toolsTable.shortDescription,
        icon: toolsTable.icon,
        usageCount: toolsTable.usageCount,
        isActive: toolsTable.isActive,
        createdAt: sql<string>`${toolsTable.createdAt}::text`,
      })
      .from(toolsTable)
      .leftJoin(categoriesTable, eq(toolsTable.categoryId, categoriesTable.id))
      .where(eq(toolsTable.isActive, true))
      .orderBy(desc(toolsTable.usageCount))
      .limit(limit);
    res.json({ tools, total: tools.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch popular tools" });
  }
});

router.get("/tools/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const tools = await db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        slug: toolsTable.slug,
        categoryId: toolsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        description: toolsTable.description,
        shortDescription: toolsTable.shortDescription,
        icon: toolsTable.icon,
        usageCount: toolsTable.usageCount,
        isActive: toolsTable.isActive,
        createdAt: sql<string>`${toolsTable.createdAt}::text`,
        howToGuide: toolsTable.howToGuide,
        seoContent: toolsTable.seoContent,
        faqContent: toolsTable.faqContent,
        exampleOutputs: toolsTable.exampleOutputs,
      })
      .from(toolsTable)
      .leftJoin(categoriesTable, eq(toolsTable.categoryId, categoriesTable.id))
      .where(eq(toolsTable.slug, slug))
      .limit(1);

    if (!tools.length) {
      res.status(404).json({ error: "not_found", message: "Tool not found" });
      return;
    }

    const tool = tools[0];
    const relatedTools = await db
      .select({
        id: toolsTable.id,
        name: toolsTable.name,
        slug: toolsTable.slug,
        categoryId: toolsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        description: toolsTable.description,
        shortDescription: toolsTable.shortDescription,
        icon: toolsTable.icon,
        usageCount: toolsTable.usageCount,
        isActive: toolsTable.isActive,
        createdAt: sql<string>`${toolsTable.createdAt}::text`,
      })
      .from(toolsTable)
      .leftJoin(categoriesTable, eq(toolsTable.categoryId, categoriesTable.id))
      .where(eq(toolsTable.categoryId, tool.categoryId))
      .limit(7);

    res.json({
      ...tool,
      relatedTools: relatedTools.filter(t => t.slug !== slug).slice(0, 6),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch tool" });
  }
});

router.post("/tools/:slug/execute", async (req, res) => {
  try {
    const { slug } = req.params;
    const { inputs } = req.body;
    if (!inputs || typeof inputs !== "object") {
      res.status(400).json({ error: "bad_request", message: "inputs object is required" });
      return;
    }
    const result = executeTool(slug, inputs as Record<string, string | number | boolean>);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Tool execution failed" });
  }
});

router.get("/sitemap", async (_req, res) => {
  try {
    const tools = await db.select({ slug: toolsTable.slug, updatedAt: toolsTable.updatedAt }).from(toolsTable).where(eq(toolsTable.isActive, true));
    const categories = await db.select({ slug: categoriesTable.slug }).from(categoriesTable);
    const baseUrl = process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
      : "https://creator-toolbox.app";

    const urls = [
      { loc: baseUrl, lastmod: new Date().toISOString().split("T")[0], changefreq: "daily", priority: 1.0 },
      { loc: `${baseUrl}/blog`, lastmod: new Date().toISOString().split("T")[0], changefreq: "daily", priority: 0.9 },
      ...categories.map(c => ({ loc: `${baseUrl}/category/${c.slug}`, lastmod: new Date().toISOString().split("T")[0], changefreq: "weekly", priority: 0.8 })),
      ...tools.map(t => ({ loc: `${baseUrl}/tools/${t.slug}`, lastmod: t.updatedAt.toISOString().split("T")[0], changefreq: "weekly", priority: 0.7 })),
    ];

    res.json({ urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to generate sitemap" });
  }
});

export default router;
