import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable, toolsTable } from "@workspace/db/schema";
import { eq, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

const ALLOWED_CATEGORY_SLUGS = ["youtube-tools", "tiktok-tools", "instagram-tools", "ai-creator-tools"];

router.get("/categories", async (_req, res) => {
  try {
    const categories = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        icon: categoriesTable.icon,
        color: categoriesTable.color,
        toolCount: sql<number>`count(${toolsTable.id})::int`,
      })
      .from(categoriesTable)
      .leftJoin(toolsTable, eq(toolsTable.categoryId, categoriesTable.id))
      .where(inArray(categoriesTable.slug, ALLOWED_CATEGORY_SLUGS))
      .groupBy(categoriesTable.id)
      .orderBy(categoriesTable.sortOrder);

    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch categories" });
  }
});

router.get("/categories/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    if (!ALLOWED_CATEGORY_SLUGS.includes(slug)) {
      res.status(404).json({ error: "not_found", message: "Category not found" });
      return;
    }

    const category = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, slug))
      .limit(1);

    if (!category.length) {
      res.status(404).json({ error: "not_found", message: "Category not found" });
      return;
    }

    const cat = category[0];
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
      .where(eq(toolsTable.categoryId, cat.id));

    const toolCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolsTable)
      .where(eq(toolsTable.categoryId, cat.id));

    res.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      toolCount: toolCount[0]?.count ?? 0,
      seoContent: cat.seoContent,
      tools,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch category" });
  }
});

export default router;
