// ---------------------------------------------------------------------------
// BroadcastChannel wrapper for iframe bridge ↔ popup intent coordination.
// Channel scoped per dApp origin to prevent cross-dApp interference.
// BroadcastChannel is same-origin only — secure by design.
// ---------------------------------------------------------------------------

export const BRIDGE_MSG = {
  INTENT_REQUEST: 'intent-request',
  INTENT_RESULT: 'intent-result',
  APPROVAL_REQUEST: 'approval-request',
  APPROVAL_RESULT: 'approval-result',
  POPUP_READY: 'popup-ready',
  POPUP_CLOSED: 'popup-closed',
  OPEN_POPUP: 'open-popup',
} as const;

export interface IntentRequestMessage {
  type: typeof BRIDGE_MSG.INTENT_REQUEST;
  intentId: string;
  action: string;
  params: Record<string, unknown>;
}

export interface IntentResultMessage {
  type: typeof BRIDGE_MSG.INTENT_RESULT;
  intentId: string;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface ApprovalRequestMessage {
  type: typeof BRIDGE_MSG.APPROVAL_REQUEST;
  approvalId: string;
  dapp: { name: string; description?: string; url: string; icon?: string };
  permissions: string[];
}

export interface ApprovalResultMessage {
  type: typeof BRIDGE_MSG.APPROVAL_RESULT;
  approvalId: string;
  approved: boolean;
  grantedPermissions: string[];
}

export interface PopupReadyMessage {
  type: typeof BRIDGE_MSG.POPUP_READY;
}

export interface PopupClosedMessage {
  type: typeof BRIDGE_MSG.POPUP_CLOSED;
}

export interface OpenPopupMessage {
  type: typeof BRIDGE_MSG.OPEN_POPUP;
  reason: 'intent' | 'approval';
}

export type BridgeChannelMessage =
  | IntentRequestMessage
  | IntentResultMessage
  | ApprovalRequestMessage
  | ApprovalResultMessage
  | PopupReadyMessage
  | PopupClosedMessage
  | OpenPopupMessage;

function channelName(origin: string): string {
  return `sphere-connect-bridge:${origin}`;
}

export function createBridgeChannel(origin: string): BroadcastChannel {
  return new BroadcastChannel(channelName(origin));
}
