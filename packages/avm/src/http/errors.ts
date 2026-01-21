/**
 * HTTP Error Types
 *
 * Standard error response format for AVM HTTP API.
 */

/**
 * Standard API error response
 */
export interface ApiError {
  /**
   * Error code (e.g., "VALIDATION_ERROR", "RESOURCE_NOT_FOUND")
   */
  code: string;

  /**
   * User-friendly error message
   */
  message: string;

  /**
   * Optional detailed information (e.g., validation error fields, stack trace in dev)
   */
  details?: unknown;
}

/**
 * Error codes
 */
export const ErrorCodes = {
  // General
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",

  // Tenant
  TENANT_NOT_FOUND: "TENANT_NOT_FOUND",

  // Registry
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  RESOURCE_LOAD_ERROR: "RESOURCE_LOAD_ERROR",
  RESOURCE_INVALID: "RESOURCE_INVALID",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
