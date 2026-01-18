/**
 * Command Definition Utility
 *
 * Provides a type-safe way to define commands that can be executed
 * via HTTP, CLI, or any other transport.
 */

import { z } from "zod";

/**
 * HTTP method type
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

/**
 * HTTP metadata for command routing
 */
export interface HttpMeta {
  /**
   * HTTP method
   */
  method: HttpMethod;

  /**
   * URL path pattern (e.g., "/v1/tenants/:tenantId")
   */
  path: string;
}

/**
 * Command definition interface
 */
export interface Command<TInput = unknown, TOutput = unknown, TContext = unknown> {
  /**
   * Input validation schema
   */
  input: z.ZodType<TInput>;

  /**
   * Optional output validation schema
   */
  output?: z.ZodType<TOutput>;

  /**
   * Command handler function
   */
  handler: (input: TInput, ctx: TContext) => Promise<TOutput>;

  /**
   * HTTP routing metadata
   */
  http: HttpMeta;

  /**
   * Optional description for documentation
   */
  description?: string;
}

/**
 * Define a command with type inference
 */
export function defineCommand<TInput, TOutput, TContext>(
  config: Command<TInput, TOutput, TContext>
): Command<TInput, TOutput, TContext> {
  return config;
}

/**
 * Extract input type from a command
 */
export type CommandInput<T> = T extends Command<infer I, unknown, unknown> ? I : never;

/**
 * Extract output type from a command
 */
export type CommandOutput<T> = T extends Command<unknown, infer O, unknown> ? O : never;

/**
 * Extract context type from a command
 */
export type CommandContext<T> = T extends Command<unknown, unknown, infer C> ? C : never;
