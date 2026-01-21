/**
 * HTTP Application
 *
 * Main HTTP application that aggregates all routes.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { createLogger } from "commonxjs/logger";
import { ResourceXError, LocatorError, ManifestError } from "resourcexjs";
import { createTenantRoutes } from "./tenants.js";
import { createRegistryRoutes } from "./registry.js";
import { createContext, type ContextConfig } from "../context.js";
import { ErrorCodes, type ApiError } from "./errors.js";

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

    const isDev = process.env.NODE_ENV !== "production";

    // Zod validation error
    if (err.name === "ZodError") {
      return c.json<ApiError>(
        {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "Validation error",
          details: err,
        },
        400
      );
    }

    // ResourceX errors
    if (err instanceof ResourceXError) {
      if (err instanceof LocatorError) {
        return c.json<ApiError>(
          {
            code: ErrorCodes.RESOURCE_NOT_FOUND,
            message: err.message,
          },
          404
        );
      }
      if (err instanceof ManifestError) {
        return c.json<ApiError>(
          {
            code: ErrorCodes.RESOURCE_INVALID,
            message: err.message,
          },
          400
        );
      }
      // Generic ResourceX error
      return c.json<ApiError>(
        {
          code: ErrorCodes.RESOURCE_LOAD_ERROR,
          message: err.message,
          details: isDev ? err.stack : undefined,
        },
        400
      );
    }

    // Unknown error
    return c.json<ApiError>(
      {
        code: ErrorCodes.INTERNAL_ERROR,
        message: isDev ? err.message : "Internal server error",
        details: isDev ? err.stack : undefined,
      },
      500
    );
  });

  return app;
}
