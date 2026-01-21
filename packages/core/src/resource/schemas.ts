/**
 * Registry Commands
 *
 * Command definitions for resource registry operations.
 * Only defines schema and http metadata - handlers are in avm.
 */

import { z } from "zod";

/**
 * Response types
 */
export interface LinkResponse {
  locator: string;
}

export interface ResolveResponse {
  locator: string;
  manifest: {
    domain: string;
    path?: string;
    name: string;
    type: string;
    version: string;
  };
  files: Record<string, string>;
}

export interface ExistsResponse {
  exists: boolean;
}

export interface DeleteResponse {
  deleted: boolean;
}

export interface SearchResult {
  locator: string;
  domain: string;
  path?: string;
  name: string;
  type: string;
  version: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Registry command schemas (no handlers - they are in avm)
 */
export const registrySchemas = {
  "registry.link": {
    description: "Link a resource folder to local registry",
    http: { method: "POST" as const, path: "/v1/registry/link" },
    input: z.object({
      folderPath: z.string().min(1),
    }),
  },

  "registry.resolve": {
    description: "Resolve a resource from the registry",
    http: { method: "POST" as const, path: "/v1/registry/resolve" },
    input: z.object({
      locator: z.string().min(1),
    }),
  },

  "registry.exists": {
    description: "Check if a resource exists in the registry",
    http: { method: "GET" as const, path: "/v1/registry/exists" },
    input: z.object({
      locator: z.string().min(1),
    }),
  },

  "registry.delete": {
    description: "Delete a resource from the registry",
    http: { method: "POST" as const, path: "/v1/registry/delete" },
    input: z.object({
      locator: z.string().min(1),
    }),
  },

  "registry.search": {
    description: "Search resources in the registry",
    http: { method: "GET" as const, path: "/v1/registry/search" },
    input: z.object({
      query: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).optional().default(20),
      offset: z.coerce.number().int().min(0).optional().default(0),
    }),
  },
};

export type RegistrySchemas = typeof registrySchemas;
