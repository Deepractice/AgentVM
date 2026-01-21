/**
 * Tenant HTTP Routes
 *
 * RPC-style HTTP endpoints for tenant management.
 * Handlers are implemented here, using schemas from core.
 */

import { Hono } from "hono";
import { tenantSchemas } from "@agentvm/core";
import type { AppContext } from "../context.js";

/**
 * Create tenant routes (RPC style)
 */
export function createTenantRoutes(ctx: AppContext) {
  const app = new Hono();

  // POST /v1/tenants/create - Create a tenant
  app.post("/create", async (c) => {
    const body = await c.req.json();
    const input = tenantSchemas["tenant.create"].input.parse(body);
    const result = await ctx.tenantRepo.create(input);
    return c.json(result, 201);
  });

  // POST /v1/tenants/get - Get a tenant by ID
  app.post("/get", async (c) => {
    const body = await c.req.json();
    const input = tenantSchemas["tenant.get"].input.parse(body);
    const result = await ctx.tenantRepo.findById(input.tenantId);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json(result);
  });

  // GET /v1/tenants/list - List all tenants
  app.get("/list", async (c) => {
    const result = await ctx.tenantRepo.list();
    return c.json(result);
  });

  // POST /v1/tenants/update - Update a tenant
  app.post("/update", async (c) => {
    const body = await c.req.json();
    const input = tenantSchemas["tenant.update"].input.parse(body);
    const { tenantId, ...updates } = input;
    const result = await ctx.tenantRepo.update(tenantId, updates);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json(result);
  });

  // POST /v1/tenants/delete - Delete a tenant
  app.post("/delete", async (c) => {
    const body = await c.req.json();
    const input = tenantSchemas["tenant.delete"].input.parse(body);
    const result = await ctx.tenantRepo.delete(input.tenantId);

    if (!result) {
      return c.json({ error: "Tenant not found" }, 404);
    }

    return c.json({ deleted: true });
  });

  return app;
}
