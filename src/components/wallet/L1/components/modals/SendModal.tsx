import { useState, useEffect, useRef } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessage } from "../../../../../sdk/errors";
import { WalletScreen } from "../../../ui/WalletScreen";
import { ModalHeader } from "../../../ui";

type VestingMode = 'all' | 'vested' | 'unvested';

interface VestingBalances {
  vested: bigint;
  unvested: bigint;
  all: bigint;
}

interface TxPreview {
  resolvedAddress: string;
  nametag?: string;
  amountAlpha: string;
  amountSats: string;
  feeSats: string;
  feeAlpha: string;
  totalAlpha: string;
}

export interface L1SendPrefill {
  to: string;
  amount: string;  // in ALPHA (not sats)
}

interface SendModalProps {
  show: boolean;
  selectedAddress: string;
  onClose: (result?: { success: boolean }) => void;
  onSend: (destination: string, amount: string) => Promise<void>;
  vestingBalances?: VestingBalances;
  onEstimateFee?: (to: string, amountSats: string) => Promise<{ fee: string; feeRate: number }>;
  onResolveAddress?: (destination: string) => Promise<{ address: string; nametag?: string }>;
  prefill?: L1SendPrefill;
  /** Render as centered modal dialog instead of slide-in panel */
  asModal?: boolean;
}

export function SendModal({ show, selectedAddress, onClose, onSend, vestingBalances: propBalances, onEstimateFee, onResolveAddress, prefill, asModal }: SendModalProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [vestingMode, setVestingMode] = useState<VestingMode>("all");
  const [balances, setBalances] = useState<VestingBalances>({ vested: 0n, unvested: 0n, all: 0n });
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [preview, setPreview] = useState<TxPreview | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const prefillApplied = useRef(false);

  // Reset on close and sync balances when modal opens
  useEffect(() => {
    if (!show) {
      setDestination("");
      setAmount("");
      setError(null);
      setVestingMode("all");
      setStep('input');
      setPreview(null);
      prefillApplied.current = false;
    } else if (propBalances) {
      setBalances(propBalances);
    }
  }, [show, selectedAddress, propBalances]);

  // Apply prefill
  useEffect(() => {
    if (!show || !prefill || prefillApplied.current) return;
    prefillApplied.current = true;
    setDestination(prefill.to);
    setAmount(prefill.amount);
  }, [show, prefill]);

  const handleModeChange = (mode: VestingMode) => {
    setVestingMode(mode);
    setAmount("");
  };

  const getCurrentBalance = (): bigint => {
    return balances[vestingMode];
  };

  const handlePrepare = async () => {
    if (!destination.trim() || !amount.trim()) {
      setError("Please fill in all fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setError(null);
    setIsPreparing(true);

    try {
      const amountSats = Math.round(numAmount * 1e8).toString();

      // Resolve address (nametag → L1 address)
      let resolvedAddress = destination;
      let nametag: string | undefined;
      if (onResolveAddress) {
        try {
          const resolved = await onResolveAddress(destination);
          resolvedAddress = resolved.address;
          nametag = resolved.nametag;
        } catch (err) {
          setError(getErrorMessage(err));
          setIsPreparing(false);
          return;
        }
      }

      // Estimate fee
      let feeSats = "10000"; // default
      if (onEstimateFee) {
        try {
          const est = await onEstimateFee(resolvedAddress, amountSats);
          feeSats = est.fee;
        } catch {
          // use default fee
        }
      }

      const feeAlpha = (parseInt(feeSats, 10) / 1e8).toFixed(8);
      const totalAlpha = (numAmount + parseInt(feeSats, 10) / 1e8).toFixed(8);

      setPreview({
        resolvedAddress,
        nametag,
        amountAlpha: numAmount.toFixed(8),
        amountSats,
        feeSats,
        feeAlpha,
        totalAlpha,
      });
      setStep('confirm');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsPreparing(false);
    }
  };

  const handleConfirmSend = async () => {
    if (!preview) return;
    setError(null);

    try {
      await onSend(preview.resolvedAddress, amount);
      onClose({ success: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <WalletScreen isOpen={show} onClose={() => onClose()} asModal={asModal}>
      <ModalHeader
        variant="screen"
        title={step === 'confirm' ? 'Confirm Transaction' : 'Send ALPHA'}
        onClose={step === 'confirm' ? () => { setStep('input'); setError(null); } : () => onClose()}
      />

      <div className="px-6 py-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'input' ? (
              <motion.div
                key="input"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                {/* Vesting Mode Selector */}
                <div className="mb-5">
                  <label className="text-sm text-neutral-500 dark:text-white/45 block mb-2">
                    Coin Type
                  </label>
                  <div className="flex gap-3">
                    {([
                      { value: 'all' as VestingMode, label: 'All', balance: balances.all },
                      { value: 'vested' as VestingMode, label: 'Vested', balance: balances.vested },
                      { value: 'unvested' as VestingMode, label: 'Unvested', balance: balances.unvested },
                    ]).map((option) => {
                      const isSelected = vestingMode === option.value;
                      const colorClass = option.value === 'vested'
                        ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                        : option.value === 'unvested'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          : 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400';

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleModeChange(option.value)}
                          className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? colorClass
                              : 'border-neutral-200 dark:border-white/8 bg-neutral-100 dark:bg-white/6 text-neutral-600 dark:text-white/45 hover:border-neutral-300 dark:hover:border-white/10'
                          }`}
                        >
                          <div className="text-sm font-semibold">{option.label}</div>
                          <div className="text-xs font-mono mt-1">
                            {(Number(option.balance) / 1e8).toFixed(4)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-neutral-500 dark:text-white/45 block mb-2">
                    Destination Address
                  </label>
                  <input
                    autoFocus
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePrepare()}
                    className="w-full bg-neutral-100 dark:bg-white/6 border border-neutral-200 dark:border-white/10 rounded-xl py-3 px-4 text-neutral-900 dark:text-white focus:border-orange-500 outline-none font-mono text-sm"
                    placeholder="Enter wallet address or @nametag"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <label className="text-neutral-500 dark:text-white/45">Amount</label>
                    <span className="text-neutral-500 dark:text-white/45">
                      Available:{" "}
                      <span className="text-neutral-900 dark:text-white">
                        {(Number(getCurrentBalance()) / 1e8).toFixed(8)} ALPHA
                      </span>
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePrepare()}
                      className="w-full bg-neutral-100 dark:bg-white/6 border border-neutral-200 dark:border-white/10 rounded-xl py-3 px-4 pr-32 text-neutral-900 dark:text-white text-2xl font-mono focus:border-orange-500 outline-none"
                      placeholder="0.00"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const balance = Number(getCurrentBalance()) / 1e8;
                          setAmount(String(Math.floor(balance * 0.25 * 1e8) / 1e8));
                        }}
                        className="px-2 py-1 text-xs bg-neutral-200 dark:bg-white/6 text-neutral-700 dark:text-white/65 rounded hover:bg-neutral-300 dark:hover:bg-white/10"
                      >
                        25%
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const balance = Number(getCurrentBalance()) / 1e8;
                          setAmount(String(Math.floor(balance * 0.5 * 1e8) / 1e8));
                        }}
                        className="px-2 py-1 text-xs bg-neutral-200 dark:bg-white/6 text-neutral-700 dark:text-white/65 rounded hover:bg-neutral-300 dark:hover:bg-white/10"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const balance = Number(getCurrentBalance()) / 1e8;
                          setAmount(String(balance));
                        }}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 text-white rounded"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <button
                  onClick={handlePrepare}
                  disabled={!destination || !amount || isPreparing}
                  className="w-full py-3 bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/25"
                >
                  {isPreparing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      Review Transaction
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                {preview && (
                  <div className="space-y-4">
                    {/* Recipient */}
                    <div className="bg-neutral-100 dark:bg-white/6 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-neutral-500 dark:text-white/45">Recipient</span>
                      </div>
                      {preview.nametag && (
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          @{preview.nametag}
                        </div>
                      )}
                      <div className="text-xs font-mono text-neutral-700 dark:text-white/65 break-all">
                        {preview.resolvedAddress}
                      </div>
                    </div>

                    {/* Amount details */}
                    <div className="bg-neutral-100 dark:bg-white/6 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500 dark:text-white/45">Amount</span>
                        <span className="text-sm font-mono text-neutral-900 dark:text-white">
                          {preview.amountAlpha} ALPHA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500 dark:text-white/45">Network Fee</span>
                        <span className="text-sm font-mono text-neutral-900 dark:text-white">
                          {preview.feeAlpha} ALPHA
                        </span>
                      </div>
                      <div className="border-t border-neutral-200 dark:border-white/8 pt-3 flex justify-between">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">Total</span>
                        <span className="text-sm font-mono font-semibold text-neutral-900 dark:text-white">
                          {preview.totalAlpha} ALPHA
                        </span>
                      </div>
                    </div>

                    {/* From */}
                    <div className="bg-neutral-100 dark:bg-white/6 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-neutral-500 dark:text-white/45">From</span>
                      </div>
                      <div className="text-xs font-mono text-neutral-700 dark:text-white/65 mt-1 break-all">
                        {selectedAddress}
                      </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                      onClick={handleConfirmSend}
                      className="w-full py-3 bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xl shadow-orange-500/25"
                    >
                      Confirm & Send
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </WalletScreen>
  );
}
