/**
 * @agentvm/core - Core types and schemas for AgentVM
 *
 * Platform-agnostic definitions.
 * No implementations, no Node.js dependencies.
 * Safe to use in browser/renderer process.
 */

export const VERSION = "0.1.0";

// Tenant types
export type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantRepository,
} from "./tenant/index.js";

// Registry response types
export type {
  LinkResponse,
  ResolveResponse,
  ExistsResponse,
  DeleteResponse,
  SearchResult,
  SearchResponse,
} from "./resource/index.js";

// Schemas (input validation + http metadata, no handlers)
export { schemas, tenantSchemas, registrySchemas } from "./schemas/index.js";

export type { Schemas, TenantSchemas, RegistrySchemas } from "./schemas/index.js";
