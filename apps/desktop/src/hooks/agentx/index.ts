/**
 * AgentX Hooks
 *
 * React hooks for integrating with AgentX.
 * Copied from @agentxjs/ui with minimal dependencies.
 */

export { useAgentX } from "./useAgentX";
export { useAgent } from "./useAgent";
export { useImages } from "./useImages";
export type { UseImagesResult, UseImagesOptions } from "./useImages";

// Re-export types
export type {
  // Block types
  TextBlockData,
  ToolBlockData,
  ImageBlockData,
  BlockData,
  TextBlockStatus,
  ToolBlockStatus,
  // Conversation types
  UserConversationData,
  AssistantConversationData,
  ErrorConversationData,
  ConversationData,
  UserConversationStatus,
  AssistantConversationStatus,
  // Agent types
  AgentStatus,
  UIError,
  UseAgentResult,
  UseAgentOptions,
  // Type guards
  isTextBlock,
  isToolBlock,
  isUserConversation,
  isAssistantConversation,
  isErrorConversation,
} from "./types";
