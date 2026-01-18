/**
 * @agentvm/avm - AgentVM Server
 *
 * Platform-specific implementation for AgentVM.
 * Implements interfaces defined in @agentvm/core.
 */

// Server
export { createServer, type ServerConfig, type Server } from "./server/index.js";

// HTTP
export { createHttpApp, type HttpAppConfig } from "./http/index.js";

// Client
export {
  createClient,
  type ClientConfig,
  type AvmClient,
  type TenantClient,
  type RegistryClient,
  type DeleteResponse,
} from "./client/index.js";

// Context
export { createContext, type AppContext, type ContextConfig } from "./context.js";

// Repositories
export { SQLiteTenantRepository } from "./repositories/index.js";

// Registry
export { LocalResourceRepository } from "./registry/index.js";

// Re-export from core
export * from "@agentvm/core";
