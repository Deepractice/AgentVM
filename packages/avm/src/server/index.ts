/**
 * AgentVM Server
 *
 * HTTP Server + AgentX WebSocket integration.
 */

import { serve } from "@hono/node-server";
import { createLogger } from "commonxjs/logger";
import { createHttpApp } from "../http/index.js";

const logger = createLogger("agentvm/server");

export interface ServerConfig {
  port: number;
  host?: string;
  dataDir?: string;
  dbPath?: string;
}

export interface Server {
  close: () => void;
}

/**
 * Create and start the AgentVM server
 */
export async function createServer(config: ServerConfig): Promise<Server> {
  logger.info("Starting AgentVM server", { port: config.port, host: config.host });

  const app = createHttpApp({
    dbPath: config.dbPath ?? `${config.dataDir ?? "."}/agentvm.db`,
    logging: true,
  });

  const server = serve({
    fetch: app.fetch,
    port: config.port,
    hostname: config.host ?? "0.0.0.0",
  });

  logger.info("AgentVM server started", {
    url: `http://${config.host ?? "0.0.0.0"}:${config.port}`,
    health: `http://${config.host ?? "0.0.0.0"}:${config.port}/health`,
  });

  return {
    close: () => {
      logger.info("Shutting down AgentVM server");
      server.close();
    },
  };
}
