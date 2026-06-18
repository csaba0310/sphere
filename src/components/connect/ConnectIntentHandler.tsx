import { useState, useCallback } from 'react';
import { MessageSquare, PenLine, Coins } from 'lucide-react';
import { ERROR_CODES } from '@unicitylabs/sphere-sdk/connect';
import { BaseModal, ModalHeader, Button } from '../wallet/ui';
import { SendModal } from '../wallet/L3/modals/SendModal';
import { SendPaymentRequestModal } from '../wallet/L3/modals/SendPaymentRequestModal';
import { SendModal as L1SendModal } from '../wallet/L1/components/modals/SendModal';
import { useConnectContext } from './ConnectContext';
import { useSendDM } from '../../sdk/hooks/comms/useSendDM';
import { getErrorMessage } from '../../sdk/errors';
import { useIdentity, useL1Balance, useL1Send, useSphereContext } from '../../sdk';

export function ConnectIntentHandler() {
  const { pendingIntent, resolveIntent, rejectIntent, registerAutoIntent } = useConnectContext();
  const { sphere } = useSphereContext();
  const { sendDM, isLoading: isSendingDM } = useSendDM();
  const [dmError, setDmError] = useState<string | null>(null);
  const [autoApproveDM, setAutoApproveDM] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  // L1 hooks (always called — hooks cannot be conditional)
  const { l1Address } = useIdentity();
  const { balance: l1BalanceData } = useL1Balance();
  const { send: l1Send, estimateFee, resolveAddress } = useL1Send();
  const l1VestingBalances = l1BalanceData ? {
    vested: BigInt(l1BalanceData.vested),
    unvested: BigInt(l1BalanceData.unvested),
    all: BigInt(l1BalanceData.total),
  } : { vested: 0n, unvested: 0n, all: 0n };

  const handleL1Send = useCallback(async (destination: string, amount: string) => {
    const amountAlpha = Number(amount);
    if (isNaN(amountAlpha) || amountAlpha <= 0) throw new Error('Invalid amount');
    const amountSatoshis = Math.round(amountAlpha * 1e8).toString();
    await l1Send({ toAddress: destination, amount: amountSatoshis });
  }, [l1Send]);

  if (!pendingIntent) return null;

  const { action, params } = pendingIntent;

  const handleClose = () => {
    rejectIntent(ERROR_CODES.USER_REJECTED, 'User cancelled');
  };

  // --- Send Intent: reuse the wallet's SendModal ---
  if (action === 'send') {
    return (
      <SendModal
        isOpen={true}
        onClose={(result) => {
          if (result?.success) {
            resolveIntent({ success: true });
          } else {
            rejectIntent(ERROR_CODES.USER_REJECTED, 'User cancelled');
          }
        }}
        prefill={{
          to: params.to as string,
          amount: params.amount as string,
          coinId: (params.coinId as string) ?? 'UCT',
          memo: params.memo as string | undefined,
        }}
        asModal
      />
    );
  }

  // --- Payment Request Intent: reuse SendPaymentRequestModal ---
  if (action === 'payment_request') {
    return (
      <SendPaymentRequestModal
        isOpen={true}
        onClose={(result) => {
          if (result?.success) {
            resolveIntent({ success: true, requestId: result.requestId });
          } else {
            rejectIntent(ERROR_CODES.USER_REJECTED, 'User cancelled');
          }
        }}
        prefill={{
          to: params.to as string,
          amount: params.amount as string,
          coinId: (params.coinId as string) ?? 'UCT',
          message: params.message as string | undefined,
        }}
        asModal
      />
    );
  }

  // --- L1 Send Intent ---
  if (action === 'l1_send') {
    const toParam = params.to as string | undefined;
    const amountParam = params.amount as string | undefined;
    // Convert sats to ALPHA if amount looks like sats (integer >= 1000)
    let amountAlpha = amountParam;
    if (amountParam && /^\d+$/.test(amountParam) && Number(amountParam) >= 1000) {
      amountAlpha = (Number(amountParam) / 1e8).toString();
    }

    return (
      <L1SendModal
        show={true}
        selectedAddress={l1Address ?? ''}
        onClose={(result) => {
          if (result?.success) {
            resolveIntent({ success: true });
          } else {
            rejectIntent(ERROR_CODES.USER_REJECTED, 'User cancelled');
          }
        }}
        onSend={handleL1Send}
        vestingBalances={l1VestingBalances}
        onEstimateFee={estimateFee}
        onResolveAddress={resolveAddress}
        prefill={toParam ? { to: toParam, amount: amountAlpha ?? '' } : undefined}
        asModal
      />
    );
  }

  // --- DM Intent ---
  if (action === 'dm') {
    const to = params.to as string;
    const message = params.message as string;

    const handleSendDM = async () => {
      setDmError(null);
      try {
        const dm = await sendDM({ recipient: to, content: message });

        // Register auto-approve if user checked the checkbox.
        // Uses ConnectProvider-level auto-handler (bypasses ConnectHost entirely)
        // so it's immune to ConnectHost lifecycle issues.
        if (autoApproveDM && sphere) {
          const sphereRef = sphere;
          registerAutoIntent('dm', async (_action, intentParams) => {
            try {
              const result = await sphereRef.communications.sendDM(
                intentParams.to as string,
                intentParams.message as string,
              );
              return { result: { sent: true, messageId: result.id, timestamp: result.timestamp } };
            } catch (err) {
              return {
                error: {
                  code: ERROR_CODES.INTERNAL_ERROR,
                  message: err instanceof Error ? err.message : 'DM failed',
                },
              };
            }
          });
        }

        resolveIntent({ sent: true, messageId: dm.id, timestamp: dm.timestamp });
      } catch (err) {
        setDmError(getErrorMessage(err));
      }
    };

    return (
      <BaseModal isOpen={true} onClose={handleClose}>
        <ModalHeader title="dApp DM Request" icon={MessageSquare} onClose={handleClose} />

        <div className="px-6 py-5 flex-1 flex flex-col justify-center">
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 mb-5 border border-neutral-200 dark:border-white/10">
            <div className="text-sm text-neutral-500 mb-2">
              Send DM to <span className="text-neutral-900 dark:text-white font-medium">{to}</span>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 text-neutral-700 dark:text-neutral-300 text-sm">
              {message}
            </div>
          </div>

          {/* Auto-approve checkbox */}
          <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoApproveDM}
              onChange={(e) => setAutoApproveDM(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-500"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Allow this dApp to send DMs without confirmation
            </span>
          </label>

          {dmError && (
            <div className="text-red-500 text-sm mb-3 text-center">{dmError}</div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={handleClose} disabled={isSendingDM}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              disabled={isSendingDM}
              onClick={handleSendDM}
            >
              {isSendingDM ? 'Sending…' : 'Send DM'}
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // --- Sign Message Intent ---
  if (action === 'sign_message') {
    const message = params.message as string;

    // Parse domain from challenge for display (e.g. "Domain: quests.unicity.network")
    const domainMatch = message.match(/^Domain:\s*(.+)$/m);
    const displayDomain = domainMatch ? domainMatch[1].trim() : null;

    const handleSign = () => {
      setSignError(null);
      if (!sphere) {
        setSignError('Wallet not available');
        return;
      }
      try {
        const signature = sphere.signMessage(message);
        const identity = sphere.identity;
        resolveIntent({ signature, publicKey: identity?.chainPubkey });
      } catch (err) {
        setSignError(getErrorMessage(err));
      }
    };

    return (
      <BaseModal isOpen={true} onClose={handleClose}>
        <ModalHeader title="Sign Message" icon={PenLine} onClose={handleClose} />

        <div className="px-6 py-5 flex-1 flex flex-col justify-center">
          {displayDomain && (
            <div className="text-sm text-neutral-500 mb-3 text-center">
              Requested by <span className="font-medium text-neutral-800 dark:text-neutral-200">{displayDomain}</span>
            </div>
          )}

          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-4 mb-5 border border-neutral-200 dark:border-white/10">
            <div className="text-xs text-neutral-400 mb-2 uppercase tracking-wide">Message</div>
            <pre className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-all font-mono leading-relaxed">
              {message}
            </pre>
          </div>

          {signError && (
            <div className="text-red-500 text-sm mb-3 text-center">{signError}</div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleSign}>
              Sign
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // --- Mint Intent: self-mint a fungible token to the user's own wallet ---
  if (action === 'mint') {
    const coinId = params.coinId as string;
    const amount = params.amount as string;

    const handleMint = async () => {
      setMintError(null);
      if (!sphere) {
        setMintError('Wallet not available');
        return;
      }
      // Validate params before touching the engine (fail fast with INVALID_PARAMS).
      if (typeof coinId !== 'string' || !/^([0-9a-f]{2})+$/.test(coinId)) {
        rejectIntent(ERROR_CODES.INVALID_PARAMS, 'coinId must be lowercase even-length hex');
        return;
      }
      let amountBig: bigint;
      try {
        amountBig = BigInt(amount);
      } catch {
        rejectIntent(ERROR_CODES.INVALID_PARAMS, 'amount must be an integer string');
        return;
      }
      if (amountBig <= 0n) {
        rejectIntent(ERROR_CODES.INVALID_PARAMS, 'amount must be greater than zero');
        return;
      }

      setIsMinting(true);
      try {
        const result = await sphere.payments.mintFungibleToken(coinId, amountBig);
        if (result.success) {
          resolveIntent({ tokenId: result.tokenId, coinId, amount });
        } else {
          rejectIntent(ERROR_CODES.INTERNAL_ERROR, result.error);
        }
      } catch (err) {
        setMintError(getErrorMessage(err));
      } finally {
        setIsMinting(false);
      }
    };

    return (
      <BaseModal isOpen={true} onClose={handleClose}>
        <ModalHeader title="Mint Tokens" icon={Coins} onClose={handleClose} />

        <div className="px-6 py-5 flex-1 flex flex-col justify-center">
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-5 mb-5 border border-neutral-200 dark:border-white/10">
            <div className="text-sm text-neutral-500 mb-3">
              This dApp is asking to mint tokens{' '}
              <span className="text-neutral-900 dark:text-white font-medium">to your own wallet</span>.
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <span className="text-neutral-400">Amount</span>
              <span className="text-neutral-900 dark:text-white font-mono break-all">{amount}</span>
              <span className="text-neutral-400">Coin ID</span>
              <span className="text-neutral-900 dark:text-white font-mono break-all">{coinId}</span>
            </div>
          </div>

          {mintError && (
            <div className="text-red-500 text-sm mb-3 text-center">{mintError}</div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={handleClose} disabled={isMinting}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth disabled={isMinting} onClick={handleMint}>
              {isMinting ? 'Minting…' : 'Mint'}
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // --- Unknown Intent ---
  return (
    <BaseModal isOpen={true} onClose={handleClose}>
      <ModalHeader title="Unknown Request" onClose={handleClose} />
      <div className="px-6 py-5 text-center">
        <p className="text-neutral-500 mb-4">
          Unsupported intent: <code className="text-neutral-700 dark:text-neutral-300">{action}</code>
        </p>
        <Button variant="secondary" onClick={handleClose}>
          Dismiss
        </Button>
      </div>
    </BaseModal>
  );
}
