/**
 * SQLite Tenant Repository
 *
 * Drizzle ORM implementation of TenantRepository for SQLite.
 */

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantRepository,
} from "@agentvm/core";
import { tenants } from "../db/schema.js";

/**
 * Generate a unique tenant ID
 */
function generateTenantId(): string {
  return `tenant_${crypto.randomUUID().replace(/-/g, "")}`;
}

/**
 * SQLite implementation of TenantRepository
 */
export class SQLiteTenantRepository implements TenantRepository {
  private db: ReturnType<typeof drizzle>;

  constructor(dbPath: string = ":memory:") {
    const sqlite = new Database(dbPath);
    this.db = drizzle(sqlite);

    // Create table if not exists
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS tenants (
        tenant_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }

  async create(request: CreateTenantRequest): Promise<Tenant> {
    const now = Date.now();
    const tenant: Tenant = {
      tenantId: generateTenantId(),
      name: request.name,
      description: request.description,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(tenants).values({
      tenantId: tenant.tenantId,
      name: tenant.name,
      description: tenant.description,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    });

    return tenant;
  }

  async findById(tenantId: string): Promise<Tenant | null> {
    const results = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.tenantId, tenantId))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async update(tenantId: string, request: UpdateTenantRequest): Promise<Tenant | null> {
    const existing = await this.findById(tenantId);
    if (!existing) {
      return null;
    }

    const now = Date.now();
    const updates: Partial<typeof tenants.$inferInsert> = {
      updatedAt: now,
    };

    if (request.name !== undefined) {
      updates.name = request.name;
    }
    if (request.description !== undefined) {
      updates.description = request.description;
    }

    await this.db.update(tenants).set(updates).where(eq(tenants.tenantId, tenantId));

    return this.findById(tenantId);
  }

  async delete(tenantId: string): Promise<boolean> {
    const existing = await this.findById(tenantId);
    if (!existing) {
      return false;
    }

    await this.db.delete(tenants).where(eq(tenants.tenantId, tenantId));
    return true;
  }

  async list(): Promise<Tenant[]> {
    const results = await this.db.select().from(tenants);

    return results.map((row) => ({
      tenantId: row.tenantId,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }
}
