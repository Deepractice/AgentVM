/**
 * HTTP Application
 *
 * Main HTTP application that aggregates all routes.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { createLogger } from "commonxjs/logger";
import { createTenantRoutes } from "./tenants.js";
import { createRegistryRoutes } from "./registry.js";
import { createContext, type ContextConfig } from "../context.js";

const logger = createLogger("agentvm/http");

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
  app.use("*", cors());
  if (config.logging !== false) {
    app.use("*", honoLogger());
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
  app.route("/v1/registry", createRegistryRoutes(ctx));

  // Error handling
  app.onError((err, c) => {
    logger.error("HTTP Error", { error: err.message, stack: err.stack });

    if (err.name === "ZodError") {
      return c.json({ error: "Validation error", details: err }, 400);
    }

    return c.json({ error: "Internal server error" }, 500);
  });

  return app;
}
