// ---------------------------------------------------------------------------
// ConnectBridgePage — headless page loaded in a hidden iframe by dApps.
//
// Hosts a persistent ConnectHost that survives popup close/reopen.
// Queries and events are handled directly. Intents and first-time approvals
// are delegated to a popup via BroadcastChannel.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConnectHost, HOST_READY_TYPE } from '@unicitylabs/sphere-sdk/connect';
import type { DAppMetadata, PermissionScope } from '@unicitylabs/sphere-sdk/connect';
import { PostMessageTransport } from '@unicitylabs/sphere-sdk/connect/browser';
import { useSphereContext } from '../sdk/hooks/core/useSphere';
import {
  getApprovedOrigin,
  saveApprovedOrigin,
  updateLastSeen,
  revokeApprovedOrigin,
} from '../utils/connected-sites';
import {
  createBridgeChannel,
  BRIDGE_MSG,
  type BridgeChannelMessage,
  type IntentResultMessage,
  type ApprovalResultMessage,
} from '../utils/connect-bridge-channel';

// Message type sent to the dApp (parent) when popup interaction is needed
const OPEN_POPUP_MSG = 'sphere-connect:open-popup';

export function ConnectBridgePage() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin');
  const { sphere, isLoading } = useSphereContext();
  const initializedRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const sphereRef = useRef(sphere);
  sphereRef.current = sphere;

  const sphereReady = !isLoading && !!sphere;

  useEffect(() => {
    console.log('[ConnectBridge] effect: sphereReady:', sphereReady, 'origin:', origin, 'initialized:', initializedRef.current);
    if (!sphereReady) return;
    if (initializedRef.current) return;

    if (!origin) {
      console.error('[ConnectBridge] no origin param');
      setStatus('error');
      return;
    }

    if (!window.parent || window.parent === window) {
      console.error('[ConnectBridge] not in iframe (window.parent === window)');
      setStatus('error');
      return;
    }

    console.log('[ConnectBridge] initializing for origin:', origin);
    initializedRef.current = true;
    const currentSphere = sphereRef.current!;

    // Transport to communicate with the dApp (parent window)
    const transport = PostMessageTransport.forHost(window.parent, {
      allowedOrigins: [origin],
    });

    // BroadcastChannel for coordinating with popup (same-origin only)
    const channel = createBridgeChannel(origin);

    // Track pending operations waiting for popup
    const pendingIntents = new Map<
      string,
      { resolve: (r: { result?: unknown; error?: { code: number; message: string } }) => void }
    >();
    const pendingApprovals = new Map<
      string,
      { resolve: (r: { approved: boolean; grantedPermissions: PermissionScope[] }) => void }
    >();

    // Listen for messages from popup
    channel.onmessage = (event: MessageEvent<BridgeChannelMessage>) => {
      const msg = event.data;

      if (msg.type === BRIDGE_MSG.POPUP_READY || msg.type === BRIDGE_MSG.POPUP_CLOSED) {
        return;
      }

      if (msg.type === BRIDGE_MSG.INTENT_RESULT) {
        const resultMsg = msg as IntentResultMessage;
        const pending = pendingIntents.get(resultMsg.intentId);
        if (pending) {
          pendingIntents.delete(resultMsg.intentId);
          if (resultMsg.error) {
            pending.resolve({ error: resultMsg.error });
          } else {
            pending.resolve({ result: resultMsg.result });
          }
        }
        return;
      }

      if (msg.type === BRIDGE_MSG.APPROVAL_RESULT) {
        const resultMsg = msg as ApprovalResultMessage;
        const pending = pendingApprovals.get(resultMsg.approvalId);
        if (pending) {
          pendingApprovals.delete(resultMsg.approvalId);
          pending.resolve({
            approved: resultMsg.approved,
            grantedPermissions: resultMsg.grantedPermissions as PermissionScope[],
          });
        }
        return;
      }
    };

    // ConnectHost handles queries/events directly; delegates intents to popup
    void new ConnectHost({
      sphere: currentSphere,
      transport,

      onConnectionRequest: async (
        dapp: DAppMetadata,
        perms: PermissionScope[],
        silent?: boolean,
      ) => {
        // Check if origin was already approved
        const saved = getApprovedOrigin(origin);
        if (saved) {
          updateLastSeen(origin);
          return { approved: true, grantedPermissions: saved.permissions };
        }

        // Silent mode: reject immediately without UI
        if (silent) {
          return { approved: false, grantedPermissions: [] };
        }

        // Need popup for first-time approval
        const approvalId = crypto.randomUUID();

        // Signal dApp to open popup
        (window.parent as Window).postMessage(
          { type: OPEN_POPUP_MSG, reason: 'approval' },
          origin,
        );

        // Send approval request to popup via BroadcastChannel
        channel.postMessage({
          type: BRIDGE_MSG.APPROVAL_REQUEST,
          approvalId,
          dapp,
          permissions: perms,
        });

        // Wait for popup to respond
        return new Promise((resolve) => {
          pendingApprovals.set(approvalId, {
            resolve: (result) => {
              if (result.approved) {
                saveApprovedOrigin(origin, dapp, result.grantedPermissions);
              }
              resolve(result);
            },
          });
        });
      },

      onDisconnect: () => {
        revokeApprovedOrigin(origin);
      },

      onIntent: async (action: string, params: Record<string, unknown>) => {
        const intentId = crypto.randomUUID();

        // Signal dApp to open popup for intent approval
        (window.parent as Window).postMessage(
          { type: OPEN_POPUP_MSG, reason: 'intent' },
          origin,
        );

        // Send intent to popup via BroadcastChannel
        channel.postMessage({
          type: BRIDGE_MSG.INTENT_REQUEST,
          intentId,
          action,
          params,
        });

        // Wait for popup to respond
        return new Promise((resolve) => {
          pendingIntents.set(intentId, { resolve });
        });
      },
    });

    setStatus('ready');
    console.log('[ConnectBridge] ConnectHost created, sending HOST_READY to', origin);

    // Signal to dApp that bridge is ready
    try {
      (window.parent as Window).postMessage({ type: HOST_READY_TYPE }, origin);
    } catch (err) {
      console.warn('[ConnectBridge] postMessage with origin failed, trying *', err);
      try {
        (window.parent as Window).postMessage({ type: HOST_READY_TYPE }, '*');
      } catch { /* ignore */ }
    }

    // No cleanup — iframe is GC'd when parent navigates away.
    // Returning a cleanup would break StrictMode.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sphereReady, origin]);

  // Render nothing visible — this is a headless bridge
  return (
    <div style={{ display: 'none' }} data-bridge-status={status} />
  );
}
