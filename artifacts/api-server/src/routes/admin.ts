import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable, toolsTable, blogPostsTable, toolUsageLogsTable } from "@workspace/db/schema";
import { eq, sql, desc, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/stats", async (_req, res) => {
  try {
    const totalTools = await db.select({ count: sql<number>`count(*)::int` }).from(toolsTable);
    const totalCategories = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);
    const totalBlogPosts = await db.select({ count: sql<number>`count(*)::int` }).from(blogPostsTable);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const usageToday = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolUsageLogsTable)
      .where(gte(toolUsageLogsTable.timestamp, today));

    const usageMonth = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolUsageLogsTable)
      .where(gte(toolUsageLogsTable.timestamp, monthStart));

    const topTools = await db
      .select({ name: toolsTable.name, slug: toolsTable.slug, usageCount: toolsTable.usageCount })
      .from(toolsTable)
      .orderBy(desc(toolsTable.usageCount))
      .limit(10);

    res.json({
      totalTools: totalTools[0]?.count ?? 0,
      totalCategories: totalCategories[0]?.count ?? 0,
      totalBlogPosts: totalBlogPosts[0]?.count ?? 0,
      totalUsageToday: usageToday[0]?.count ?? 0,
      totalUsageMonth: usageMonth[0]?.count ?? 0,
      topTools,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch stats" });
  }
});

router.get("/admin/tools", async (_req, res) => {
  try {
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
      .orderBy(desc(toolsTable.createdAt));

    res.json({ tools, total: tools.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to fetch tools" });
  }
});

router.post("/admin/tools", async (req, res) => {
  try {
    const { name, slug, categoryId, categorySlug, description, shortDescription, icon, howToGuide, seoContent, faqContent, exampleOutputs, isActive } = req.body;

    let resolvedCategoryId = categoryId ? Number(categoryId) : undefined;
    if (!resolvedCategoryId && categorySlug) {
      const cat = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, categorySlug)).limit(1);
      resolvedCategoryId = cat[0]?.id;
    }
    if (!resolvedCategoryId) {
      return res.status(400).json({ error: "bad_request", message: "categoryId or categorySlug is required" });
    }

    const [tool] = await db.insert(toolsTable).values({
      name, slug, categoryId: resolvedCategoryId, description: description || "", shortDescription: shortDescription || "",
      icon: icon || "🔧", howToGuide: howToGuide || "", seoContent: seoContent || "",
      faqContent: faqContent || "", exampleOutputs: exampleOutputs || "", isActive: isActive ?? true,
    }).returning();

    const cat = await db.select({ name: categoriesTable.name, slug: categoriesTable.slug })
      .from(categoriesTable).where(eq(categoriesTable.id, tool.categoryId)).limit(1);

    res.status(201).json({
      ...tool,
      categoryName: cat[0]?.name ?? "",
      categorySlug: cat[0]?.slug ?? "",
      createdAt: tool.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create tool" });
  }
});

router.put("/admin/tools/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates: Record<string, unknown> = {};
    const allowed = ["name", "slug", "categoryId", "description", "shortDescription", "icon", "howToGuide", "seoContent", "faqContent", "exampleOutputs", "isActive"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.updatedAt = new Date();

    const [tool] = await db.update(toolsTable).set(updates).where(eq(toolsTable.id, id)).returning();
    if (!tool) { res.status(404).json({ error: "not_found", message: "Tool not found" }); return; }

    const cat = await db.select({ name: categoriesTable.name, slug: categoriesTable.slug })
      .from(categoriesTable).where(eq(categoriesTable.id, tool.categoryId)).limit(1);

    res.json({ ...tool, categoryName: cat[0]?.name ?? "", categorySlug: cat[0]?.slug ?? "", createdAt: tool.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update tool" });
  }
});

router.delete("/admin/tools/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(toolsTable).where(eq(toolsTable.id, id));
    res.json({ success: true, message: "Tool deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete tool" });
  }
});

router.post("/admin/blog", async (req, res) => {
  try {
    const { title, slug, excerpt, content, author, tags, metaTitle, metaDescription, isPublished } = req.body;
    const words = content?.split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const [post] = await db.insert(blogPostsTable).values({
      title, slug, excerpt: excerpt || "", content: content || "",
      author: author || "Creator Toolbox Team",
      tags: JSON.stringify(tags || []),
      metaTitle: metaTitle || title, metaDescription: metaDescription || excerpt || "",
      readingTime, isPublished: isPublished ?? false,
      publishedAt: isPublished ? new Date() : null,
    }).returning();

    res.status(201).json({
      ...post,
      tags: (() => { try { return JSON.parse(post.tags); } catch { return []; } })(),
      publishedAt: post.publishedAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to create blog post" });
  }
});

router.put("/admin/blog/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates: Record<string, unknown> = {};
    const { title, slug, excerpt, content, author, tags, metaTitle, metaDescription, isPublished } = req.body;
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (content !== undefined) {
      updates.content = content;
      updates.readingTime = Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
    }
    if (author !== undefined) updates.author = author;
    if (tags !== undefined) updates.tags = JSON.stringify(tags);
    if (metaTitle !== undefined) updates.metaTitle = metaTitle;
    if (metaDescription !== undefined) updates.metaDescription = metaDescription;
    if (isPublished !== undefined) {
      updates.isPublished = isPublished;
      if (isPublished) updates.publishedAt = new Date();
    }
    updates.updatedAt = new Date();

    const [post] = await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, id)).returning();
    if (!post) { res.status(404).json({ error: "not_found", message: "Post not found" }); return; }

    res.json({
      ...post,
      tags: (() => { try { return JSON.parse(post.tags); } catch { return []; } })(),
      publishedAt: post.publishedAt?.toISOString() ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to update blog post" });
  }
});

router.delete("/admin/blog/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.json({ success: true, message: "Blog post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Failed to delete blog post" });
  }
});

export default router;
