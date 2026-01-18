/**
 * AgentVM Resource Types
 *
 * Custom resource type definitions for AI resources.
 */

export { promptType } from "./prompt.js";

// Re-export all types as array for convenience
import { promptType } from "./prompt.js";
import type { ResourceType } from "resourcexjs";

/**
 * All AgentVM resource types
 */
export const agentVMTypes: ResourceType[] = [promptType];
