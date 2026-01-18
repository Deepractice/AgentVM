/**
 * Tenant HTTP Routes
 *
 * HTTP endpoints for tenant management, using tenant commands.
 */

import { Hono } from "hono";
import { tenantCommands } from "@agentvm/core";
import type { AppContext } from "../context.js";

/**
 * Create tenant routes
 */
export function createTenantRoutes(ctx: AppContext) {
  const app = new Hono();

  // POST /v1/tenants - Create a tenant
  app.post("/", async (c) => {
    const body = await c.req.json();
    const input = tenantCommands["tenant.create"].input.parse(body);
    const result = await tenantCommands["tenant.create"].handler(input, ctx);
    return c.json(result, 201);
  });

  // GET /v1/tenants - List all tenants
  app.get("/", async (c) => {
    const input = tenantCommands["tenant.list"].input.parse({});
    const result = await tenantCommands["tenant.list"].handler(input, ctx);
    return c.json(result);
  });

  // GET /v1/tenants/:id - Get a tenant by ID
  app.get("/:id", async (c) => {
    const tenantId = c.req.param("id");
    const input = tenantCommands["tenant.get"].input.parse({ tenantId });
    const result = await tenantCommands["tenant.get"].handler(input, ctx);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json(result);
  });

  // PUT /v1/tenants/:id - Update a tenant
  app.put("/:id", async (c) => {
    const tenantId = c.req.param("id");
    const body = await c.req.json();
    const input = tenantCommands["tenant.update"].input.parse({
      tenantId,
      ...body,
    });
    const result = await tenantCommands["tenant.update"].handler(input, ctx);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json(result);
  });

  // DELETE /v1/tenants/:id - Delete a tenant
  app.delete("/:id", async (c) => {
    const tenantId = c.req.param("id");
    const input = tenantCommands["tenant.delete"].input.parse({ tenantId });
    const result = await tenantCommands["tenant.delete"].handler(input, ctx);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json({ deleted: true });
  });

  return app;
}
