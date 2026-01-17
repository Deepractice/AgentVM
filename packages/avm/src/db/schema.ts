/**
 * Drizzle ORM Schema
 *
 * Database schema definitions for AgentVM.
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Tenants table
 */
export const tenants = sqliteTable("tenants", {
  tenantId: text("tenant_id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "number" }).notNull(),
  updatedAt: integer("updated_at", { mode: "number" }).notNull(),
});
