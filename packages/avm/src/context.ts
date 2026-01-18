/**
 * Application Context
 *
 * Creates the runtime context that provides dependencies to command handlers.
 */

import type { TenantRepository, TenantContext } from "@agentvm/core";
import { SQLiteTenantRepository } from "./repositories/SQLiteTenantRepository.js";

/**
 * Application context configuration
 */
export interface ContextConfig {
  /**
   * Path to SQLite database
   */
  dbPath?: string;
}

/**
 * Full application context
 */
export interface AppContext extends TenantContext {
  tenantRepo: TenantRepository;
}

/**
 * Create application context with all dependencies
 */
export function createContext(config: ContextConfig = {}): AppContext {
  const dbPath = config.dbPath ?? ":memory:";

  return {
    tenantRepo: new SQLiteTenantRepository(dbPath),
  };
}
