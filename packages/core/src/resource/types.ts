/**
 * Resource Types
 *
 * Type definitions for resources in the registry.
 */

/**
 * Resource entity
 */
export interface Resource {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Domain (e.g., "localhost", "deepractice.ai")
   */
  domain: string;

  /**
   * Path within domain (e.g., "sean", "org/team")
   */
  path?: string;

  /**
   * Resource name
   */
  name: string;

  /**
   * Resource type (e.g., "text", "json", "prompt")
   */
  type: string;

  /**
   * Version (e.g., "1.0.0")
   */
  version: string;

  /**
   * Full locator string (e.g., "localhost/sean/hello.text@1.0.0")
   */
  locator: string;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Optional tags for categorization
   */
  tags?: string[];

  /**
   * Creation timestamp
   */
  createdAt: number;

  /**
   * Last update timestamp
   */
  updatedAt: number;
}

/**
 * Request to publish a resource
 */
export interface PublishResourceRequest {
  /**
   * Full locator string
   */
  locator: string;

  /**
   * Resource content
   */
  content: string | Buffer;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Optional tags
   */
  tags?: string[];
}

/**
 * Request to resolve a resource
 */
export interface ResolveResourceRequest {
  /**
   * Full locator string
   */
  locator: string;
}

/**
 * Response from resolving a resource
 */
export interface ResolveResourceResponse {
  /**
   * Full locator string
   */
  locator: string;

  /**
   * Resource manifest (metadata)
   */
  manifest: {
    domain: string;
    path?: string;
    name: string;
    type: string;
    version: string;
    description?: string;
  };

  /**
   * Resource content
   */
  content: string;
}

/**
 * Query parameters for searching resources
 */
export interface ResourceQuery {
  /**
   * Filter by domain
   */
  domain?: string;

  /**
   * Filter by type
   */
  type?: string;

  /**
   * Filter by name
   */
  name?: string;

  /**
   * Maximum number of results
   */
  limit?: number;

  /**
   * Offset for pagination
   */
  offset?: number;
}

/**
 * Paginated list response
 */
export interface ResourceListResponse {
  items: Resource[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Exists check response
 */
export interface ExistsResponse {
  exists: boolean;
}

/**
 * Delete response
 */
export interface DeleteResourceResponse {
  deleted: boolean;
}
