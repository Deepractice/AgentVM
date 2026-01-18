/**
 * Registry HTTP Routes
 *
 * RPC-style HTTP endpoints for resource registry operations.
 */

import { Hono } from "hono";
import { registryCommands } from "@agentvm/core";
import type { AppContext } from "../context.js";

/**
 * Create registry routes (RPC style)
 */
export function createRegistryRoutes(ctx: AppContext) {
  const app = new Hono();

  // POST /v1/registry/publish - Publish a resource
  app.post("/publish", async (c) => {
    const body = await c.req.json();
    const input = registryCommands["registry.publish"].input.parse(body);
    const result = await registryCommands["registry.publish"].handler(input, ctx);
    return c.json(result, 201);
  });

  // POST /v1/registry/link - Link a resource to local registry
  app.post("/link", async (c) => {
    const body = await c.req.json();
    const input = registryCommands["registry.link"].input.parse(body);
    const result = await registryCommands["registry.link"].handler(input, ctx);
    return c.json(result, 201);
  });

  // POST /v1/registry/resolve - Resolve a resource
  app.post("/resolve", async (c) => {
    const body = await c.req.json();
    const input = registryCommands["registry.resolve"].input.parse(body);
    const result = await registryCommands["registry.resolve"].handler(input, ctx);

    if (!result) {
      return c.json({ error: "Resource not found" }, 404);
    }

    return c.json(result);
  });

  // GET /v1/registry/exists - Check if resource exists
  app.get("/exists", async (c) => {
    const locator = c.req.query("locator");
    if (!locator) {
      return c.json({ error: "locator query parameter is required" }, 400);
    }
    const input = registryCommands["registry.exists"].input.parse({ locator });
    const result = await registryCommands["registry.exists"].handler(input, ctx);
    return c.json(result);
  });

  // POST /v1/registry/delete - Delete a resource
  app.post("/delete", async (c) => {
    const body = await c.req.json();
    const input = registryCommands["registry.delete"].input.parse(body);
    const result = await registryCommands["registry.delete"].handler(input, ctx);

    if (!result.deleted) {
      return c.json({ error: "Resource not found" }, 404);
    }

    return c.json(result);
  });

  // GET /v1/registry/search - Search resources
  app.get("/search", async (c) => {
    const query = {
      domain: c.req.query("domain"),
      type: c.req.query("type"),
      name: c.req.query("name"),
      limit: c.req.query("limit") ? parseInt(c.req.query("limit")!, 10) : undefined,
      offset: c.req.query("offset") ? parseInt(c.req.query("offset")!, 10) : undefined,
    };
    const input = registryCommands["registry.search"].input.parse(query);
    const result = await registryCommands["registry.search"].handler(input, ctx);
    return c.json(result);
  });

  return app;
}
