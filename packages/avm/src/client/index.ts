/**
 * AgentVM Client
 *
 * Type-safe HTTP client generated from command definitions.
 */

import { commands, type Tenant } from "@agentvm/core";

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
 * Full client interface
 */
export interface AvmClient {
  tenant: TenantClient;
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
  };
}
