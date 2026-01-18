/**
 * Resource Repository Interface
 *
 * Abstract persistence layer for Resource entity.
 * Implementations: LocalResourceRepository (avm), etc.
 */

import type {
  Resource,
  PublishResourceRequest,
  ResolveResourceResponse,
  ResourceQuery,
  ResourceListResponse,
} from "./types.js";

/**
 * Repository interface for Resource persistence
 */
export interface ResourceRepository {
  /**
   * Publish a new resource or update existing
   */
  publish(request: PublishResourceRequest): Promise<Resource>;

  /**
   * Link a resource to local registry (alias for publish in local context)
   */
  link(request: PublishResourceRequest): Promise<Resource>;

  /**
   * Resolve a resource by locator
   * @returns Resource with content if found, null otherwise
   */
  resolve(locator: string): Promise<ResolveResourceResponse | null>;

  /**
   * Check if a resource exists
   */
  exists(locator: string): Promise<boolean>;

  /**
   * Delete a resource
   * @returns true if deleted, false if not found
   */
  delete(locator: string): Promise<boolean>;

  /**
   * Search resources
   */
  search(query?: ResourceQuery): Promise<ResourceListResponse>;
}
