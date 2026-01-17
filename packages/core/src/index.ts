/**
 * @agentvm/core - Core types and interfaces for AgentVM
 *
 * Platform-agnostic abstractions.
 * No concrete implementations, no platform dependencies.
 */

export const VERSION = "0.1.0";

// Tenant
export type {
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantRepository,
} from "./tenant/index.js";
