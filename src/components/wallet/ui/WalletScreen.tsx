import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { BaseModal } from './BaseModal';

interface WalletScreenProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** Render as a centered modal dialog instead of a slide-in panel */
  asModal?: boolean;
}

export function WalletScreen({ isOpen, onClose, children, className = '', asModal = false }: WalletScreenProps) {
  if (asModal) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} size="lg" className={className}>
        {children}
      </BaseModal>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0.08, duration: 0.38 }}
          className={`absolute inset-0 z-10 bg-white dark:bg-modal-bg overflow-y-auto flex flex-col will-change-transform ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
