/**
 * AgentVM Client
 *
 * Type-safe HTTP client using schemas from core.
 * Safe to use in browser/renderer process.
 */

import {
  schemas,
  type Tenant,
  type LinkResponse,
  type ResolveResponse,
  type ExistsResponse,
  type DeleteResponse as CoreDeleteResponse,
  type SearchResponse,
} from "@agentvm/core";
import { type ApiError } from "../http/errors.js";

// Re-export types for client consumers
export type { Tenant, LinkResponse, ResolveResponse, ExistsResponse, SearchResponse };
export type { ApiError };

/**
 * API request error with structured error info
 */
export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly apiError: ApiError
  ) {
    super(apiError.message);
    this.name = "ApiRequestError";
  }
}

/**
 * Client configuration
 */
export interface ClientConfig {
  /**
   * Base URL for the AgentVM server
   */
  baseUrl: string;

  /**
   * Optional fetch implementation (defaults to global fetch)
   */
  fetch?: typeof fetch;

  /**
   * Optional headers to include in all requests
   */
  headers?: Record<string, string>;
}

/**
 * HTTP method type
 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/**
 * Replace path parameters (e.g., :tenantId) with actual values
 */
function buildUrl(
  baseUrl: string,
  path: string,
  input: Record<string, unknown>
): { url: string; body: Record<string, unknown> } {
  let url = `${baseUrl}${path}`;
  const body: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    const placeholder = `:${key}`;
    if (url.includes(placeholder)) {
      url = url.replace(placeholder, encodeURIComponent(String(value)));
    } else {
      body[key] = value;
    }
  }

  return { url, body };
}

/**
 * Make an HTTP request
 */
async function makeRequest<T>(
  config: ClientConfig,
  method: HttpMethod,
  path: string,
  input: Record<string, unknown> = {}
): Promise<T> {
  const fetchFn = config.fetch ?? fetch;
  const { url, body } = buildUrl(config.baseUrl, path, input);

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  };

  // Add body for POST/PUT requests
  if (method === "POST" || method === "PUT") {
    options.body = JSON.stringify(body);
  }

  const response = await fetchFn(url, options);

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new ApiRequestError(response.status, body);
  }

  return response.json() as Promise<T>;
}

/**
 * Make a GET request with query string
 */
async function makeGetRequest<T>(
  config: ClientConfig,
  path: string,
  query: Record<string, unknown> = {}
): Promise<T> {
  const fetchFn = config.fetch ?? fetch;

  // Build query string
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  const url = `${config.baseUrl}${path}${queryString ? `?${queryString}` : ""}`;

  const options: RequestInit = {
    method: "GET",
    headers: {
      ...config.headers,
    },
  };

  const response = await fetchFn(url, options);

  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new ApiRequestError(response.status, body);
  }

  return response.json() as Promise<T>;
}

/**
 * Delete response type
 */
export interface DeleteResponse {
  deleted: boolean;
}

/**
 * Tenant client interface
 */
export interface TenantClient {
  create: (input: { name: string; description?: string }) => Promise<Tenant>;
  get: (input: { tenantId: string }) => Promise<Tenant | null>;
  list: (input?: Record<string, never>) => Promise<Tenant[]>;
  update: (input: {
    tenantId: string;
    name?: string;
    description?: string;
  }) => Promise<Tenant | null>;
  delete: (input: { tenantId: string }) => Promise<DeleteResponse>;
}

/**
 * Registry client interface
 */
export interface RegistryClient {
  link: (input: { folderPath: string }) => Promise<LinkResponse>;
  resolve: (input: { locator: string }) => Promise<ResolveResponse>;
  exists: (input: { locator: string }) => Promise<ExistsResponse>;
  delete: (input: { locator: string }) => Promise<CoreDeleteResponse>;
  search: (input: { query?: string; limit?: number; offset?: number }) => Promise<SearchResponse>;
}

/**
 * Full client interface
 */
export interface AvmClient {
  tenant: TenantClient;
  registry: RegistryClient;
}

/**
 * Create a type-safe AgentVM client
 *
 * @example
 * ```typescript
 * const client = createClient({ baseUrl: "http://localhost:8080" });
 *
 * // Type-safe API calls
 * const tenant = await client.tenant.create({ name: "My Tenant" });
 * const list = await client.tenant.list();
 *
 * // Link a resource folder
 * const result = await client.registry.link({ folderPath: "/path/to/resource" });
 * ```
 */
export function createClient(config: ClientConfig): AvmClient {
  return {
    tenant: {
      create: (input) =>
        makeRequest<Tenant>(
          config,
          schemas["tenant.create"].http.method,
          schemas["tenant.create"].http.path,
          input
        ),
      get: (input) =>
        makeRequest<Tenant | null>(
          config,
          schemas["tenant.get"].http.method,
          schemas["tenant.get"].http.path,
          input
        ),
      list: (input = {}) =>
        makeGetRequest<Tenant[]>(config, schemas["tenant.list"].http.path, input),
      update: (input) =>
        makeRequest<Tenant | null>(
          config,
          schemas["tenant.update"].http.method,
          schemas["tenant.update"].http.path,
          input
        ),
      delete: (input) =>
        makeRequest<DeleteResponse>(
          config,
          schemas["tenant.delete"].http.method,
          schemas["tenant.delete"].http.path,
          input
        ),
    },
    registry: {
      link: (input) =>
        makeRequest<LinkResponse>(
          config,
          schemas["registry.link"].http.method,
          schemas["registry.link"].http.path,
          input
        ),
      resolve: (input) =>
        makeRequest<ResolveResponse>(
          config,
          schemas["registry.resolve"].http.method,
          schemas["registry.resolve"].http.path,
          input
        ),
      exists: (input) =>
        makeGetRequest<ExistsResponse>(config, schemas["registry.exists"].http.path, input),
      delete: (input) =>
        makeRequest<CoreDeleteResponse>(
          config,
          schemas["registry.delete"].http.method,
          schemas["registry.delete"].http.path,
          input
        ),
      search: (input) =>
        makeGetRequest<SearchResponse>(config, schemas["registry.search"].http.path, input),
    },
  };
}
