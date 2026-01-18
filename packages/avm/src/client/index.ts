/**
 * AgentVM Client
 *
 * Type-safe HTTP client generated from command definitions.
 */

import {
  commands,
  type Tenant,
  type Resource,
  type ResolveResourceResponse,
  type ResourceListResponse,
  type ExistsResponse,
  type DeleteResourceResponse,
} from "@agentvm/core";

// Re-export types for client consumers
export type {
  Tenant,
  Resource,
  ResolveResourceResponse,
  ResourceListResponse,
  ExistsResponse,
  DeleteResourceResponse,
};

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
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
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
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
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
  publish: (input: {
    locator: string;
    content: string;
    description?: string;
    tags?: string[];
  }) => Promise<Resource>;
  link: (input: {
    locator: string;
    content: string;
    description?: string;
    tags?: string[];
  }) => Promise<Resource>;
  resolve: (input: { locator: string }) => Promise<ResolveResourceResponse | null>;
  exists: (input: { locator: string }) => Promise<ExistsResponse>;
  delete: (input: { locator: string }) => Promise<DeleteResourceResponse>;
  search: (input?: {
    domain?: string;
    type?: string;
    name?: string;
    limit?: number;
    offset?: number;
  }) => Promise<ResourceListResponse>;
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
 * ```
 */
export function createClient(config: ClientConfig): AvmClient {
  const cmd = commands;

  return {
    tenant: {
      create: (input) =>
        makeRequest<Tenant>(
          config,
          cmd["tenant.create"].http.method,
          cmd["tenant.create"].http.path,
          input
        ),
      get: (input) =>
        makeRequest<Tenant | null>(
          config,
          cmd["tenant.get"].http.method,
          cmd["tenant.get"].http.path,
          input
        ),
      list: (input = {}) =>
        makeRequest<Tenant[]>(
          config,
          cmd["tenant.list"].http.method,
          cmd["tenant.list"].http.path,
          input
        ),
      update: (input) =>
        makeRequest<Tenant | null>(
          config,
          cmd["tenant.update"].http.method,
          cmd["tenant.update"].http.path,
          input
        ),
      delete: (input) =>
        makeRequest<DeleteResponse>(
          config,
          cmd["tenant.delete"].http.method,
          cmd["tenant.delete"].http.path,
          input
        ),
    },
    registry: {
      publish: (input) =>
        makeRequest<Resource>(
          config,
          cmd["registry.publish"].http.method,
          cmd["registry.publish"].http.path,
          input
        ),
      link: (input) =>
        makeRequest<Resource>(
          config,
          cmd["registry.link"].http.method,
          cmd["registry.link"].http.path,
          input
        ),
      resolve: (input) =>
        makeRequest<ResolveResourceResponse | null>(
          config,
          cmd["registry.resolve"].http.method,
          cmd["registry.resolve"].http.path,
          input
        ),
      exists: (input) =>
        makeGetRequest<ExistsResponse>(config, cmd["registry.exists"].http.path, input),
      delete: (input) =>
        makeRequest<DeleteResourceResponse>(
          config,
          cmd["registry.delete"].http.method,
          cmd["registry.delete"].http.path,
          input
        ),
      search: (input = {}) =>
        makeGetRequest<ResourceListResponse>(config, cmd["registry.search"].http.path, input),
    },
  };
}
