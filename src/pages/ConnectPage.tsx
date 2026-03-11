import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConnectHost, HOST_READY_TYPE } from '@unicitylabs/sphere-sdk/connect';
import type { DAppMetadata, PermissionScope } from '@unicitylabs/sphere-sdk/connect';
import { PostMessageTransport } from '@unicitylabs/sphere-sdk/connect/browser';
import { useSphereContext } from '../sdk/hooks/core/useSphere';
import { useConnectContext } from '../components/connect/ConnectContext';
import { WalletPanel } from '../components/wallet/WalletPanel';
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
  type IntentRequestMessage,
  type ApprovalRequestMessage,
} from '../utils/connect-bridge-channel';

export function ConnectPage() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin');
  const isBridgeMode = searchParams.has('bridge');
  const { sphere, isLoading } = useSphereContext();
  const { requestApproval, requestIntent, setConnectHost } = useConnectContext();
  const hostRef = useRef<ConnectHost | null>(null);
  const transportRef = useRef<PostMessageTransport | null>(null);
  const [status, setStatus] = useState<'waiting' | 'ready' | 'error'>('waiting');
  const [errorMsg, setErrorMsg] = useState('');
  const [connectedDapp, setConnectedDapp] = useState<string | null>(null);

  const sphereRef = useRef(sphere);
  sphereRef.current = sphere;
  const requestApprovalRef = useRef(requestApproval);
  requestApprovalRef.current = requestApproval;
  const requestIntentRef = useRef(requestIntent);
  requestIntentRef.current = requestIntent;

  const sphereReady = !isLoading && !!sphere;
  const initializedRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Bridge mode: popup acts as intent/approval UI for the bridge iframe.
  // No ConnectHost here — the bridge iframe owns the session.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isBridgeMode) return;
    if (!origin) return;
    if (!sphereReady) return;
    if (initializedRef.current) return;

    initializedRef.current = true;
    setStatus('ready');

    const channel = createBridgeChannel(origin);

    // Notify bridge that popup is ready
    channel.postMessage({ type: BRIDGE_MSG.POPUP_READY });

    // Notify bridge when popup is closing
    const handleBeforeUnload = () => {
      channel.postMessage({ type: BRIDGE_MSG.POPUP_CLOSED });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen for intents and approvals from bridge
    channel.onmessage = (event: MessageEvent<BridgeChannelMessage>) => {
      const msg = event.data;

      if (msg.type === BRIDGE_MSG.INTENT_REQUEST) {
        const intentMsg = msg as IntentRequestMessage;
        requestIntentRef.current(intentMsg.action, intentMsg.params).then((result) => {
          channel.postMessage({
            type: BRIDGE_MSG.INTENT_RESULT,
            intentId: intentMsg.intentId,
            result: result.result,
            error: result.error,
          });
        });
        return;
      }

      if (msg.type === BRIDGE_MSG.APPROVAL_REQUEST) {
        const approvalMsg = msg as ApprovalRequestMessage;
        requestApprovalRef.current(
          approvalMsg.dapp as DAppMetadata,
          approvalMsg.permissions as PermissionScope[],
        ).then((result) => {
          channel.postMessage({
            type: BRIDGE_MSG.APPROVAL_RESULT,
            approvalId: approvalMsg.approvalId,
            approved: result.approved,
            grantedPermissions: result.grantedPermissions,
          });
        });
        return;
      }
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      channel.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBridgeMode, sphereReady, origin]);

  // ---------------------------------------------------------------------------
  // Standalone mode (original): popup owns the ConnectHost + session.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isBridgeMode) return;
    if (!sphereReady) return;
    if (initializedRef.current) return;

    if (!origin) {
      setStatus('error');
      setErrorMsg('Missing origin parameter');
      return;
    }
    if (!window.opener) {
      setStatus('error');
      setErrorMsg('This page must be opened as a popup from a dApp');
      return;
    }

    initializedRef.current = true;
    const currentSphere = sphereRef.current!;

    const transport = PostMessageTransport.forHost(window.opener as Window, {
      allowedOrigins: [origin],
    });
    transportRef.current = transport;

    const host = new ConnectHost({
      sphere: currentSphere,
      transport,
      onConnectionRequest: async (dapp: DAppMetadata, perms: PermissionScope[], silent?: boolean) => {
        const saved = getApprovedOrigin(origin);
        if (saved) {
          updateLastSeen(origin);
          setConnectedDapp(saved.dapp.name);
          return { approved: true, grantedPermissions: saved.permissions };
        }

        if (silent) {
          return { approved: false, grantedPermissions: [] };
        }

        const result = await requestApprovalRef.current(dapp, perms);
        if (result.approved) {
          setConnectedDapp(dapp.name);
          saveApprovedOrigin(origin, dapp, result.grantedPermissions);
        }
        return result;
      },
      onDisconnect: () => {
        revokeApprovedOrigin(origin);
        setConnectedDapp(null);
      },
      onIntent: (action, params) =>
        requestIntentRef.current(action, params),
    });
    hostRef.current = host;
    setConnectHost(host);

    setStatus('ready');

    try {
      (window.opener as Window).postMessage(
        { type: HOST_READY_TYPE },
        origin,
      );
    } catch {
      try {
        (window.opener as Window).postMessage(
          { type: HOST_READY_TYPE },
          '*',
        );
      } catch { /* ignore */ }
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sphereReady, origin]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 flex flex-col items-center p-4 pt-8">
      <div className="w-full max-w-sm space-y-3">
        {/* Connection status bar */}
        {status === 'ready' && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-gray-200 dark:border-neutral-700 p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                {isBridgeMode
                  ? 'Wallet approval window'
                  : connectedDapp ? `Connected to ${connectedDapp}` : 'Ready for connections'}
              </span>
            </div>
            {origin && (
              <div className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                Origin: <span className="font-mono">{origin}</span>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-4 text-center text-red-600 dark:text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {/* Wallet panel — same component as the main app */}
        <div className="h-130">
          <WalletPanel />
        </div>

        {/* Hint */}
        {status === 'ready' && (
          <p className="text-xs text-center text-gray-400 dark:text-neutral-500 px-4">
            {isBridgeMode
              ? 'This window handles wallet approvals. You can close it after approving.'
              : 'You can close this window. The dApp will re-open it when needed.'}
          </p>
        )}
      </div>
    </div>
  );
}
