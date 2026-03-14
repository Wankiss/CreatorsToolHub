import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { toolUsageLogsTable, toolsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/analytics/track", async (req, res) => {
  try {
    const { toolSlug, toolId } = req.body;
    if (!toolSlug) {
      res.status(400).json({ error: "bad_request", message: "toolSlug is required" });
      return;
    }

    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "unknown";

    await db.insert(toolUsageLogsTable).values({
      toolId: toolId ?? null,
      toolSlug,
      ipAddress: ip,
    });

    if (toolSlug) {
      await db
        .update(toolsTable)
        .set({ usageCount: sql`${toolsTable.usageCount} + 1` })
        .where(eq(toolsTable.slug, toolSlug));
    }

    res.json({ success: true, message: "Tracked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error", message: "Tracking failed" });
  }
});

export default router;
