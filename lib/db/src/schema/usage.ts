import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { toolsTable } from "./tools";

export const toolUsageLogsTable = pgTable("tool_usage_logs", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").references(() => toolsTable.id),
  toolSlug: varchar("tool_slug", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 100 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export type ToolUsageLog = typeof toolUsageLogsTable.$inferSelect;
