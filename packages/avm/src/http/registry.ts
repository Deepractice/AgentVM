/**
 * Registry HTTP Routes
 *
 * RPC-style HTTP endpoints for resource registry operations.
 * Handlers use ResourceX directly for resource management.
 */

import { Hono } from "hono";
import { registrySchemas } from "@agentvm/core";
import type { AppContext } from "../context.js";
import { loadResource } from "resourcexjs";

/**
 * Create registry routes (RPC style)
 */
export function createRegistryRoutes(ctx: AppContext) {
  const app = new Hono();

  // POST /v1/registry/link - Link a resource folder to local registry
  app.post("/link", async (c) => {
    const body = await c.req.json();
    const input = registrySchemas["registry.link"].input.parse(body);

    const rxr = await loadResource(input.folderPath);
    await ctx.registry.link(rxr);

    return c.json({ locator: rxr.locator.toString() }, 201);
  });

  // GET /v1/registry/resource - Get resource details (without executing)
  app.get("/resource", async (c) => {
    const locator = c.req.query("locator");
    if (!locator) {
      return c.json({ error: "locator query parameter is required" }, 400);
    }

    try {
      const resolved = await ctx.registry.resolve(locator);
      const rxr = resolved.resource;

      return c.json({
        locator: rxr.locator.toString(),
        manifest: {
          domain: rxr.manifest.domain,
          path: rxr.manifest.path,
          name: rxr.manifest.name,
          type: rxr.manifest.type,
          version: rxr.manifest.version,
          description: (rxr.manifest as { description?: string }).description,
        },
        schema: resolved.schema,
      });
    } catch (error) {
      console.error("Get resource error:", error);
      return c.json({ error: error instanceof Error ? error.message : "Resource not found" }, 404);
    }
  });

  // POST /v1/registry/resolve - Execute resolve to get content
  app.post("/resolve", async (c) => {
    const body = await c.req.json();
    const input = registrySchemas["registry.resolve"].input.parse(body);

    try {
      const resolved = await ctx.registry.resolve(input.locator);
      const rxr = resolved.resource;

      // Execute with optional args to get content

      const content = await resolved.execute(input.args as any);

      return c.json({
        locator: rxr.locator.toString(),
        manifest: {
          domain: rxr.manifest.domain,
          path: rxr.manifest.path,
          name: rxr.manifest.name,
          type: rxr.manifest.type,
          version: rxr.manifest.version,
        },
        content,
        schema: resolved.schema,
      });
    } catch (error) {
      console.error("Resolve error:", error);
      return c.json({ error: error instanceof Error ? error.message : "Resource not found" }, 404);
    }
  });

  // GET /v1/registry/exists - Check if resource exists
  app.get("/exists", async (c) => {
    const locator = c.req.query("locator");
    if (!locator) {
      return c.json({ error: "locator query parameter is required" }, 400);
    }

    const input = registrySchemas["registry.exists"].input.parse({ locator });
    const exists = await ctx.registry.exists(input.locator);

    return c.json({ exists });
  });

  // POST /v1/registry/delete - Delete a resource
  app.post("/delete", async (c) => {
    const body = await c.req.json();
    const input = registrySchemas["registry.delete"].input.parse(body);

    try {
      await ctx.registry.delete(input.locator);
      return c.json({ deleted: true });
    } catch (_error) {
      return c.json({ error: "Resource not found" }, 404);
    }
  });

  // GET /v1/registry/search - Search resources
  app.get("/search", async (c) => {
    const query = c.req.query("query");
    const limit = c.req.query("limit");
    const offset = c.req.query("offset");

    const input = registrySchemas["registry.search"].input.parse({
      query,
      limit,
      offset,
    });

    const locators = await ctx.registry.search({
      query: input.query,
      limit: input.limit,
      offset: input.offset,
    });

    const results = locators.map((rxl) => ({
      locator: rxl.toString(),
      domain: rxl.domain ?? "localhost",
      path: rxl.path,
      name: rxl.name,
      type: rxl.type ?? "",
      version: rxl.version ?? "latest",
    }));

    return c.json({
      results,
      total: results.length,
      limit: input.limit,
      offset: input.offset,
    });
  });

  return app;
}
