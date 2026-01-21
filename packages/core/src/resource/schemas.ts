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
};

export type RegistrySchemas = typeof registrySchemas;
