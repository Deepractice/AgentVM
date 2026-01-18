/**
 * SQLite Tenant Repository
 *
 * Cross-runtime SQLite implementation of TenantRepository.
 * Uses commonxjs/sqlite for Bun and Node.js compatibility.
 */

import { openDatabase, type Database } from "commonxjs/sqlite";
import { createLogger } from "commonxjs/logger";
import { generateId } from "commonxjs/id";
import type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantRepository,
} from "@agentvm/core";

const logger = createLogger("agentvm/repository/tenant");

/**
 * Generate a unique tenant ID
 */
function generateTenantId(): string {
  return generateId("tenant");
}

/**
 * SQLite implementation of TenantRepository
 */
export class SQLiteTenantRepository implements TenantRepository {
  private db: Database;

  constructor(dbPath: string = ":memory:") {
    logger.debug("Opening database", { dbPath });
    this.db = openDatabase(dbPath);

    // Create table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tenants (
        tenant_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    logger.debug("Database initialized");
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

    const stmt = this.db.prepare(`
      INSERT INTO tenants (tenant_id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      tenant.tenantId,
      tenant.name,
      tenant.description ?? null,
      tenant.createdAt,
      tenant.updatedAt
    );

    logger.info("Tenant created", { tenantId: tenant.tenantId, name: tenant.name });
    return tenant;
  }

  async findById(tenantId: string): Promise<Tenant | null> {
    const stmt = this.db.prepare(`
      SELECT tenant_id, name, description, created_at, updated_at
      FROM tenants WHERE tenant_id = ?
    `);
    const row = stmt.get(tenantId) as {
      tenant_id: string;
      name: string;
      description: string | null;
      created_at: number;
      updated_at: number;
    } | null;

    if (!row) {
      return null;
    }

    return {
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async update(tenantId: string, request: UpdateTenantRequest): Promise<Tenant | null> {
    const existing = await this.findById(tenantId);
    if (!existing) {
      return null;
    }

    const now = Date.now();
    const updates: string[] = ["updated_at = ?"];
    const values: (string | number | null)[] = [now];

    if (request.name !== undefined) {
      updates.push("name = ?");
      values.push(request.name);
    }
    if (request.description !== undefined) {
      updates.push("description = ?");
      values.push(request.description ?? null);
    }

    values.push(tenantId);

    const stmt = this.db.prepare(`
      UPDATE tenants SET ${updates.join(", ")} WHERE tenant_id = ?
    `);
    stmt.run(...values);

    logger.info("Tenant updated", { tenantId });
    return this.findById(tenantId);
  }

  async delete(tenantId: string): Promise<boolean> {
    const existing = await this.findById(tenantId);
    if (!existing) {
      return false;
    }

    const stmt = this.db.prepare("DELETE FROM tenants WHERE tenant_id = ?");
    stmt.run(tenantId);

    logger.info("Tenant deleted", { tenantId });
    return true;
  }

  async list(): Promise<Tenant[]> {
    const stmt = this.db.prepare(`
      SELECT tenant_id, name, description, created_at, updated_at
      FROM tenants
    `);
    const rows = stmt.all() as Array<{
      tenant_id: string;
      name: string;
      description: string | null;
      created_at: number;
      updated_at: number;
    }>;

    return rows.map((row) => ({
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  close(): void {
    this.db.close();
    logger.debug("Database closed");
  }
}
