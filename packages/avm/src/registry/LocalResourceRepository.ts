/**
 * Local Resource Repository
 *
 * SQLite-based implementation of ResourceRepository.
 * Stores both metadata and content in SQLite for simplicity.
 */

import { openDatabase, type Database } from "commonxjs/sqlite";
import { createLogger } from "commonxjs/logger";
import { generateId } from "commonxjs/id";
import type {
  Resource,
  PublishResourceRequest,
  ResolveResourceResponse,
  ResourceQuery,
  ResourceListResponse,
  ResourceRepository,
} from "@agentvm/core";

const logger = createLogger("agentvm/registry");

/**
 * Generate a unique resource ID
 */
function generateResourceId(): string {
  return generateId("res");
}

/**
 * Parse a locator string into its components
 * Format: domain/path/name.type@version
 *
 * Examples:
 * - "localhost/sean/hello.text@1.0.0" -> { domain: "localhost", path: "sean", name: "hello", type: "text", version: "1.0.0" }
 * - "localhost/hello.text@1.0.0" -> { domain: "localhost", path: undefined, name: "hello", type: "text", version: "1.0.0" }
 */
function parseLocator(locator: string): {
  domain: string;
  path?: string;
  name: string;
  type: string;
  version: string;
} {
  // Split by @ to get version
  const atIndex = locator.lastIndexOf("@");
  if (atIndex === -1) {
    throw new Error(`Invalid locator: missing version (@): ${locator}`);
  }
  const version = locator.slice(atIndex + 1);
  const beforeVersion = locator.slice(0, atIndex);

  // Split by / to get parts
  const parts = beforeVersion.split("/");
  if (parts.length < 2) {
    throw new Error(`Invalid locator: missing domain: ${locator}`);
  }

  const domain = parts[0];
  const lastPart = parts[parts.length - 1];

  // Parse name.type from last part
  const dotIndex = lastPart.lastIndexOf(".");
  if (dotIndex === -1) {
    throw new Error(`Invalid locator: missing type (.): ${locator}`);
  }
  const name = lastPart.slice(0, dotIndex);
  const type = lastPart.slice(dotIndex + 1);

  // Path is everything between domain and name.type
  const path = parts.length > 2 ? parts.slice(1, -1).join("/") : undefined;

  return { domain, path, name, type, version };
}

/**
 * Local implementation of ResourceRepository
 */
export class LocalResourceRepository implements ResourceRepository {
  private db: Database;

  constructor(dbPath: string = ":memory:") {
    logger.debug("Opening registry database", { dbPath });
    this.db = openDatabase(dbPath);

    // Create table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        domain TEXT NOT NULL,
        path TEXT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        version TEXT NOT NULL,
        locator TEXT NOT NULL UNIQUE,
        description TEXT,
        tags TEXT,
        content TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    this.db.exec("CREATE INDEX IF NOT EXISTS idx_resources_domain ON resources(domain)");
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type)");

    logger.debug("Registry database initialized");
  }

  async publish(request: PublishResourceRequest): Promise<Resource> {
    const parsed = parseLocator(request.locator);
    const now = Date.now();

    // Check if already exists
    const existing = await this.findByLocator(request.locator);
    if (existing) {
      // Update existing
      const stmt = this.db.prepare(`
        UPDATE resources SET
          description = ?,
          tags = ?,
          content = ?,
          updated_at = ?
        WHERE locator = ?
      `);
      stmt.run(
        request.description ?? null,
        request.tags ? JSON.stringify(request.tags) : null,
        typeof request.content === "string" ? request.content : request.content.toString("utf-8"),
        now,
        request.locator
      );
      logger.info("Resource updated", { locator: request.locator });
      return (await this.findByLocator(request.locator))!;
    }

    // Create new
    const resource: Resource = {
      id: generateResourceId(),
      domain: parsed.domain,
      path: parsed.path,
      name: parsed.name,
      type: parsed.type,
      version: parsed.version,
      locator: request.locator,
      description: request.description,
      tags: request.tags,
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO resources (id, domain, path, name, type, version, locator, description, tags, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      resource.id,
      resource.domain,
      resource.path ?? null,
      resource.name,
      resource.type,
      resource.version,
      resource.locator,
      resource.description ?? null,
      resource.tags ? JSON.stringify(resource.tags) : null,
      typeof request.content === "string" ? request.content : request.content.toString("utf-8"),
      resource.createdAt,
      resource.updatedAt
    );

    logger.info("Resource published", { locator: request.locator });
    return resource;
  }

  async link(request: PublishResourceRequest): Promise<Resource> {
    // In local context, link is the same as publish
    return this.publish(request);
  }

  async resolve(locator: string): Promise<ResolveResourceResponse | null> {
    const stmt = this.db.prepare(`
      SELECT id, domain, path, name, type, version, locator, description, tags, content, created_at, updated_at
      FROM resources WHERE locator = ?
    `);
    const row = stmt.get(locator) as {
      id: string;
      domain: string;
      path: string | null;
      name: string;
      type: string;
      version: string;
      locator: string;
      description: string | null;
      tags: string | null;
      content: string | null;
      created_at: number;
      updated_at: number;
    } | null;

    if (!row) {
      return null;
    }

    return {
      locator: row.locator,
      manifest: {
        domain: row.domain,
        path: row.path ?? undefined,
        name: row.name,
        type: row.type,
        version: row.version,
        description: row.description ?? undefined,
      },
      content: row.content ?? "",
    };
  }

  async exists(locator: string): Promise<boolean> {
    const stmt = this.db.prepare("SELECT 1 FROM resources WHERE locator = ?");
    const row = stmt.get(locator);
    return row !== null && row !== undefined;
  }

  async delete(locator: string): Promise<boolean> {
    const existing = await this.exists(locator);
    if (!existing) {
      return false;
    }

    const stmt = this.db.prepare("DELETE FROM resources WHERE locator = ?");
    stmt.run(locator);

    logger.info("Resource deleted", { locator });
    return true;
  }

  async search(query: ResourceQuery = {}): Promise<ResourceListResponse> {
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (query.domain) {
      conditions.push("domain = ?");
      values.push(query.domain);
    }
    if (query.type) {
      conditions.push("type = ?");
      values.push(query.type);
    }
    if (query.name) {
      conditions.push("name LIKE ?");
      values.push(`%${query.name}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = query.limit ?? 100;
    const offset = query.offset ?? 0;

    // Get total count
    const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM resources ${whereClause}`);
    const countRow = countStmt.get(...values) as { count: number };
    const total = countRow.count;

    // Get items
    const stmt = this.db.prepare(`
      SELECT id, domain, path, name, type, version, locator, description, tags, created_at, updated_at
      FROM resources ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = stmt.all(...values, limit, offset) as Array<{
      id: string;
      domain: string;
      path: string | null;
      name: string;
      type: string;
      version: string;
      locator: string;
      description: string | null;
      tags: string | null;
      created_at: number;
      updated_at: number;
    }>;

    const items: Resource[] = rows.map((row) => ({
      id: row.id,
      domain: row.domain,
      path: row.path ?? undefined,
      name: row.name,
      type: row.type,
      version: row.version,
      locator: row.locator,
      description: row.description ?? undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return { items, total, limit, offset };
  }

  private async findByLocator(locator: string): Promise<Resource | null> {
    const stmt = this.db.prepare(`
      SELECT id, domain, path, name, type, version, locator, description, tags, created_at, updated_at
      FROM resources WHERE locator = ?
    `);
    const row = stmt.get(locator) as {
      id: string;
      domain: string;
      path: string | null;
      name: string;
      type: string;
      version: string;
      locator: string;
      description: string | null;
      tags: string | null;
      created_at: number;
      updated_at: number;
    } | null;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      domain: row.domain,
      path: row.path ?? undefined,
      name: row.name,
      type: row.type,
      version: row.version,
      locator: row.locator,
      description: row.description ?? undefined,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  close(): void {
    this.db.close();
    logger.debug("Registry database closed");
  }
}
