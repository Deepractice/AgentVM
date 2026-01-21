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
import type { RXR } from "resourcexjs";

/**
 * Convert RXR to response format
 */
async function rxrToResponse(rxr: RXR) {
  // Get all files from RXC archive
  const filesMap = await rxr.content.files();
  const files: Record<string, string> = {};
  for (const [path, buffer] of filesMap) {
    files[path] = buffer.toString("utf-8");
  }

  return {
    locator: rxr.locator.toString(),
    manifest: {
      domain: rxr.manifest.domain,
      path: rxr.manifest.path,
      name: rxr.manifest.name,
      type: rxr.manifest.type,
      version: rxr.manifest.version,
    },
    files,
  };
}

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

  // POST /v1/registry/resolve - Resolve a resource
  app.post("/resolve", async (c) => {
    const body = await c.req.json();
    const input = registrySchemas["registry.resolve"].input.parse(body);

    try {
      const rxr = await ctx.registry.resolve(input.locator);
      const response = await rxrToResponse(rxr);
      return c.json(response);
    } catch (_error) {
      return c.json({ error: "Resource not found" }, 404);
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
