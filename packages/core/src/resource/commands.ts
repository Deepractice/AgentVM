/**
 * Registry Commands
 *
 * Command definitions for resource registry operations.
 */

import { z } from "zod";
import { defineCommand } from "../commands/define.js";
import type {
  Resource,
  ResolveResourceResponse,
  ResourceListResponse,
  ExistsResponse,
  DeleteResourceResponse,
} from "./types.js";
import type { ResourceRepository } from "./ResourceRepository.js";

/**
 * Context required for registry commands
 */
export interface RegistryContext {
  resourceRepo: ResourceRepository;
}

/**
 * Registry command definitions
 */
export const registryCommands = {
  "registry.publish": defineCommand({
    description: "Publish a resource to the registry",
    http: { method: "POST", path: "/v1/registry/publish" },
    input: z.object({
      locator: z.string().min(1),
      content: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
    handler: async (input, ctx: RegistryContext): Promise<Resource> => {
      return ctx.resourceRepo.publish(input);
    },
  }),

  "registry.link": defineCommand({
    description: "Link a resource to local registry",
    http: { method: "POST", path: "/v1/registry/link" },
    input: z.object({
      locator: z.string().min(1),
      content: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
    handler: async (input, ctx: RegistryContext): Promise<Resource> => {
      return ctx.resourceRepo.link(input);
    },
  }),

  "registry.resolve": defineCommand({
    description: "Resolve a resource from the registry",
    http: { method: "POST", path: "/v1/registry/resolve" },
    input: z.object({
      locator: z.string().min(1),
    }),
    handler: async (input, ctx: RegistryContext): Promise<ResolveResourceResponse | null> => {
      return ctx.resourceRepo.resolve(input.locator);
    },
  }),

  "registry.exists": defineCommand({
    description: "Check if a resource exists in the registry",
    http: { method: "GET", path: "/v1/registry/exists" },
    input: z.object({
      locator: z.string().min(1),
    }),
    handler: async (input, ctx: RegistryContext): Promise<ExistsResponse> => {
      const exists = await ctx.resourceRepo.exists(input.locator);
      return { exists };
    },
  }),

  "registry.delete": defineCommand({
    description: "Delete a resource from the registry",
    http: { method: "POST", path: "/v1/registry/delete" },
    input: z.object({
      locator: z.string().min(1),
    }),
    handler: async (input, ctx: RegistryContext): Promise<DeleteResourceResponse> => {
      const deleted = await ctx.resourceRepo.delete(input.locator);
      return { deleted };
    },
  }),

  "registry.search": defineCommand({
    description: "Search resources in the registry",
    http: { method: "GET", path: "/v1/registry/search" },
    input: z.object({
      domain: z.string().optional(),
      type: z.string().optional(),
      name: z.string().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    }),
    handler: async (input, ctx: RegistryContext): Promise<ResourceListResponse> => {
      return ctx.resourceRepo.search(input);
    },
  }),
};

export type RegistryCommands = typeof registryCommands;
