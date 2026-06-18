/**
 * useOnboardingConnectionStatus - Onboarding connection status stub.
 *
 * Previously tracked a blockchain WebSocket connection during onboarding. That
 * layer has been removed, so there is no socket to monitor. The hook is kept
 * (with its stable return shape) for component compatibility and now reports a
 * steady "connected" state.
 */
import { useCallback } from "react";

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export interface ConnectionStatus {
  state: ConnectionState;
  message: string;
  error?: string;
}

export function useOnboardingConnectionStatus() {
  const noop = useCallback(() => {}, []);

  return {
    state: "connected" as ConnectionState,
    message: "Ready",
    isConnected: true,
    isConnecting: false,
    manualConnect: noop,
    cancelConnect: noop,
  };
}
