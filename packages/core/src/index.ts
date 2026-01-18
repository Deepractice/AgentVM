/**
 * @agentvm/core - Core types and interfaces for AgentVM
 *
 * Platform-agnostic abstractions.
 * No concrete implementations, no platform dependencies.
 */

export const VERSION = "0.1.0";

// Tenant types
export type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantRepository,
} from "./tenant/index.js";

// Resource types
export type {
  Resource,
  PublishResourceRequest,
  ResolveResourceRequest,
  ResolveResourceResponse,
  ResourceQuery,
  ResourceListResponse,
  ExistsResponse,
  DeleteResourceResponse,
  ResourceRepository,
} from "./resource/index.js";

// Commands
export { defineCommand, commands, tenantCommands, registryCommands } from "./commands/index.js";

export type {
  Command,
  CommandInput,
  CommandOutput,
  CommandContext,
  Commands,
  TenantContext,
  TenantCommands,
  RegistryContext,
  RegistryCommands,
  HttpMethod,
  HttpMeta,
} from "./commands/index.js";
