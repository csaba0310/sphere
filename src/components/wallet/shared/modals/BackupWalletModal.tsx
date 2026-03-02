import { Download, Key, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { MenuButton, ModalHeader } from '../../ui';
import { WalletScreen } from '../../ui/WalletScreen';

interface BackupWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportWalletFile: () => void;
  onShowRecoveryPhrase: () => void;
  hasMnemonic?: boolean;
}

export function BackupWalletModal({
  isOpen,
  onClose,
  onExportWalletFile,
  onShowRecoveryPhrase,
  hasMnemonic = true,
}: BackupWalletModalProps) {
  return (
    <WalletScreen isOpen={isOpen} onClose={onClose}>
      <ModalHeader variant="screen" title="Backup Wallet" onClose={onClose} />
      <div className="flex-1 flex flex-col justify-center px-6 pb-8">
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4"
          >
            <ShieldCheck className="w-8 h-8 text-orange-500" />
          </motion.div>
          <p className="text-sm text-neutral-500 dark:text-white/45">
            Choose how you want to backup your wallet
          </p>
        </div>

        <div className="space-y-3">
          <MenuButton
            icon={Download}
            color="blue"
            label="Export Wallet File"
            subtitle="Download encrypted JSON file"
            showChevron={false}
            onClick={() => {
              onClose();
              onExportWalletFile();
            }}
          />

          <MenuButton
            icon={Key}
            color="orange"
            label="Show Recovery Phrase"
            subtitle={hasMnemonic ? 'View 12-word seed phrase' : 'Not available for legacy wallets'}
            showChevron={false}
            disabled={!hasMnemonic}
            onClick={() => {
              onClose();
              onShowRecoveryPhrase();
            }}
          />

          <button
            onClick={onClose}
            className="w-full py-3 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </WalletScreen>
  );
}
