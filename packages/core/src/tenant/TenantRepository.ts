/**
 * Tenant Repository Interface
 *
 * Abstract persistence layer for Tenant entity.
 * Implementations: SQLiteTenantRepository (avm), D1TenantRepository (cloud), etc.
 */

import type { Tenant, CreateTenantRequest, UpdateTenantRequest } from "./types.js";

/**
 * Repository interface for Tenant persistence
 */
export interface TenantRepository {
  /**
   * Create a new tenant
   */
  create(request: CreateTenantRequest): Promise<Tenant>;

  /**
   * Find tenant by ID
   * @returns Tenant if found, null otherwise
   */
  findById(tenantId: string): Promise<Tenant | null>;

  /**
   * Update an existing tenant
   * @returns Updated tenant if found, null otherwise
   */
  update(tenantId: string, request: UpdateTenantRequest): Promise<Tenant | null>;

  /**
   * Delete a tenant
   * @returns true if deleted, false if not found
   */
  delete(tenantId: string): Promise<boolean>;

  /**
   * List all tenants
   */
  list(): Promise<Tenant[]>;
}
