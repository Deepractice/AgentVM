/**
 * Tenant Schemas
 *
 * Schema definitions for tenant operations.
 * Only input validation and http metadata - handlers are in avm.
 */

import { z } from "zod";

/**
 * Tenant schemas (no handlers - they are in avm)
 */
export const tenantSchemas = {
  "tenant.create": {
    description: "Create a new tenant",
    http: { method: "POST" as const, path: "/v1/tenants/create" },
    input: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
  },

  "tenant.get": {
    description: "Get a tenant by ID",
    http: { method: "POST" as const, path: "/v1/tenants/get" },
    input: z.object({
      tenantId: z.string().min(1),
    }),
  },

  "tenant.list": {
    description: "List all tenants",
    http: { method: "GET" as const, path: "/v1/tenants/list" },
    input: z.object({}),
  },

  "tenant.update": {
    description: "Update a tenant",
    http: { method: "POST" as const, path: "/v1/tenants/update" },
    input: z.object({
      tenantId: z.string().min(1),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }),
  },

  "tenant.delete": {
    description: "Delete a tenant",
    http: { method: "POST" as const, path: "/v1/tenants/delete" },
    input: z.object({
      tenantId: z.string().min(1),
    }),
  },
};

export type TenantSchemas = typeof tenantSchemas;
