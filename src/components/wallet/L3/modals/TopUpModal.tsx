import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Receipt, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useTopUp } from '../../../../sdk';
import { getErrorMessage } from '../../../../sdk/errors';
import { showToast } from '../../../ui/toast-utils';
import { WalletScreen } from '../../ui/WalletScreen';
import { ModalHeader } from '../../ui';
import { SendPaymentRequestModal } from './SendPaymentRequestModal';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const { topUp } = useTopUp();

  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);

  const handleTopUp = async () => {
    if (isToppingUp) return;

    setIsToppingUp(true);
    setTopUpError(null);
    setTopUpSuccess(false);

    try {
      // Self-mint test tokens to this wallet (v2; no faucet, no nametag).
      const results = await topUp();
      const failed = results.filter((r) => !r.success);

      if (failed.length === results.length) {
        // All failed — surface the reason(s).
        const uniqueReasons = [...new Set(failed.map((r) => r.error || 'Unknown error'))];
        setTopUpError(
          uniqueReasons.length === 1
            ? uniqueReasons[0]
            : failed.map((r) => `${r.symbol}: ${r.error || 'Unknown error'}`).join('\n'),
        );
      } else if (failed.length > 0) {
        // Partial success — minted some; note which failed but treat as success.
        setTopUpSuccess(true);
        showToast(`Some coins failed: ${failed.map((r) => r.symbol).join(', ')}`, 'info', 4000);
        setTimeout(handleClose, 1500);
      } else {
        setTopUpSuccess(true);
        setTimeout(handleClose, 1500);
      }
    } catch (error) {
      setTopUpError(getErrorMessage(error));
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleClose = () => {
    setTopUpError(null);
    setTopUpSuccess(false);
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

          {/* Self-mint test tokens card */}
          <motion.button
            whileHover={isToppingUp ? {} : { scale: 1.01 }}
            whileTap={isToppingUp ? {} : { scale: 0.99 }}
            onClick={handleTopUp}
            disabled={isToppingUp}
            className={`w-full p-5 flex items-center gap-4 rounded-2xl border text-left transition-colors ${
              topUpSuccess
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : topUpError
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-neutral-50 dark:bg-white/4 border-neutral-200 dark:border-white/8 hover:bg-neutral-100 dark:hover:bg-white/8 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              topUpSuccess ? 'bg-emerald-500/15' : topUpError ? 'bg-red-500/15' : 'bg-orange-500/10'
            }`}>
              {isToppingUp ? (
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              ) : topUpSuccess ? (
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              ) : topUpError ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : (
                <Sparkles className="w-6 h-6 text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold font-mono ${
                topUpSuccess ? 'text-emerald-500' : topUpError ? 'text-red-500' : 'text-neutral-900 dark:text-white'
              }`}>
                {isToppingUp ? 'Minting...' : topUpSuccess ? 'Tokens minted!' : topUpError ? 'Mint failed' : 'Get test tokens'}
              </div>
              <div className="text-xs text-neutral-500 dark:text-white/45 mt-0.5 line-clamp-2">
                {topUpError
                  ? topUpError
                  : topUpSuccess
                    ? 'Test tokens have been minted to your wallet'
                    : 'Mint test tokens directly to your wallet'}
              </div>
            </div>
            {!isToppingUp && !topUpSuccess && !topUpError && (
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
