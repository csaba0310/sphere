import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Receipt, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useIdentity } from '../../../../sdk';
import { getErrorMessage } from '../../../../sdk/errors';
import { FaucetService } from '../../../../services/FaucetService';
import { showToast } from '../../../ui/toast-utils';
import { WalletScreen } from '../../ui/WalletScreen';
import { ModalHeader } from '../../ui';
import { SendPaymentRequestModal } from './SendPaymentRequestModal';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const { nametag } = useIdentity();

  const [isFaucetLoading, setIsFaucetLoading] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const [faucetError, setFaucetError] = useState<string | null>(null);
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);

  const handleFaucetRequest = async () => {
    if (!nametag || isFaucetLoading) return;

    setIsFaucetLoading(true);
    setFaucetError(null);
    setFaucetSuccess(false);

    try {
      const results = await FaucetService.requestAllCoins(nametag);
      const failedRequests = results.filter(r => !r.success);

      if (failedRequests.length > 0) {
        const uniqueReasons = [...new Set(failedRequests.map(r => r.message || 'Unknown error'))];
        if (uniqueReasons.length === 1) {
          setFaucetError(uniqueReasons[0]);
        } else {
          const reasons = failedRequests.map(r => `${r.coin}: ${r.message || 'Unknown error'}`);
          setFaucetError(`Failed to request:\n${reasons.join('\n')}`);
        }
      } else {
        setFaucetSuccess(true);
        setTimeout(() => setFaucetSuccess(false), 3000);
      }
    } catch (error) {
      setFaucetError(getErrorMessage(error));
    } finally {
      setIsFaucetLoading(false);
    }
  };

  const handleClose = () => {
    setFaucetError(null);
    setFaucetSuccess(false);
    onClose();
  };

  const handlePaymentRequestClose = (result?: { success: boolean; requestId?: string }) => {
    setIsPaymentRequestOpen(false);
    if (result?.success) {
      showToast('Payment request sent!', 'success', 3000);
      handleClose();
    }
  };

  return (
    <>
      <WalletScreen isOpen={isOpen} onClose={handleClose}>
        <ModalHeader variant="screen" title="Top Up" onClose={handleClose} />

        <div className="flex flex-col px-6 py-6 gap-3">

          {/* Faucet card */}
          <motion.button
            whileHover={!nametag || isFaucetLoading ? {} : { scale: 1.01 }}
            whileTap={!nametag || isFaucetLoading ? {} : { scale: 0.99 }}
            onClick={handleFaucetRequest}
            disabled={!nametag || isFaucetLoading}
            className={`w-full p-5 flex items-center gap-4 rounded-2xl border text-left transition-colors ${
              faucetSuccess
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : faucetError
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-neutral-50 dark:bg-white/4 border-neutral-200 dark:border-white/8 hover:bg-neutral-100 dark:hover:bg-white/8 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              faucetSuccess ? 'bg-emerald-500/15' : faucetError ? 'bg-red-500/15' : 'bg-orange-500/10'
            }`}>
              {isFaucetLoading ? (
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              ) : faucetSuccess ? (
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              ) : faucetError ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Sparkles className="w-6 h-6 text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold font-mono ${
                faucetSuccess ? 'text-emerald-500' : faucetError ? 'text-red-500' : 'text-neutral-900 dark:text-white'
              }`}>
                {isFaucetLoading ? 'Requesting...' : faucetSuccess ? 'Tokens received!' : faucetError ? 'Request failed' : 'Faucet'}
              </div>
              <div className="text-xs text-neutral-500 dark:text-white/45 mt-0.5 line-clamp-2">
                {faucetError
                  ? faucetError
                  : faucetSuccess
                    ? 'Test tokens have been sent to your wallet'
                    : nametag
                      ? 'Request test tokens from the Unicity faucet'
                      : 'Nametag required to use the faucet'}
              </div>
            </div>
            {!isFaucetLoading && !faucetSuccess && !faucetError && nametag && (
              <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600 shrink-0" />
            )}
          </motion.button>

          {/* Payment Request card */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsPaymentRequestOpen(true)}
            className="w-full p-5 flex items-center gap-4 rounded-2xl border bg-neutral-50 dark:bg-white/4 border-neutral-200 dark:border-white/8 hover:bg-neutral-100 dark:hover:bg-white/8 text-left transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="font-semibold font-mono text-neutral-900 dark:text-white">Payment Request</div>
              <div className="text-xs text-neutral-500 dark:text-white/45 mt-0.5">
                Request a payment from someone else
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600 shrink-0" />
          </motion.button>

        </div>
      </WalletScreen>

      <SendPaymentRequestModal
        isOpen={isPaymentRequestOpen}
        onClose={handlePaymentRequestClose}
      />
    </>
  );
}
