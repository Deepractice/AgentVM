/**
 * Schemas Module
 *
 * Aggregates all schema definitions.
 * Schemas define input validation and http metadata only - no handlers.
 */

// Tenant schemas
export { tenantSchemas, type TenantSchemas } from "../tenant/schemas.js";

// Registry schemas
export { registrySchemas, type RegistrySchemas } from "../resource/schemas.js";

// Aggregated schemas
import { tenantSchemas } from "../tenant/schemas.js";
import { registrySchemas } from "../resource/schemas.js";

export const schemas = {
  ...tenantSchemas,
  ...registrySchemas,
};

export type Schemas = typeof schemas;
