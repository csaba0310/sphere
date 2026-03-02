import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertCircle, FileJson } from "lucide-react";
import { WalletScreen } from "../../../ui/WalletScreen";
import { ModalHeader } from "../../../ui";

interface SaveWalletModalProps {
  show: boolean;
  onConfirm: (filename: string, password?: string) => void;
  onCancel: () => void;
  /** Whether mnemonic is available (shows indicator) */
  hasMnemonic?: boolean;
}

export function SaveWalletModal({ show, onConfirm, onCancel, hasMnemonic }: SaveWalletModalProps) {
  const [filename, setFilename] = useState("alpha_wallet_backup");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    setError("");
    if (password) {
      if (password !== passwordConfirm) {
        setError("Passwords do not match!");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters");
        return;
      }
    }

    onConfirm(filename, password || undefined);

    // Reset state
    setFilename("alpha_wallet_backup");
    setPassword("");
    setPasswordConfirm("");
    setError("");
  };

  return (
    <WalletScreen isOpen={show} onClose={onCancel}>
      <ModalHeader variant="screen" title="Backup Wallet" onClose={onCancel} />
      <div className="px-6 py-8 flex flex-col flex-1 overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4"
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ delay: 0.2, duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Shield className="w-7 h-7 text-orange-500" />
            </motion.div>
          </motion.div>
          <p className="text-xs text-neutral-500 dark:text-white/45">
            Export your wallet keys to a JSON file. Keep this safe!
          </p>
        </div>

        {/* Format indicator */}
        <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <FileJson className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-500 font-medium">JSON Format</span>
          {hasMnemonic && (
            <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">
              +mnemonic
            </span>
          )}
        </div>

        <p className="text-[10px] text-neutral-400 mb-4 text-center">
          Includes verification address{hasMnemonic ? " and recovery phrase" : ""}
        </p>

        <label className="text-xs text-neutral-500 mb-1 block">
          Filename
        </label>
        <input
          placeholder="Filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          className="w-full mb-3 px-4 py-3 bg-neutral-100 dark:bg-white/6 rounded-xl text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 border border-neutral-200 dark:border-white/8 focus:border-orange-500 outline-none transition-colors"
        />

        <label className="text-xs text-neutral-500 mb-1 block">
          Encryption Password (Optional)
        </label>
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 px-4 py-3 bg-neutral-100 dark:bg-white/6 rounded-xl text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 border border-neutral-200 dark:border-white/8 focus:border-orange-500 outline-none transition-colors"
        />

        <input
          placeholder="Confirm Password"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full mb-4 px-4 py-3 bg-neutral-100 dark:bg-white/6 rounded-xl text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 border border-neutral-200 dark:border-white/8 focus:border-orange-500 outline-none transition-colors"
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-900/50 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}

        <div className="flex gap-3 mt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 py-3 bg-neutral-100 dark:bg-white/6 rounded-xl text-neutral-700 dark:text-white/65 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors font-medium"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-orange-500/20"
          >
            Save
          </motion.button>
        </div>
      </div>
    </WalletScreen>
  );
}
