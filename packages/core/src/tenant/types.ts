/**
 * Tenant Types
 *
 * Tenant is the core isolation unit in AgentVM, mapping to AgentX Container.
 */

/**
 * Tenant entity
 */
export interface Tenant {
  /** Unique tenant identifier */
  tenantId: string;
  /** Tenant name */
  name: string;
  /** Optional description */
  description?: string;
  /** Created timestamp (Unix ms) */
  createdAt: number;
  /** Updated timestamp (Unix ms) */
  updatedAt: number;
}

/**
 * Request to create a new tenant
 */
export interface CreateTenantRequest {
  /** Tenant name */
  name: string;
  /** Optional description */
  description?: string;
}

/**
 * Request to update an existing tenant
 */
export interface UpdateTenantRequest {
  /** New name (optional) */
  name?: string;
  /** New description (optional) */
  description?: string;
}
