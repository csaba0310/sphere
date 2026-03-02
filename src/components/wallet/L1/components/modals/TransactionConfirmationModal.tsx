import { Loader2 } from "lucide-react";
import type { L1 } from "@unicitylabs/sphere-sdk";
import { WalletScreen } from "../../../ui/WalletScreen";
import { ModalHeader } from "../../../ui";
type TransactionPlan = L1.TransactionPlan;

interface TransactionConfirmationModalProps {
  show: boolean;
  txPlan: TransactionPlan | null;
  destination: string;
  amount: string;
  isSending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TransactionConfirmationModal({
  show,
  txPlan,
  destination,
  amount,
  isSending,
  onConfirm,
  onCancel,
}: TransactionConfirmationModalProps) {
  if (!txPlan) return null;

  return (
    <WalletScreen isOpen={show} onClose={onCancel}>
      <ModalHeader variant="screen" title="Confirm Transaction" onClose={onCancel} />
      <div className="px-6 py-8 flex flex-col flex-1 justify-center">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-white/45">Recipient</span>
            <span className="text-neutral-900 dark:text-white font-mono truncate max-w-[200px]">
              {destination}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-white/45">Amount</span>
            <span className="text-neutral-900 dark:text-white">{amount} ALPHA</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-white/45">Transactions</span>
            <span className="text-neutral-900 dark:text-white">{txPlan.transactions.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500 dark:text-white/45">Total Fee</span>
            <span className="text-neutral-900 dark:text-white">
              {(txPlan.transactions.length * 10000) / 100000000} ALPHA
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-neutral-100 dark:bg-white/6 text-neutral-900 dark:text-white font-semibold hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
            disabled={isSending}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Confirm & Send"
            )}
          </button>
        </div>
      </div>
    </WalletScreen>
  );
}
