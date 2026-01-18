/**
 * AgentVM Server
 *
 * HTTP Server + AgentX WebSocket integration.
 */

import { serve } from "@hono/node-server";
import { createHttpApp } from "../http/index.js";

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
  const app = createHttpApp({
    dbPath: config.dbPath ?? `${config.dataDir ?? "."}/agentvm.db`,
    logging: true,
  });

  const server = serve({
    fetch: app.fetch,
    port: config.port,
    hostname: config.host ?? "0.0.0.0",
  });

  console.log(`AgentVM server listening on http://${config.host ?? "0.0.0.0"}:${config.port}`);
  console.log(`Health check: http://${config.host ?? "0.0.0.0"}:${config.port}/health`);

  return {
    close: () => server.close(),
  };
}
