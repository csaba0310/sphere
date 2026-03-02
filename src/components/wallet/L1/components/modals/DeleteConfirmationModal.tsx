import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Download, Loader2, ShieldAlert, Trash2 } from "lucide-react";
import { useGlobalSyncStatus } from "../../../../../hooks/useGlobalSyncStatus";
import { WalletScreen } from "../../../ui/WalletScreen";
import { ModalHeader } from "../../../ui";

interface DeleteConfirmationModalProps {
  show: boolean;
  onConfirmDelete: () => void;
  onSaveFirst: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  show,
  onConfirmDelete,
  onSaveFirst,
  onCancel,
}: DeleteConfirmationModalProps) {
  const { isAnySyncing, statusMessage } = useGlobalSyncStatus();
  const [showSyncWarning, setShowSyncWarning] = useState(false);

  const handleDeleteClick = () => {
    if (isAnySyncing) {
      setShowSyncWarning(true);
    } else {
      onConfirmDelete();
    }
  };

  const handleForceDelete = () => {
    setShowSyncWarning(false);
    onConfirmDelete();
  };

  const handleCloseSyncWarning = () => {
    setShowSyncWarning(false);
    onCancel();
  };

  return (
    <WalletScreen isOpen={show} onClose={onCancel}>
      <ModalHeader
        variant="screen"
        title={showSyncWarning ? "Sync in Progress" : "Delete Wallet"}
        onClose={showSyncWarning ? handleCloseSyncWarning : onCancel}
      />
      <div className="px-6 py-8 flex flex-col flex-1">
      <AnimatePresence mode="wait">
        {showSyncWarning ? (
          <motion.div
            key="sync-warning"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-4"
              >
                {isAnySyncing ? (
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                ) : (
                  <Trash2 className="w-6 h-6 text-green-500" />
                )}
              </motion.div>
              <h3 className="text-neutral-900 dark:text-white text-xl font-bold mb-2">
                {isAnySyncing ? "Sync in Progress" : "Sync Complete"}
              </h3>
              <p className="text-neutral-500 dark:text-white/45 text-sm mb-2">
                {isAnySyncing
                  ? "Your data is being synchronized to IPFS."
                  : "All data has been synchronized."}
              </p>
              <p className={`text-sm font-medium ${isAnySyncing ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}>
                {statusMessage}
              </p>
              {isAnySyncing && (
                <p className="text-neutral-500 text-xs mt-3">
                  Deleting now may result in data loss on other devices.
                  <br />
                  Please wait for sync to complete.
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                whileHover={!isAnySyncing ? { scale: 1.02 } : {}}
                whileTap={!isAnySyncing ? { scale: 0.98 } : {}}
                onClick={isAnySyncing ? undefined : handleForceDelete}
                disabled={isAnySyncing}
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                  isAnySyncing
                    ? "bg-neutral-200 dark:bg-white/6 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-500"
                }`}
              >
                {isAnySyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Waiting for Sync...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Wallet
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleForceDelete}
                className="w-full py-3 bg-red-600/10 text-red-500 border border-red-200 dark:border-red-900/50 rounded-xl font-medium hover:bg-red-600 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                I Understand the Risks - Delete Now
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="delete-confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center text-center mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </motion.div>
              </motion.div>
              <h3 className="text-neutral-900 dark:text-white text-xl font-bold mb-2">
                Delete Wallet?
              </h3>
              <p className="text-neutral-500 dark:text-white/45 text-sm">
                Are you sure you want to delete this wallet? <br />
                <span className="text-red-500 dark:text-red-400 font-semibold">
                  This action cannot be undone.
                </span>
              </p>
              <p className="text-neutral-500 text-xs mt-2">
                If you haven't saved your backup, your funds will be lost forever.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSaveFirst}
                className="w-full py-3 bg-neutral-100 dark:bg-white/6 rounded-xl text-neutral-700 dark:text-white font-medium border border-neutral-200 dark:border-white/8 hover:bg-neutral-200 dark:hover:bg-white/10 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Save Backup First
              </motion.button>

              <div className="flex gap-3 mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="flex-1 py-3 bg-neutral-100 dark:bg-white/6 rounded-xl text-neutral-700 dark:text-white font-medium hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteClick}
                  className="flex-1 py-3 bg-red-600/20 text-red-500 border border-red-200 dark:border-red-900/50 rounded-xl font-medium hover:bg-red-600 hover:text-white transition-all"
                >
                  Delete Anyway
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </WalletScreen>
  );
}
