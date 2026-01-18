import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import type { Resource, ResourceListResponse } from "agentvm/client";

interface UseResourcesOptions {
  domain?: string;
  type?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

/**
 * Hook to search/list resources
 */
export function useResources(options: UseResourcesOptions = {}) {
  return useQuery({
    queryKey: ["resources", options],
    queryFn: async (): Promise<ResourceListResponse> => {
      return client.registry.search(options);
    },
  });
}

/**
 * Hook to get installed resources (domain = localhost)
 */
export function useInstalledResources(options: Omit<UseResourcesOptions, "domain"> = {}) {
  return useResources({ ...options, domain: "localhost" });
}

/**
 * Hook to resolve a specific resource
 */
export function useResourceResolve(locator: string | null) {
  return useQuery({
    queryKey: ["resource", locator],
    queryFn: async () => {
      if (!locator) return null;
      return client.registry.resolve({ locator });
    },
    enabled: !!locator,
  });
}

/**
 * Hook to publish a resource
 */
export function useResourcePublish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      locator: string;
      content: string;
      description?: string;
      tags?: string[];
    }) => {
      return client.registry.publish(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
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

export type { Resource, ResourceListResponse };
