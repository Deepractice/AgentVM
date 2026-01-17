/**
 * AgentVM Server
 *
 * HTTP Server + AgentX WebSocket integration.
 * To be implemented after core interfaces are defined.
 */

export interface ServerConfig {
  port: number;
  host?: string;
  dataDir?: string;
}

export async function createServer(_config: ServerConfig): Promise<void> {
  // TODO: Implement after core interfaces are defined
  // - HTTP Server (Hono)
  // - AgentX integration
  // - Tenant management
  throw new Error("Not implemented yet - waiting for core interfaces");
}
