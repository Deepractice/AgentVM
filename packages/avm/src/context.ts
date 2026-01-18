/**
 * Application Context
 *
 * Creates the runtime context that provides dependencies to command handlers.
 */

import type {
  TenantRepository,
  TenantContext,
  ResourceRepository,
  RegistryContext,
} from "@agentvm/core";
import { SQLiteTenantRepository } from "./repositories/SQLiteTenantRepository.js";
import { LocalResourceRepository } from "./registry/LocalResourceRepository.js";

/**
 * Application context configuration
 */
export interface ContextConfig {
  /**
   * Path to SQLite database
   */
  dbPath?: string;

  /**
   * Path to registry database (defaults to dbPath)
   */
  registryDbPath?: string;
}

/**
 * Full application context
 */
export interface AppContext extends TenantContext, RegistryContext {
  tenantRepo: TenantRepository;
  resourceRepo: ResourceRepository;
}

/**
 * Create application context with all dependencies
 */
export function createContext(config: ContextConfig = {}): AppContext {
  const dbPath = config.dbPath ?? ":memory:";
  const registryDbPath = config.registryDbPath ?? dbPath;

  return {
    tenantRepo: new SQLiteTenantRepository(dbPath),
    resourceRepo: new LocalResourceRepository(registryDbPath),
  };
}
