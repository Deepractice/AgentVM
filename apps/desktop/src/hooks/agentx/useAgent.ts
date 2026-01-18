/**
 * useAgent - React hook for Agent event binding
 *
 * Conversation-first, Block-based design.
 * Copied from @agentxjs/ui with minimal dependencies.
 */

import { useReducer, useCallback, useRef, useEffect } from "react";
import type { AgentX, Message, UserContentPart } from "agentxjs";
import type { UserConversationData, UseAgentResult, UseAgentOptions, UIError } from "./types";
import { conversationReducer, initialConversationState } from "./conversationReducer";

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Helper to check if response is an error
function isErrorResponse(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  );
}

/**
 * React hook for binding to Agent events via AgentX
 */
export function useAgent(
  agentx: AgentX | null,
  imageId: string | null,
  options: UseAgentOptions = {}
): UseAgentResult {
  const { onSend, onError, onStatusChange } = options;

  const [state, dispatch] = useReducer(conversationReducer, initialConversationState);

  const agentIdRef = useRef<string | null>(null);

  const isLoading =
    state.agentStatus === "thinking" ||
    state.agentStatus === "responding" ||
    state.agentStatus === "planning_tool" ||
    state.agentStatus === "awaiting_tool_result";

  // Reset state when imageId changes
  useEffect(() => {
    dispatch({ type: "RESET" });
    agentIdRef.current = null;
  }, [imageId]);

  // Load message history
  useEffect(() => {
    if (!agentx || !imageId) return;

    let mounted = true;

    agentx
      .request("image_messages_request", { imageId })
      .then((response) => {
        if (!mounted) return;
        if (isErrorResponse(response.data)) {
          console.warn("[useAgent] Failed to load messages", imageId, response.data.error);
          return;
        }
        const data = response.data as unknown as { messages: Message[] };
        if (data.messages && data.messages.length > 0) {
          dispatch({ type: "LOAD_HISTORY", messages: data.messages });
          console.debug("[useAgent] Loaded messages", imageId, data.messages.length);
        }
      })
      .catch((err) => {
        console.error("[useAgent] Failed to load messages", imageId, err);
      });

    return () => {
      mounted = false;
    };
  }, [agentx, imageId]);

  // Subscribe to agent events
  useEffect(() => {
    if (!agentx || !imageId) return;

    const unsubscribes: Array<() => void> = [];

    const isForThisImage = (event: { context?: { imageId?: string } }): boolean => {
      return event.context?.imageId === imageId;
    };

    // Stream events - message_start
    unsubscribes.push(
      agentx.on("message_start", (event) => {
        if (!isForThisImage(event)) return;
        const data = event.data as { messageId: string };
        dispatch({ type: "ASSISTANT_CONVERSATION_MESSAGE_START", messageId: data.messageId });
      })
    );

    // Stream events - text_delta
    unsubscribes.push(
      agentx.on("text_delta", (event) => {
        if (!isForThisImage(event)) return;
        const data = event.data as { text: string };
        dispatch({ type: "TEXT_BLOCK_DELTA", text: data.text });
      })
    );

    // State events - conversation lifecycle
    unsubscribes.push(
      agentx.on("conversation_start", (event) => {
        if (!isForThisImage(event)) return;
        dispatch({ type: "AGENT_STATUS", status: "thinking" });
        dispatch({ type: "ASSISTANT_CONVERSATION_STATUS", status: "processing" });
        onStatusChange?.("thinking");
      })
    );

    unsubscribes.push(
      agentx.on("conversation_thinking", (event) => {
        if (!isForThisImage(event)) return;
        dispatch({ type: "AGENT_STATUS", status: "thinking" });
        dispatch({ type: "ASSISTANT_CONVERSATION_STATUS", status: "thinking" });
        onStatusChange?.("thinking");
      })
    );

    unsubscribes.push(
      agentx.on("conversation_responding", (event) => {
        if (!isForThisImage(event)) return;
        dispatch({ type: "AGENT_STATUS", status: "responding" });
        dispatch({ type: "ASSISTANT_CONVERSATION_STATUS", status: "streaming" });
        onStatusChange?.("responding");
      })
    );

    unsubscribes.push(
      agentx.on("conversation_end", (event) => {
        if (!isForThisImage(event)) return;
        dispatch({ type: "ASSISTANT_CONVERSATION_FINISH" });
        dispatch({ type: "AGENT_STATUS", status: "idle" });
        onStatusChange?.("idle");
      })
    );

    unsubscribes.push(
      agentx.on("tool_executing", (event) => {
        if (!isForThisImage(event)) return;
        dispatch({ type: "AGENT_STATUS", status: "planning_tool" });
        onStatusChange?.("planning_tool");
      })
    );

    // Stream events - tool_use_start
    unsubscribes.push(
      agentx.on("tool_use_start", (event) => {
        if (!isForThisImage(event)) return;
        const data = event.data as { toolCallId: string; toolName: string };
        dispatch({
          type: "TOOL_BLOCK_PLANNING",
          toolCallId: data.toolCallId,
          toolName: data.toolName,
        });
      })
    );

    // Message events - assistant_message
    unsubscribes.push(
      agentx.on("assistant_message", (event) => {
        if (!isForThisImage(event)) return;
        dispatch({ type: "TEXT_BLOCK_FINISH" });
      })
    );

    unsubscribes.push(
      agentx.on("tool_call_message", (event) => {
        if (!isForThisImage(event)) return;
        const message = event.data as Message;
        dispatch({
          type: "TOOL_BLOCK_ADD",
          message: message as import("agentxjs").ToolCallMessage,
        });
      })
    );

    unsubscribes.push(
      agentx.on("tool_result_message", (event) => {
        if (!isForThisImage(event)) return;
        const message = event.data as Message;
        dispatch({
          type: "TOOL_BLOCK_RESULT",
          message: message as import("agentxjs").ToolResultMessage,
        });
      })
    );

    unsubscribes.push(
      agentx.on("error_message", (event) => {
        if (!isForThisImage(event)) return;
        const message = event.data as Message;
        dispatch({ type: "ERROR_CONVERSATION_ADD", message });
      })
    );

    // Error events
    unsubscribes.push(
      agentx.on("error_occurred", (event) => {
        if (!isForThisImage(event)) return;
        const error = event.data as UIError;
        dispatch({ type: "ERROR_ADD", error });
        dispatch({ type: "AGENT_STATUS", status: "error" });
        dispatch({ type: "USER_CONVERSATION_STATUS", status: "error", errorCode: error.code });
        onError?.(error);
        onStatusChange?.("error");
      })
    );

    console.debug("[useAgent] Subscribed to events", imageId);

    return () => {
      unsubscribes.forEach((unsub) => unsub());
      console.debug("[useAgent] Unsubscribed from events", imageId);
    };
  }, [agentx, imageId, onStatusChange, onError]);

  // Send message
  const send = useCallback(
    async (content: string | UserContentPart[]) => {
      if (!agentx || !imageId) return;

      dispatch({ type: "ERRORS_CLEAR" });
      onSend?.(content);

      const userConversation: UserConversationData = {
        type: "user",
        id: generateId("user"),
        content: content,
        timestamp: Date.now(),
        status: "pending",
      };
      dispatch({ type: "USER_CONVERSATION_ADD", conversation: userConversation });

      try {
        const response = await agentx.request("message_send_request", {
          imageId,
          content: content,
        });

        if (response.data.agentId) {
          agentIdRef.current = response.data.agentId;
          console.debug("[useAgent] Agent activated", imageId, response.data.agentId);
        }

        dispatch({ type: "USER_CONVERSATION_STATUS", status: "success" });

        const assistantConversationId = generateId("assistant");
        dispatch({ type: "ASSISTANT_CONVERSATION_START", id: assistantConversationId });
      } catch (error) {
        console.error("[useAgent] Failed to send message", imageId, error);
        dispatch({ type: "USER_CONVERSATION_STATUS", status: "error", errorCode: "SEND_FAILED" });
        dispatch({ type: "AGENT_STATUS", status: "error" });
        onStatusChange?.("error");
      }
    },
    [agentx, imageId, onSend, onStatusChange]
  );

  // Interrupt
  const interrupt = useCallback(() => {
    if (!agentx || !imageId) return;

    dispatch({ type: "USER_CONVERSATION_STATUS", status: "interrupted" });

    agentx.request("agent_interrupt_request", { imageId }).catch((error) => {
      console.error("[useAgent] Failed to interrupt agent", imageId, error);
    });
  }, [agentx, imageId]);

  // Clear conversations
  const clearConversations = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    dispatch({ type: "ERRORS_CLEAR" });
  }, []);

  return {
    conversations: state.conversations,
    streamingText: state.streamingText,
    currentTextBlockId: state.currentTextBlockId,
    status: state.agentStatus,
    errors: state.errors,
    send,
    interrupt,
    isLoading,
    clearConversations,
    clearErrors,
    agentId: agentIdRef.current,
  };
}
