import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import type {
  LinkResponse,
  ResourceDetailResponse,
  ResolveResponse,
  SearchResponse,
} from "agentvm/client";

// Re-export types
export type { LinkResponse, ResourceDetailResponse, ResolveResponse, SearchResponse };

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
 * Hook to get resource details (without execution)
 */
export function useResourceDetail(locator: string) {
  return useQuery({
    queryKey: ["resource", "detail", locator],
    queryFn: async () => {
      return client.registry.getResource({ locator });
    },
    enabled: !!locator,
  });
}

/**
 * Hook to resolve a specific resource
 */
export function useResourceResolve() {
  return useMutation({
    mutationFn: async (input: { locator: string; args?: Record<string, unknown> }) => {
      return client.registry.resolve(input);
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

/**
 * Hook to search resources in the registry
 */
export function useResourceSearch(
  options: {
    query?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  return useQuery({
    queryKey: ["resources", "search", options.query, options.limit, options.offset],
    queryFn: async () => {
      return client.registry.search(options);
    },
  });
}
