/**
 * Tenant HTTP Routes
 *
 * RPC-style HTTP endpoints for tenant management.
 */

import { Hono } from "hono";
import { tenantCommands } from "@agentvm/core";
import type { AppContext } from "../context.js";

/**
 * Create tenant routes (RPC style)
 */
export function createTenantRoutes(ctx: AppContext) {
  const app = new Hono();

  // POST /v1/tenants/create - Create a tenant
  app.post("/create", async (c) => {
    const body = await c.req.json();
    const input = tenantCommands["tenant.create"].input.parse(body);
    const result = await tenantCommands["tenant.create"].handler(input, ctx);
    return c.json(result, 201);
  });

  // POST /v1/tenants/get - Get a tenant by ID
  app.post("/get", async (c) => {
    const body = await c.req.json();
    const input = tenantCommands["tenant.get"].input.parse(body);
    const result = await tenantCommands["tenant.get"].handler(input, ctx);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json(result);
  });

  // GET /v1/tenants/list - List all tenants
  app.get("/list", async (c) => {
    const input = tenantCommands["tenant.list"].input.parse({});
    const result = await tenantCommands["tenant.list"].handler(input, ctx);
    return c.json(result);
  });

  // POST /v1/tenants/update - Update a tenant
  app.post("/update", async (c) => {
    const body = await c.req.json();
    const input = tenantCommands["tenant.update"].input.parse(body);
    const result = await tenantCommands["tenant.update"].handler(input, ctx);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json(result);
  });

  // POST /v1/tenants/delete - Delete a tenant
  app.post("/delete", async (c) => {
    const body = await c.req.json();
    const input = tenantCommands["tenant.delete"].input.parse(body);
    const result = await tenantCommands["tenant.delete"].handler(input, ctx);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json({ deleted: true });
  });

  return app;
}
