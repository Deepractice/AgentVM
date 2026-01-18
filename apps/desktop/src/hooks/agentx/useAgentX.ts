/**
 * useAgentX - React hook for AgentX remote connection
 *
 * Creates and manages an AgentX instance that connects to a remote server.
 * Copied from @agentxjs/ui with minimal dependencies.
 */

import { useState, useEffect } from "react";
import type { AgentX } from "agentxjs";
import { createAgentX } from "agentxjs";

/**
 * React hook for AgentX remote connection
 *
 * @param serverUrl - WebSocket server URL (e.g., "ws://localhost:5200")
 * @returns The AgentX instance (null during connection)
 */
export function useAgentX(serverUrl: string): AgentX | null {
  const [agentx, setAgentx] = useState<AgentX | null>(null);

  useEffect(() => {
    let instance: AgentX | null = null;
    let mounted = true;

    createAgentX({ serverUrl })
      .then((agentx) => {
        if (!mounted) {
          agentx.dispose();
          return;
        }
        instance = agentx;
        setAgentx(agentx);
        console.log("[useAgentX] Connected to server", serverUrl);
      })
      .catch((error) => {
        console.error("[useAgentX] Failed to connect to server", serverUrl, error);
      });

    return () => {
      mounted = false;
      if (instance) {
        instance.dispose().catch((error) => {
          console.error("[useAgentX] Failed to dispose AgentX", error);
        });
      }
    };
  }, [serverUrl]);

  return agentx;
}
