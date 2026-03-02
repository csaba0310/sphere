import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";
import { WalletScreen } from "../../../ui/WalletScreen";
import { ModalHeader } from "../../../ui";

interface LoadPasswordModalProps {
  show: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

export function LoadPasswordModal({ show, onConfirm, onCancel }: LoadPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    setError("");
    if (!password) {
      setError("Please enter password");
      return;
    }
    onConfirm(password);
    setPassword("");
    setError("");
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onCancel();
  };

  return (
    <WalletScreen isOpen={show} onClose={handleCancel}>
      <ModalHeader variant="screen" title="Enter Password" onClose={handleCancel} />
      <div className="px-6 flex-1 flex flex-col justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4"
          >
            <Lock className="w-7 h-7 text-orange-500" />
          </motion.div>
          <p className="text-neutral-500 dark:text-white/45 text-sm">
            This wallet is encrypted. Please enter your password to unlock it.
          </p>
        </motion.div>

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleConfirm();
            }
          }}
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
            onClick={handleCancel}
            className="flex-1 py-3 bg-neutral-100 dark:bg-white/6 rounded-xl text-neutral-700 dark:text-white/65 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors font-medium"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium transition-colors"
          >
            Unlock
          </motion.button>
        </div>
      </div>
    </WalletScreen>
  );
}
