/**
 * Tenant Commands
 *
 * Command definitions for tenant operations.
 */

import { z } from "zod";
import { defineCommand } from "../commands/define.js";
import type { Tenant } from "./types.js";
import type { TenantRepository } from "./TenantRepository.js";

/**
 * Context required for tenant commands
 */
export interface TenantContext {
  tenantRepo: TenantRepository;
}

/**
 * Tenant command definitions
 */
export const tenantCommands = {
  "tenant.create": defineCommand({
    description: "Create a new tenant",
    http: { method: "POST", path: "/v1/tenants/create" },
    input: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
    handler: async (input, ctx: TenantContext): Promise<Tenant> => {
      return ctx.tenantRepo.create(input);
    },
  }),

  "tenant.get": defineCommand({
    description: "Get a tenant by ID",
    http: { method: "POST", path: "/v1/tenants/get" },
    input: z.object({
      tenantId: z.string().min(1),
    }),
    handler: async (input, ctx: TenantContext): Promise<Tenant | null> => {
      return ctx.tenantRepo.findById(input.tenantId);
    },
  }),

  "tenant.list": defineCommand({
    description: "List all tenants",
    http: { method: "GET", path: "/v1/tenants/list" },
    input: z.object({}),
    handler: async (_input, ctx: TenantContext): Promise<Tenant[]> => {
      return ctx.tenantRepo.list();
    },
  }),

  "tenant.update": defineCommand({
    description: "Update a tenant",
    http: { method: "POST", path: "/v1/tenants/update" },
    input: z.object({
      tenantId: z.string().min(1),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }),
    handler: async (input, ctx: TenantContext): Promise<Tenant | null> => {
      const { tenantId, ...updates } = input;
      return ctx.tenantRepo.update(tenantId, updates);
    },
  }),

  "tenant.delete": defineCommand({
    description: "Delete a tenant",
    http: { method: "POST", path: "/v1/tenants/delete" },
    input: z.object({
      tenantId: z.string().min(1),
    }),
    handler: async (input, ctx: TenantContext): Promise<boolean> => {
      return ctx.tenantRepo.delete(input.tenantId);
    },
  }),
};

export type TenantCommands = typeof tenantCommands;
