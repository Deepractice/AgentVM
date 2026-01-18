/**
 * HTTP Application
 *
 * Main HTTP application that aggregates all routes.
 */

import { Hono } from "hono";
import { logger } from "hono/logger";
import { createTenantRoutes } from "./tenants.js";
import { createContext, type ContextConfig } from "../context.js";

/**
 * HTTP application configuration
 */
export interface HttpAppConfig extends ContextConfig {
  /**
   * Enable request logging
   */
  logging?: boolean;
}

/**
 * Create the HTTP application
 */
export function createHttpApp(config: HttpAppConfig = {}) {
  const app = new Hono();
  const ctx = createContext(config);

  // Middleware
  if (config.logging !== false) {
    app.use("*", logger());
  }

  // Health check
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      version: "0.1.0",
    });
  });

  // Mount routes
  app.route("/v1/tenants", createTenantRoutes(ctx));

  // Error handling
  app.onError((err, c) => {
    console.error("HTTP Error:", err);

    if (err.name === "ZodError") {
      return c.json({ error: "Validation error", details: err }, 400);
    }

    return c.json({ error: "Internal server error" }, 500);
  });

  return app;
}
