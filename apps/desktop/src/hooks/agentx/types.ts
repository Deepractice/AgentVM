/**
 * AgentX Types for UI
 *
 * Conversation-first design for chat UI rendering.
 * Copied from @agentxjs/ui with minimal dependencies.
 */

import type {
  Message,
  AgentState,
  ToolCallMessage,
  ToolResultMessage,
  UserContentPart,
} from "agentxjs";

// ============================================================================
// Block Types
// ============================================================================

interface BlockBase {
  id: string;
  timestamp: number;
}

export type TextBlockStatus = "streaming" | "completed";

export interface TextBlockData extends BlockBase {
  type: "text";
  content: string;
  status: TextBlockStatus;
}

export type ToolBlockStatus = "planning" | "executing" | "success" | "error";

export interface ToolBlockData extends BlockBase {
  type: "tool";
  toolCallId: string;
  name: string;
  input: unknown;
  status: ToolBlockStatus;
  output?: unknown;
  startTime?: number;
  duration?: number;
}

export interface ImageBlockData extends BlockBase {
  type: "image";
  url: string;
  alt?: string;
}

export type BlockData = TextBlockData | ToolBlockData | ImageBlockData;

// Type guards
export function isTextBlock(block: BlockData): block is TextBlockData {
  return block.type === "text";
}

export function isToolBlock(block: BlockData): block is ToolBlockData {
  return block.type === "tool";
}

// ============================================================================
// Conversation Types
// ============================================================================

export type UserConversationStatus = "pending" | "success" | "error" | "interrupted";

export interface UserConversationData {
  type: "user";
  id: string;
  content: string | UserContentPart[];
  timestamp: number;
  status: UserConversationStatus;
  errorCode?: string;
}

export type AssistantConversationStatus =
  | "queued"
  | "processing"
  | "thinking"
  | "streaming"
  | "completed";

export interface AssistantConversationData {
  type: "assistant";
  id: string;
  messageIds: string[];
  timestamp: number;
  status: AssistantConversationStatus;
  blocks: BlockData[];
}

export interface ErrorConversationData {
  type: "error";
  id: string;
  content: string;
  timestamp: number;
  errorCode?: string;
}

export type ConversationData =
  | UserConversationData
  | AssistantConversationData
  | ErrorConversationData;

// Type guards
export function isUserConversation(
  conversation: ConversationData
): conversation is UserConversationData {
  return conversation.type === "user";
}

export function isAssistantConversation(
  conversation: ConversationData
): conversation is AssistantConversationData {
  return conversation.type === "assistant";
}

export function isErrorConversation(
  conversation: ConversationData
): conversation is ErrorConversationData {
  return conversation.type === "error";
}

// ============================================================================
// Agent Status
// ============================================================================

export type AgentStatus = AgentState;

// ============================================================================
// Conversation State (for reducer)
// ============================================================================

export interface ConversationState {
  conversations: ConversationData[];
  conversationIds: Set<string>;
  pendingToolCalls: Map<string, string>;
  streamingConversationId: string | null;
  currentTextBlockId: string | null;
  streamingText: string;
  errors: UIError[];
  agentStatus: AgentStatus;
}

export type ConversationAction =
  | { type: "LOAD_HISTORY"; messages: Message[] }
  | { type: "RESET" }
  | { type: "USER_CONVERSATION_ADD"; conversation: UserConversationData }
  | { type: "USER_CONVERSATION_STATUS"; status: UserConversationStatus; errorCode?: string }
  | { type: "ASSISTANT_CONVERSATION_START"; id: string }
  | { type: "ASSISTANT_CONVERSATION_STATUS"; status: AssistantConversationStatus }
  | { type: "ASSISTANT_CONVERSATION_MESSAGE_START"; messageId: string }
  | { type: "ASSISTANT_CONVERSATION_FINISH" }
  | { type: "TEXT_BLOCK_DELTA"; text: string }
  | { type: "TEXT_BLOCK_FINISH" }
  | { type: "TOOL_BLOCK_PLANNING"; toolCallId: string; toolName: string }
  | { type: "TOOL_BLOCK_ADD"; message: ToolCallMessage }
  | { type: "TOOL_BLOCK_RESULT"; message: ToolResultMessage }
  | { type: "ERROR_CONVERSATION_ADD"; message: Message }
  | { type: "ERROR_ADD"; error: UIError }
  | { type: "ERRORS_CLEAR" }
  | { type: "AGENT_STATUS"; status: AgentStatus };

// ============================================================================
// Error Types
// ============================================================================

export interface UIError {
  code: string;
  message: string;
  recoverable: boolean;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseAgentResult {
  conversations: ConversationData[];
  streamingText: string;
  currentTextBlockId: string | null;
  status: AgentStatus;
  errors: UIError[];
  send: (content: string | UserContentPart[]) => void;
  interrupt: () => void;
  isLoading: boolean;
  clearConversations: () => void;
  clearErrors: () => void;
  agentId: string | null;
}

export interface UseAgentOptions {
  onSend?: (content: string | UserContentPart[]) => void;
  onError?: (error: UIError) => void;
  onStatusChange?: (status: AgentStatus) => void;
}
