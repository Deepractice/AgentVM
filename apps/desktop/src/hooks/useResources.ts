import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import type { LinkResponse, ResolveResponse } from "agentvm/client";

// Re-export types
export type { LinkResponse, ResolveResponse };

/**
 * Hook to link a resource folder to local registry
 */
export function useResourceLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (folderPath: string) => {
      return client.registry.link({ folderPath });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

/**
 * Hook to resolve a specific resource
 */
export function useResourceResolve() {
  return useMutation({
    mutationFn: async (locator: string) => {
      return client.registry.resolve({ locator });
    },
  });
}

/**
 * Hook to delete a resource
 */
export function useResourceDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locator: string) => {
      return client.registry.delete({ locator });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

/**
 * Hook to check if a resource exists
 */
export function useResourceExists() {
  return useMutation({
    mutationFn: async (locator: string) => {
      return client.registry.exists({ locator });
    },
  });
}
