import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BaseModal, ModalHeader, Button } from '../wallet/ui';

interface IntentConfirmModalProps {
  /** Modal title shown in the header. */
  title: string;
  /** Header icon. */
  icon: LucideIcon;
  /** Body content (the amount/recipient card). */
  children: ReactNode;
  /** Inline error shown above the action buttons. */
  error?: string | null;
  /** Disables the confirm button (e.g. insufficient balance). */
  confirmDisabled?: boolean;
  /** True while the underlying action is running. */
  busy: boolean;
  /** Confirm button label when idle. */
  confirmLabel: string;
  /** Confirm button label while busy. */
  busyLabel: string;
  /** Approve — runs the action. */
  onConfirm: () => void;
  /** Reject / cancel the dApp request. */
  onCancel: () => void;
}

/**
 * Confirm-only shell for value-bearing Connect intents (`send`,
 * `payment_request`). Mirrors the `mint` intent's modal: the dApp-supplied
 * amount is FIXED and shown for review only (approve/reject) — there is no
 * amount input here. This matches how every major wallet treats a
 * dApp-requested transfer (MetaMask, Phantom, WalletConnect): the amount
 * travels in base units and the wallet only formats it for display.
 */
export function IntentConfirmModal({
  title,
  icon,
  children,
  error,
  confirmDisabled,
  busy,
  confirmLabel,
  busyLabel,
  onConfirm,
  onCancel,
}: IntentConfirmModalProps) {
  return (
    <BaseModal isOpen={true} onClose={onCancel}>
      <ModalHeader title={title} icon={icon} onClose={onCancel} />

      <div className="px-6 py-5 flex-1 flex flex-col justify-center">
        {children}

        {error && <div className="text-red-500 text-sm mb-3 text-center">{error}</div>}

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth disabled={busy || confirmDisabled} onClick={onConfirm}>
            {busy ? busyLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
