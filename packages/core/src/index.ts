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

// Commands
export { defineCommand, commands, tenantCommands } from "./commands/index.js";

export type {
  Command,
  CommandInput,
  CommandOutput,
  CommandContext,
  Commands,
  TenantContext,
  TenantCommands,
  HttpMethod,
  HttpMeta,
} from "./commands/index.js";
