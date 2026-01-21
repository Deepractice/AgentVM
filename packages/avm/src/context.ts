/**
 * Application Context
 *
 * Creates the runtime context that provides dependencies to handlers.
 */

import { homedir } from "node:os";
import type { TenantRepository } from "@agentvm/core";
import type { Registry } from "resourcexjs";
import { createRegistry } from "resourcexjs";
import { agentVMTypes } from "@agentvm/resource-types";
import { SQLiteTenantRepository } from "./repositories/SQLiteTenantRepository.js";

/**
 * Application context configuration
 */
export interface ContextConfig {
  /**
   * Path to SQLite database for tenants
   */
  dbPath?: string;

  /**
   * Path to resource registry (defaults to ~/.agentvm/resources)
   */
  registryPath?: string;
}

/**
 * Full application context
 */
export interface AppContext {
  tenantRepo: TenantRepository;
  registry: Registry;
}

/**
 * Create application context with all dependencies
 */
export function createContext(config: ContextConfig = {}): AppContext {
  const dbPath = config.dbPath ?? ":memory:";
  const registryPath = config.registryPath ?? `${homedir()}/.agentvm/resources`;

  return {
    tenantRepo: new SQLiteTenantRepository(dbPath),
    registry: createRegistry({ path: registryPath, types: agentVMTypes }),
  };
}
