/**
 * Commands Module
 *
 * Aggregates all command definitions from domain modules.
 */

// Command definition utilities
export { defineCommand } from "./define.js";
export type {
  Command,
  CommandInput,
  CommandOutput,
  CommandContext,
  HttpMethod,
  HttpMeta,
} from "./define.js";

// Tenant commands
export { tenantCommands } from "../tenant/commands.js";
export type { TenantContext, TenantCommands } from "../tenant/commands.js";

// Registry commands
export { registryCommands } from "../resource/commands.js";
export type { RegistryContext, RegistryCommands } from "../resource/commands.js";

// Aggregated commands
import { tenantCommands } from "../tenant/commands.js";
import { registryCommands } from "../resource/commands.js";

export const commands = {
  ...tenantCommands,
  ...registryCommands,
};

export type Commands = typeof commands;
