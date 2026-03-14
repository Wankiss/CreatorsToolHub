import { pgTable, serial, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const toolsTable = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  description: text("description").notNull().default(""),
  shortDescription: varchar("short_description", { length: 300 }).notNull().default(""),
  icon: varchar("icon", { length: 50 }).notNull().default("🔧"),
  howToGuide: text("how_to_guide").notNull().default(""),
  seoContent: text("seo_content").notNull().default(""),
  faqContent: text("faq_content").notNull().default(""),
  exampleOutputs: text("example_outputs").notNull().default(""),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertToolSchema = createInsertSchema(toolsTable).omit({ id: true, createdAt: true, updatedAt: true, usageCount: true });
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof toolsTable.$inferSelect;
